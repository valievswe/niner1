// src/services/stats.services.js

const prisma = require("../lib/prisma");

class StatsService {
  async getAdminDashboardStats() {
    const [totalStudents, totalTemplates, awaitingMarking] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.mockExamTemplate.count(),
      prisma.scheduledMockExam.count({
        where: { status: "COMPLETED" },
      }),
    ]);

    return {
      totalStudents,
      totalTemplates,
      awaitingMarking,
    };
  }
}

module.exports = new StatsService();
