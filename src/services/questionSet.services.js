const prisma = require("../lib/prisma");

class QuestionSetService {
  async createSet(setData, adminId) {
    const { name, description, section, passages } = setData;

    // Handle passages for READING section
    const passageData = [];
    if (section === "READING" && passages && Array.isArray(passages)) {
      for (const passage of passages) {
        if (passage.text && passage.text.trim() !== "") {
          passageData.push({
            partNumber: passage.partNumber,
            text: passage.text,
          });
        }
      }
    }

    return prisma.questionSet.create({
      data: {
        name,
        description,
        section,
        adminId,
        passages: {
          create: passageData,
        },
      },
      include: {
        passages: true,
      },
    });
  }

  async getAllSets(section) {
    const where = section ? { section } : {};
    return prisma.questionSet.findMany({
      where,
      include: {
        passages: {
          orderBy: {
            partNumber: "asc",
          },
        },
        questions: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateSet(id, setData) {
    const { name, description, passages, section } = setData;

    // Handle passages update
    let passageUpdate = undefined;
    if (section === "READING" && passages && Array.isArray(passages)) {
      // First, delete all existing passages
      await prisma.passage.deleteMany({
        where: { questionSetId: id },
      });

      // Then create new ones
      const newPassages = passages
        .filter((p) => p.text && p.text.trim() !== "")
        .map((p) => ({
          partNumber: p.partNumber,
          text: p.text,
        }));

      if (newPassages.length > 0) {
        passageUpdate = {
          create: newPassages,
        };
      }
    }

    return prisma.questionSet.update({
      where: { id },
      data: {
        name,
        description,
        passages: passageUpdate,
      },
      include: {
        passages: {
          orderBy: {
            partNumber: "asc",
          },
        },
      },
    });
  }

  async deleteSet(id) {
    return prisma.questionSet.delete({
      where: { id },
    });
  }
}

module.exports = new QuestionSetService();
