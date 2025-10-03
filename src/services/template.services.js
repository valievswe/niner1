const prisma = require("../lib/prisma");

class TemplateService {
  /**
   * Creates a new mock exam template and links its questions.
   * This operation is a transaction.
   * @param {Object} templateData - { title, description }
   * @param {Array} questions - An array of { questionId, order }
   * @param {String} adminId - The ID of the admin creating the template.
   * @returns {Promise<Object>} The newly created template with its questions.
   */
  async createTemplate(templateData, questions, adminId) {
    const { title, description, sectionDurations, audioFiles } = templateData;

    return prisma.$transaction(async (tx) => {
      const newTemplate = await tx.mockExamTemplate.create({
        data: {
          title,
          description,
          adminId,
          sectionDurations,
          audioFiles: audioFiles || {},
        },
      });

      const templateQuestionsData = questions.map((q) => ({
        templateId: newTemplate.id,
        questionId: q.questionId,
        order: q.order,
      }));

      await tx.mockExamTemplateQuestion.createMany({
        data: templateQuestionsData,
      });

      return newTemplate;
    });
  }

  async getAllTemplates() {
    return prisma.mockExamTemplate.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Retrieves a single template by its ID, including its questions in order.
   * @param {String} id - The ID of the template.
   * @returns {Promise<Object>} The template with its questions.
   */
  async getTemplateById(id) {
    return prisma.mockExamTemplate.findUnique({
      where: { id: id },
      include: {
        questions: {
          select: {
            order: true,
            question: {
              select: {
                id: true,
                section: true,
                questionType: true,
                content: true,
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });
  }

  async updateTemplate(id, templateData, questions) {
    const { title, description, sectionDurations, audioFiles } = templateData;

    return prisma.$transaction(async (tx) => {
      const updatedTemplate = await tx.mockExamTemplate.update({
        where: { id: id },
        data: {
          title,
          description,
          sectionDurations,
          audioFiles,
        },
      });

      await tx.mockExamTemplateQuestion.deleteMany({
        where: { templateId: id },
      });

      const templateQuestionsData = questions.map((q) => ({
        templateId: id,
        questionId: q.questionId,
        order: q.order,
      }));

      if (templateQuestionsData.length > 0) {
        await tx.mockExamTemplateQuestion.createMany({
          data: templateQuestionsData,
        });
      }

      return updatedTemplate;
    });
  }

  async deleteTemplate(id) {
    return prisma.mockExamTemplate.delete({
      where: { id: id },
    });
  }
}

module.exports = new TemplateService();
