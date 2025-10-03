const cron = require("node-cron");
const prisma = require("./prisma");

// Schedule a task to run every minute
cron.schedule("* * * * *", async () => {
  console.log("Running cron job to check for expired exams...");

  try {
    const inProgressExams = await prisma.scheduledMockExam.findMany({
      where: { status: "IN_PROGRESS" },
      include: { template: true },
    });

    for (const exam of inProgressExams) {
      if (exam.startedAt && exam.template.sectionDurations) {
        const durations = exam.template.sectionDurations;
        const totalDurationMinutes = (
          (durations.listening || 0) +
          (durations.reading || 0) +
          (durations.writing || 0)
        );
        const deadline = new Date(
          exam.startedAt.getTime() + totalDurationMinutes * 60000
        );
        const currentTime = new Date();
        console.log(`Cron Job: Exam ${exam.id} - startedAt: ${exam.startedAt.toISOString()} (${exam.startedAt.getTime()})`);
        console.log(`Cron Job: Exam ${exam.id} - totalDurationMinutes: ${totalDurationMinutes}`);
        console.log(`Cron Job: Exam ${exam.id} - calculated deadline: ${deadline.toISOString()} (${deadline.getTime()})`);
        console.log(`Cron Job: Exam ${exam.id} - current time: ${currentTime.toISOString()} (${currentTime.getTime()})`);
        console.log(`Cron Job: Exam ${exam.id} - is current time > deadline? ${currentTime > deadline}`);

        if (currentTime > deadline) {
          await prisma.scheduledMockExam.update({
            where: { id: exam.id },
            data: { status: "COMPLETED", completedAt: new Date() },
          });
          console.log(`Exam ${exam.id} has been automatically completed.`);
        }
      }
    }
  } catch (error) {
    console.error("Error running cron job:", error);
  }
});
