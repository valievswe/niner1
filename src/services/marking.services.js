const prisma = require("../lib/prisma");
const _ = require("lodash");
const {
  getBandScore,
  getOverallBandScore,
} = require("../utils/bandScoreConverter");

const listeningBandConversion = {
  40: 9.0,
  39: 9.0,
  38: 8.5,
  37: 8.5,
  36: 8.0,
  35: 8.0,
  34: 7.5,
  33: 7.0,
  32: 7.0,
  31: 6.5,
  30: 6.5,
  29: 6.5,
  28: 6.0,
  27: 6.0,
  26: 6.0,
  25: 5.5,
  24: 5.5,
  23: 5.5,
  22: 5.5,
  21: 5.0,
  20: 5.0,
  19: 5.0,
  18: 5.0,
  17: 4.5,
  16: 4.5,
  15: 4.0,
  14: 4.0,
  13: 4.0,
  12: 4.0,
  11: 4.0,
  10: 4.0,
};
const readingBandConversion = {
  40: 9.0,
  39: 9.0,
  38: 8.5,
  37: 8.5,
  36: 8.0,
  35: 8.0,
  34: 7.5,
  33: 7.5,
  32: 7.0,
  31: 7.0,
  30: 7.0,
  29: 6.5,
  28: 6.5,
  27: 6.5,
  26: 6.0,
  25: 6.0,
  24: 6.0,
  23: 6.0,
  22: 5.5,
  21: 5.5,
  20: 5.5,
  19: 5.5,
  18: 5.0,
  17: 5.0,
  16: 5.0,
  15: 5.0,
  14: 4.5,
  13: 4.5,
  12: 4.0,
  11: 4.0,
  10: 4.0,
};

class MarkingService {
  /**
   * Retrieves a paginated and filtered list of all submissions.
   * @param {Object} filters - An object containing page, limit, search, and status.
   * @returns {Promise<Object>} An object with the paginated results.
   */
  async getAllSubmissions({ page, limit, search, status }) {
    const skip = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.student = {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const [submissions, totalItems, awaitingCount] = await prisma.$transaction([
      prisma.scheduledMockExam.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          student: { select: { firstName: true, lastName: true, email: true } },
          template: { select: { title: true } },
        },
      }),
      prisma.scheduledMockExam.count({ where }),
      prisma.scheduledMockExam.count({ where: { status: "COMPLETED" } }),
    ]);

    return {
      items: submissions,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      awaitingCount: awaitingCount,
    };
  }

  async getSubmissionForMarking(scheduledExamId) {
    const submission = await prisma.scheduledMockExam.findUnique({
      where: { id: scheduledExamId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        studentAnswers: {
          include: {
            question: true,
          },
        },
        template: {
          select: {
            title: true,
          },
        },
      },
    });

    return submission;
  }

  async markSubmission(scheduledExamId, manualScores = []) {
    const submission = await this.getSubmissionForMarking(scheduledExamId);

    if (!submission || submission.status !== "COMPLETED") {
      const error = new Error(
        "This submission is not available or not ready for marking."
      );
      error.statusCode = 404;
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      const markingPromises = [];

      for (const studentAnswer of submission.studentAnswers) {
        const { question, answer: studentAnswerPayload } = studentAnswer;

        let isCorrect = null;

        const autoMarkedTypes = [
          "TRUE_FALSE_NOT_GIVEN",
          "MULTIPLE_CHOICE_SINGLE_ANSWER",
          "MULTIPLE_CHOICE_MULTIPLE_ANSWER",
          "GAP_FILLING",
          "SUMMARY_COMPLETION",
          "MATCHING",
        ];

        if (autoMarkedTypes.includes(question.questionType)) {
          isCorrect = _.isEqual(studentAnswerPayload, question.answer);
        }

        const manualMark = manualScores.find(
          (ms) => ms.questionId === question.id
        );
        const updatePromise = tx.studentAnswer.update({
          where: { id: studentAnswer.id },
          data: {
            isCorrect: isCorrect,
            score: manualMark ? manualMark.score : null,
            feedback: manualMark ? manualMark.feedback : null,
          },
        });
        markingPromises.push(updatePromise);
      }

      await Promise.all(markingPromises);

      const updatedExam = await tx.scheduledMockExam.update({
        where: { id: scheduledExamId },
        data: {
          status: "MARKED",
        },
      });

      return updatedExam;
    });
  }

  async releaseResults(scheduledExamId) {
    const exam = await prisma.scheduledMockExam.findUnique({
      where: { id: scheduledExamId },
    });

    if (!exam || exam.status !== "MARKED") {
      const error = new Error("This exam is not ready to be released.");
      error.statusCode = 409; // Conflict
      throw error;
    }

    return prisma.scheduledMockExam.update({
      where: { id: scheduledExamId },
      data: {
        status: "RESULTS_RELEASED",
      },
    });
  }

  async calculateScores(scheduledExamId) {
    const submission = await this.getSubmissionForMarking(scheduledExamId);
    if (!submission) {
      throw new Error("Submission not found for score calculation.");
    }

    // Initialize raw scores and totals
    const rawScores = {
      LISTENING: 0,
      READING: 0,
    };
    const totals = {
      LISTENING: 0,
      READING: 0,
    };
    const writingScores = [];

    // Tally the scores from the student's answers
    submission.studentAnswers.forEach((sa) => {
      if (sa.question.section === "LISTENING") {
        totals.LISTENING++;
        if (sa.isCorrect) rawScores.LISTENING++;
      } else if (sa.question.section === "READING") {
        totals.READING++;
        if (sa.isCorrect) rawScores.READING++;
      } else if (sa.question.section === "WRITING" && sa.score !== null) {
        writingScores.push(sa.score);
      }
    });

    // Calculate final Writing band (average of tasks, rounded to nearest .5)
    let finalWritingBand = null;
    if (writingScores.length > 0) {
      const sum = writingScores.reduce((a, b) => a + b, 0);
      finalWritingBand = Math.round((sum / writingScores.length) * 2) / 2;
    }

    // Convert raw scores to band scores using the conversion tables
    const bandScores = {
      listening: listeningBandConversion[rawScores.LISTENING] || 0,
      reading: readingBandConversion[rawScores.READING] || 0,
      writing: finalWritingBand,
    };

    // Calculate overall band score (average of the bands, rounded to nearest .5)
    const validBands = Object.values(bandScores).filter(
      (s) => s !== null && s !== undefined
    );
    const average =
      validBands.reduce((sum, score) => sum + score, 0) /
      (validBands.length || 1);
    const overallBandScore = Math.round(average * 2) / 2;

    // Return the final, structured score object
    return {
      rawScores: {
        LISTENING: rawScores.LISTENING,
        READING: rawScores.READING,
        // For display, the "raw score" for writing is the final band
        WRITING: finalWritingBand,
      },
      bandScores,
      overallBandScore: isNaN(overallBandScore) ? 0 : overallBandScore,
      totals, // Include totals for display purposes (e.g., "30/40")
    };
  }
}

module.exports = new MarkingService();
