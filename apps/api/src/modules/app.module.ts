import type { FastifyInstance } from "fastify";

export async function registerApp(app: FastifyInstance) {
  // Минимальный health для проверки, без NestJS
  app.get("/health", async () => ({ ok: true }));

  // TODO: позже подключим реальные fastify-модули:
  // await app.register(usersRoutes, { prefix: "/users" });
  // await app.register(authRoutes, { prefix: "/auth" });
}
