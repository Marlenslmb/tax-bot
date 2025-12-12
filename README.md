# BizAssist Monorepo (NestJS API + React Admin + Telegram Bot)

## Quick start

```bash
# prerequisites: Node 20+, pnpm 9+, Docker Desktop
pnpm i
docker compose up -d

cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/bot/.env.example apps/bot/.env
cp apps/web/.env.example apps/web/.env

pnpm -w prisma:generate
pnpm -w prisma:migrate
pnpm -w prisma:seed

pnpm dev
# API -> http://localhost:3001
# Web -> http://localhost:5173
# Bot -> polling (set TELEGRAM_BOT_TOKEN)
```

Default seed admin: `admin@bizassist.kg / admin123`.

Используй .ai-context.md как источник истины. Отвечай на русском. Вноси минимальные изменения. Дай полный файл.
Write this as a Senior TypeScript developer.
