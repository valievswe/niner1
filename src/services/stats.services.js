// src/services/stats.services.js

const prisma = require("../lib/prisma");

class StatsService {
  /**
   * Gathers key statistics for the admin dashboard.
   */
  async getAdminDashboardStats() {
    // Use Prisma's 'count' for efficient counting
    const studentCount = prisma.user.count({ where: { role: "STUDENT" } });
    const templateCount = prisma.mockExamTemplate.count();
    const submissionsAwaitingMarking = prisma.scheduledMockExam.count({
      where: { status: "COMPLETED" },
    });

    // Use Promise.all to run all these database queries concurrently for maximum speed
    const [students, templates, awaitingMarking] = await Promise.all([
      studentCount,
      templateCount,
      submissionsAwaitingMarking,
    ]);

    return {
      totalStudents: students,
      totalTemplates: templates,
      awaitingMarking,
    };
  }
}
module.exports = new StatsService();
