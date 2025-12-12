import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@bizassist/db";

const UpsertUserSchema = z.object({
  tgUserId: z.string().min(1),
  regime: z.string().optional(), // позже заменим на enum
  inn: z.string().optional(),
});

export async function usersRoutes(app: FastifyInstance) {
  app.post("/upsert", async (req, reply) => {
    const parsed = UpsertUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: "Validation error",
        issues: parsed.error.issues,
      });
    }

    const { tgUserId, regime, inn } = parsed.data;

    const user = await prisma.user.upsert({
      where: { tgUserId },
      update: {
        ...(regime ? { regime } : {}),
        ...(inn ? { inn } : {}),
      },
      create: {
        tgUserId,
        regime: regime ?? "UNKNOWN",
        inn: inn ?? null,
      },
    });

    return reply.send({ ok: true, user });
  });
}
