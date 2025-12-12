// apps/api/src/lib/env.ts
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // Server
  PORT: z.coerce.number().int().positive().default(3001),
  HOST: z.string().default("0.0.0.0"),

  // Auth
  JWT_SECRET: z.string().min(20, "JWT_SECRET must be at least 20 chars"),
  JWT_TTL: z.string().min(1), // примеры: 15m, 1h
  REFRESH_TTL: z.string().min(1), // примеры: 7d, 30d

  // DB
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
});

export type Env = z.infer<typeof EnvSchema>;
export const env: Env = EnvSchema.parse(process.env);
