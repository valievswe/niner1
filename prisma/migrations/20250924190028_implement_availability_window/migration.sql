/*
  Warnings:

  - You are about to drop the column `scheduledAt` on the `ScheduledMockExam` table. All the data in the column will be lost.
  - Added the required column `endAvailableAt` to the `ScheduledMockExam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startAvailableAt` to the `ScheduledMockExam` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ScheduledMockExam" DROP COLUMN "scheduledAt",
ADD COLUMN     "endAvailableAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startAvailableAt" TIMESTAMP(3) NOT NULL;
