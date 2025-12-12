/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `telegramId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tgUserId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tgUserId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TaxRegime" AS ENUM ('PATENT', 'SIMPLIFIED', 'GENERAL', 'UNKNOWN');

-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_telegramId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "fullName",
DROP COLUMN "password",
DROP COLUMN "role",
DROP COLUMN "telegramId",
ADD COLUMN     "inn" TEXT,
ADD COLUMN     "regime" "TaxRegime" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "tgName" TEXT,
ADD COLUMN     "tgUserId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "Calculation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "regime" "TaxRegime" NOT NULL,
    "income" DECIMAL(65,30),
    "taxAmount" DECIMAL(65,30) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Calculation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_tgUserId_key" ON "User"("tgUserId");

-- AddForeignKey
ALTER TABLE "Calculation" ADD CONSTRAINT "Calculation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
