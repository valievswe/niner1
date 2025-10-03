// src/services/questionSet.service.js
const prisma = require("../lib/prisma");

class QuestionSetService {
  async createSet(setData, adminId, passage) {
    const { name, description, section } = setData;
    return prisma.questionSet.create({
      data: { name, description, section, adminId, passage },
    });
  }

  async getAllSets(section) {
    const where = section ? { section } : {};
    return prisma.questionSet.findMany({
      where,
      include: {
        questions: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateSet(id, setData) {
    const { name, description, passage } = setData;
    return prisma.questionSet.update({
      where: { id: id },
      data: {
        name,
        description,
        passage,
      },
    });
  }

  async deleteSet(id) {
    return prisma.questionSet.delete({
      where: { id: id },
    });
  }
}
module.exports = new QuestionSetService();
