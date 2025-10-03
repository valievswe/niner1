-- DropForeignKey
ALTER TABLE "public"."ScheduledMockExam" DROP CONSTRAINT "ScheduledMockExam_templateId_fkey";

-- AddForeignKey
ALTER TABLE "public"."ScheduledMockExam" ADD CONSTRAINT "ScheduledMockExam_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."MockExamTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
