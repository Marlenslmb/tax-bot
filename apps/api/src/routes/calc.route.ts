import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@bizassist/db";

const CalcSchema = z.object({
  tgUserId: z.string().min(1),
  regime: z.string().min(1),
  income: z.coerce.number().finite().nonnegative(),
});

export async function calcRoutes(app: FastifyInstance) {
  app.post("/", async (req, reply) => {
    const parsed = CalcSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: "Validation error",
        issues: parsed.error.issues,
      });
    }

    const { tgUserId, regime, income } = parsed.data;

    // MVP: простая формула-заглушка
    // Потом вынесем в packages/core и сделаем реальные режимы
    const tax = Math.round(income * 0.02); // 2% как временный пример
    const result = { tax, income, regime };

    // Сохраним в историю (если у тебя есть таблица Calculation/History)
    // Если таблицы нет — временно вернём без записи.
    try {
      await prisma.calculation.create({
        data: {
          tgUserId,
          regime,
          income,
          tax,
        },
      });
    } catch {
      // не валим API, если таблицы ещё нет
    }

    return reply.send({ ok: true, result });
  });
}
