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

  async getAllQuestions(page, limit) {
    const skip = (page - 1) * limit;

    // Use a transaction to get both the data and the total count efficiently
    const [questions, totalItems] = await prisma.$transaction([
      prisma.question.findMany({
        skip: skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        // Include the related questionSet to display its name in the UI
        include: {
          questionSet: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.question.count(),
    ]);

    return {
      items: questions,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };
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
    const [templates, answers] = await Promise.all([
      prisma.mockExamTemplateQuestion.count({ where: { questionId: id } }),
      prisma.studentAnswer.count({ where: { questionId: id } }),
    ]);

    if (templates > 0 || answers > 0) {
      const error = new Error(
        "Cannot delete this question because it is still in use by exams or has student responses."
      );
      error.statusCode = 400;
      throw error;
    }

    return prisma.question.delete({ where: { id } });
  }
}

module.exports = new QuestionService();
