/*
  Warnings:

  - Added the required column `durationInMinutes` to the `MockExamTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."MockExamTemplate" ADD COLUMN     "durationInMinutes" INTEGER NOT NULL;
