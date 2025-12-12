import type { FastifyInstance } from "fastify";

import { healthRoutes } from "./routes/health.route";
import { usersRoutes } from "./routes/users.route";
import { calcRoutes } from "./routes/calc.route";
import { historyRoutes } from "./routes/history.route";

export async function registerApp(app: FastifyInstance) {
  await app.register(healthRoutes);
  await app.register(usersRoutes, { prefix: "/users" });
  await app.register(calcRoutes, { prefix: "/calc" });
  await app.register(historyRoutes, { prefix: "/history" });
}
