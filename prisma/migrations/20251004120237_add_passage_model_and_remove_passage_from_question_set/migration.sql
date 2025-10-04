/*
  Warnings:

  - You are about to drop the column `passage` on the `QuestionSet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."QuestionSet" DROP COLUMN "passage";

-- CreateTable
CREATE TABLE "public"."Passage" (
    "id" TEXT NOT NULL,
    "partNumber" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "questionSetId" TEXT NOT NULL,

    CONSTRAINT "Passage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Passage_questionSetId_partNumber_key" ON "public"."Passage"("questionSetId", "partNumber");

-- AddForeignKey
ALTER TABLE "public"."Passage" ADD CONSTRAINT "Passage_questionSetId_fkey" FOREIGN KEY ("questionSetId") REFERENCES "public"."QuestionSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
