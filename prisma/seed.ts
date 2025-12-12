import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const hash = await argon2.hash("admin123");

  await prisma.user.upsert({
    where: { email: "admin@bizassist.kg" },
    update: {
      // важно: обновляем пароль, если пользователь уже есть
      password: hash,
      fullName: "Admin",
      role: "ADMIN",
    },
    create: {
      email: "admin@bizassist.kg",
      password: hash,
      fullName: "Admin",
      role: "ADMIN",
    },
  });
}

main().finally(() => prisma.$disconnect());
