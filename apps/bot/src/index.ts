import "dotenv/config";
import { Bot, InlineKeyboard } from "grammy";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is missing in env");

const API = process.env.API_URL ?? "http://localhost:3001";

const bot = new Bot(token);

// MVP state (in-memory)
type Regime = "UNKNOWN" | "PATENT" | "SIMPLIFIED" | "GENERAL";
type Step = "IDLE" | "AWAITING_REGIME" | "AWAITING_INCOME";

const userRegime = new Map<string, Regime>();
const userStep = new Map<string, Step>();

async function api<T>(path: string, data?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: data ? "POST" : "GET",
    headers: data ? { "Content-Type": "application/json" } : undefined,
    body: data ? JSON.stringify(data) : undefined,
  });

  const json = (await res.json().catch(() => null)) as T | null;
  if (!res.ok)
    throw new Error(`API error ${res.status}: ${JSON.stringify(json)}`);
  if (!json) throw new Error("API returned empty response");
  return json;
}

function regimeKeyboard() {
  return new InlineKeyboard()
    .text("Патент", "regime:PATENT")
    .text("Упрощёнка", "regime:SIMPLIFIED")
    .row()
    .text("Общий", "regime:GENERAL");
}

function afterCalcKeyboard() {
  return new InlineKeyboard()
    .text("🔁 Новый расчёт", "action:calc_again")
    .row()
    .text("🔄 Сменить режим", "action:change_regime")
    .text("📜 История", "action:history");
}

bot.command("start", async (ctx) => {
  const tgUserId = String(ctx.from!.id);

  await api("/users/upsert", {
    tgUserId,
    tgName: ctx.from?.username ?? ctx.from?.first_name,
    regime: "UNKNOWN",
  });

  userRegime.set(tgUserId, "UNKNOWN");
  userStep.set(tgUserId, "AWAITING_REGIME");

  await ctx.reply(
    "Привет! Выбери режим налогообложения.\nЕсли не уверен — выбери примерно, потом уточним.",
    { reply_markup: regimeKeyboard() }
  );
});

bot.callbackQuery(/^regime:(PATENT|SIMPLIFIED|GENERAL)$/, async (ctx) => {
  const tgUserId = String(ctx.from!.id);
  const regime = (ctx.match?.[1] ?? "UNKNOWN") as Regime;

  const current = userRegime.get(tgUserId) ?? "UNKNOWN";
  if (current !== "UNKNOWN") {
    await ctx.answerCallbackQuery({
      text: "Режим уже выбран. Если нужно — нажми «Сменить режим».",
    });
    return;
  }

  await api("/users/upsert", { tgUserId, regime });

  userRegime.set(tgUserId, regime);
  userStep.set(tgUserId, "AWAITING_INCOME");

  await ctx.answerCallbackQuery();

  // ВАЖНО: редактируем сообщение с кнопками — так кнопки исчезнут
  try {
    await ctx.editMessageText(
      `Ок, режим: ${regime}\nТеперь отправь сумму дохода числом (например: 50000).`
    );
  } catch {
    // если Telegram не дал редактировать (редкий кейс) — просто ответим новым сообщением
    await ctx.reply(
      `Ок, режим: ${regime}\nТеперь отправь сумму дохода числом (например: 50000).`
    );
  }
});

bot.callbackQuery(
  /^action:(calc_again|change_regime|history)$/,
  async (ctx) => {
    const tgUserId = String(ctx.from!.id);
    const action = ctx.match?.[1];

    await ctx.answerCallbackQuery();

    if (action === "calc_again") {
      const regime = userRegime.get(tgUserId) ?? "UNKNOWN";
      if (regime === "UNKNOWN") {
        userStep.set(tgUserId, "AWAITING_REGIME");
        await ctx.reply("Сначала выбери режим:", {
          reply_markup: regimeKeyboard(),
        });
        return;
      }
      userStep.set(tgUserId, "AWAITING_INCOME");
      await ctx.reply("Ок. Отправь сумму дохода числом (например: 50000).");
      return;
    }

    if (action === "change_regime") {
      userRegime.set(tgUserId, "UNKNOWN");
      userStep.set(tgUserId, "AWAITING_REGIME");
      await ctx.reply("Выбери новый режим:", {
        reply_markup: regimeKeyboard(),
      });
      return;
    }

    if (action === "history") {
      type HistoryItem = {
        createdAt?: string;
        regime?: string;
        tax?: number;
        income?: number;
      };
      type HistoryResponse = {
        ok: boolean;
        items: HistoryItem[];
        note?: string;
      };

      try {
        const data = await api<HistoryResponse>(`/history/${tgUserId}`);
        if (!data.items?.length) {
          await ctx.reply(
            data.note ? `История пуста. (${data.note})` : "История пуста."
          );
          return;
        }

        const lines = data.items.slice(0, 10).map((x) => {
          const dt = x.createdAt ? new Date(x.createdAt).toLocaleString() : "—";
          const r = x.regime ?? "—";
          const tax = x.tax ?? 0;
          const inc = x.income ?? 0;
          return `• ${dt} | ${r} | доход: ${inc} | налог: ${tax}`;
        });

        await ctx.reply(lines.join("\n"));
      } catch {
        await ctx.reply("История недоступна — API вернул ошибку.");
      }
    }
  }
);

bot.on("message:text", async (ctx) => {
  const text = ctx.message.text.trim();
  if (text.startsWith("/")) return;

  const tgUserId = String(ctx.from!.id);
  const step = userStep.get(tgUserId) ?? "IDLE";
  const regime = userRegime.get(tgUserId) ?? "UNKNOWN";

  if (step !== "AWAITING_INCOME") {
    await ctx.reply("Чтобы начать — напиши /start");
    return;
  }

  if (regime === "UNKNOWN") {
    userStep.set(tgUserId, "AWAITING_REGIME");
    await ctx.reply("Сначала выбери режим:", {
      reply_markup: regimeKeyboard(),
    });
    return;
  }

  const income = Number(text.replace(/\s+/g, ""));
  if (!Number.isFinite(income) || income < 0) {
    await ctx.reply("Напиши сумму числом, например: 50000");
    return;
  }

  type CalcResponse = {
    ok: boolean;
    result: { tax: number; income: number; regime: string };
  };

  try {
    const calc = await api<CalcResponse>("/calc", { tgUserId, regime, income });

    userStep.set(tgUserId, "IDLE");

    await ctx.reply(
      `Расчёт готов ✅\nДоход: ${calc.result.income}\nРежим: ${calc.result.regime}\nНалог: ${calc.result.tax}`,
      { reply_markup: afterCalcKeyboard() }
    );
  } catch {
    await ctx.reply(
      "Не смог посчитать — API недоступен или вернул ошибку. Попробуй позже."
    );
  }
});

bot.catch((err) => {
  console.error("BOT ERROR:", err.error);
});

bot.start();
