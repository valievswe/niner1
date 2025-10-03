const prisma = require("../lib/prisma");

class ScheduleService {
  /**
   * Schedules a mock exam for a student.
   * @param {Object} scheduleData - { studentId, templateId, scheduledAt }
   * @returns {Promise<Object>} The newly created scheduled exam record.
   */
  async scheduleExam(scheduleData) {
    const { studentId, templateId, startAvailableAt, endAvailableAt } =
      scheduleData;
    const newScheduledExam = await prisma.scheduledMockExam.create({
      data: {
        studentId,
        templateId,
        startAvailableAt: new Date(startAvailableAt),
        endAvailableAt: new Date(endAvailableAt),
      },
    });
    return newScheduledExam;
  }

  //students
  /**
   * Retrieves all scheduled exams for a specific student.
   * @param {String} studentId - The ID of the student.
   * @returns {Promise<Array>} A list of the student's scheduled exams.
   */
  async getScheduledExamsForStudent(studentId) {
    return prisma.scheduledMockExam.findMany({
      where: {
        studentId: studentId,
      },
      include: {
        template: {
          select: {
            title: true,
            description: true,
          },
        },
      },
      orderBy: {
        startAvailableAt: "asc",
      },
    });
  }

  async getAllScheduledExams() {
    return prisma.scheduledMockExam.findMany({
      include: {
        student: {
          select: { firstName: true, lastName: true, email: true },
        },
        template: {
          select: { title: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

module.exports = new ScheduleService();
