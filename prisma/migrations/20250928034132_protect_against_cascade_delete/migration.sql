-- DropForeignKey
ALTER TABLE "public"."MockExamTemplate" DROP CONSTRAINT "MockExamTemplate_adminId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MockExamTemplateQuestion" DROP CONSTRAINT "MockExamTemplateQuestion_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QuestionSet" DROP CONSTRAINT "QuestionSet_adminId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ScheduledMockExam" DROP CONSTRAINT "ScheduledMockExam_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StudentAnswer" DROP CONSTRAINT "StudentAnswer_questionId_fkey";

-- AddForeignKey
ALTER TABLE "public"."QuestionSet" ADD CONSTRAINT "QuestionSet_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MockExamTemplate" ADD CONSTRAINT "MockExamTemplate_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MockExamTemplateQuestion" ADD CONSTRAINT "MockExamTemplateQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScheduledMockExam" ADD CONSTRAINT "ScheduledMockExam_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentAnswer" ADD CONSTRAINT "StudentAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
