// src/services/question.services.js

const prisma = require("../lib/prisma");

class QuestionService {
  /**
   * Creates a new question in the database.
   * @param {Object} questionData - The data for the new question.
   * @returns {Promise<Object>} The newly created question.
   */
  async createQuestion(questionData) {
    const {
      section,
      questionType,
      partNumber,
      content,
      answer,
      explanation,
      questionSetId,
    } = questionData;

    const newQuestion = await prisma.question.create({
      data: {
        section,
        questionType,
        partNumber,
        content,
        answer,
        explanation,
        questionSetId,
      },
    });
    return newQuestion;
  }

  async getAllQuestions() {
    return prisma.question.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getQuestionById(id) {
    return prisma.question.findUnique({ where: { id } });
  }

  async updateQuestion(id, updateData) {
    const { content, answer, explanation, partNumber } = updateData;
    return prisma.question.update({
      where: { id: id },
      data: {
        content,
        answer,
        explanation,
        partNumber,
      },
    });
  }

  async deleteQuestion(id) {
    return prisma.question.delete({
      where: { id: id },
    });
  }
}

module.exports = new QuestionService();
