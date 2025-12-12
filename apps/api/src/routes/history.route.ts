import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@bizassist/db";

export async function historyRoutes(app: FastifyInstance) {
  app.get("/:tgUserId", async (req, reply) => {
    const schema = z.object({ tgUserId: z.string().min(1) });
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      return reply.status(400).send({ message: "Validation error" });
    }

    const { tgUserId } = parsed.data;

    try {
      const items = await prisma.calculation.findMany({
        where: { tgUserId },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      return reply.send({ ok: true, items });
    } catch {
      // если таблицы нет — честно скажем
      return reply.send({
        ok: true,
        items: [],
        note: "History table not ready yet",
      });
    }
  });
}
