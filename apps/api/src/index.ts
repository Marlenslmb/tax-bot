// apps/api/src/index.ts
import "dotenv/config.js";
import Fastify from "fastify";
import { env } from "./lib/env";
import { registerApp } from "./app.module";

const app = Fastify({ logger: true });

await registerApp(app);

await app.listen({ port: env.PORT, host: env.HOST });
