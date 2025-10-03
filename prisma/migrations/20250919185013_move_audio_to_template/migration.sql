/*
  Warnings:

  - You are about to drop the column `audioFileUrl` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."MockExamTemplate" ADD COLUMN     "audioFiles" JSONB;

-- AlterTable
ALTER TABLE "public"."Question" DROP COLUMN "audioFileUrl";
