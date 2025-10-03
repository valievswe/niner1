/*
  Warnings:

  - You are about to drop the column `durationInMinutes` on the `MockExamTemplate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."MockExamTemplate" DROP COLUMN "durationInMinutes",
ADD COLUMN     "sectionDurations" JSONB;
