// src/services/exam.services.js

const prisma = require("../lib/prisma");
// This service depends on the marking service for score calculation
const markingService = require("./marking.services");

/**
 * Helper function to add display numbers to questions.
 * - INSTRUCTION and IMAGE_DISPLAY types don't get numbered
 * - MATCHING and MAP_LABELING types can occupy multiple numbers based on their items (prompts/labels)
 * - All other question types get a single sequential number
 */
function addDisplayNumbers(templateQuestions) {
  const NON_NUMBERED_TYPES = ["INSTRUCTION", "IMAGE_DISPLAY"];
  const MULTI_ITEM_TYPES = ["MATCHING", "MAP_LABELING"];

  let currentNumber = 1;

  return templateQuestions.map((tq) => {
    const questionType = tq.question.questionType;
    const content = tq.question.content;
    const answer = tq.question.answer;

    // Check if this question type should not be numbered
    if (NON_NUMBERED_TYPES.includes(questionType)) {
      return {
        ...tq,
        displayNumberStart: null,
        displayNumberEnd: null,
      };
    }

    // Only MATCHING and MAP_LABELING get multiple numbers based on their items
    let itemCount = 1;

    if (MULTI_ITEM_TYPES.includes(questionType)) {
      if (questionType === 'MATCHING') {
        // Count the number of prompts
        itemCount = content?.prompts?.length || 1;
      } else if (questionType === 'MAP_LABELING') {
        // Count the number of labels in the answer object
        itemCount = answer ? Object.keys(answer).length : 1;
      }
    }

    const startNumber = currentNumber;
    const endNumber = currentNumber + itemCount - 1;
    currentNumber = endNumber + 1; // Next question starts after this one

    return {
      ...tq,
      displayNumberStart: startNumber,
      displayNumberEnd: endNumber,
    };
  });
}

class ExamService {
  /**
   * Starts a scheduled exam for a student, enforcing the availability window.
   */
  async startExam(scheduledExamId, studentId) {
    const scheduledExam = await prisma.scheduledMockExam.findUnique({
      where: { id: scheduledExamId },
      include: { template: true },
    });

    // Validation Checks
    if (!scheduledExam) {
      const error = new Error("Exam not found.");
      error.statusCode = 404;
      throw error;
    }
    if (scheduledExam.studentId !== studentId) {
      const error = new Error("Forbidden: This exam is not assigned to you.");
      error.statusCode = 403;
      throw error;
    }
    if (scheduledExam.status !== "SCHEDULED") {
      const error = new Error(
        "This exam has already been started or completed."
      );
      error.statusCode = 409;
      throw error;
    }

    // Availability Window Enforcement
    const now = new Date();
    const startTime = new Date(scheduledExam.startAvailableAt);
    const endTime = new Date(scheduledExam.endAvailableAt);
    if (now < startTime) {
      const error = new Error(
        `This exam is not available until ${startTime.toLocaleString()}.`
      );
      error.statusCode = 403;
      throw error;
    }
    if (now > endTime) {
      const error = new Error(
        `The availability window for this exam closed at ${endTime.toLocaleString()}.`
      );
      error.statusCode = 403;
      throw error;
    }

    // Transaction to Update Status and Fetch Data
    const { updatedExam, fullTemplate } = await prisma.$transaction(
      async (tx) => {
        const updatedExamTx = await tx.scheduledMockExam.update({
          where: { id: scheduledExamId },
          data: { status: "IN_PROGRESS", startedAt: new Date() },
        });

        const fullTemplateTx = await tx.mockExamTemplate.findUnique({
          where: { id: scheduledExam.templateId },
          include: {
            questions: {
              // This is MockExamTemplateQuestion
              orderBy: { order: "asc" },
              include: {
                question: {
                  include: {
                    questionSet: {
                      include: {
                        passages: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
        console.log("--- Backend: startExam ---");
        console.log("Scheduled Exam ID:", scheduledExamId);
        console.log("Student ID:", studentId);
        console.log("Exam Status after update:", updatedExamTx.status);
        console.log("Exam startedAt (from DB):", updatedExamTx.startedAt);
        console.log(
          "Template sectionDurations:",
          fullTemplateTx.sectionDurations
        );
        console.log("--- End startExam ---");
        return { updatedExam: updatedExamTx, fullTemplate: fullTemplateTx };
      }
    );

    // Add display numbers to questions
    const questionsWithDisplayNumbers = addDisplayNumbers(fullTemplate.questions);

    // Return Complete Data Structure to Frontend
    return {
      scheduledExamId: updatedExam.id,
      title: fullTemplate.title,
      audioFiles: fullTemplate.audioFiles,
      sectionDurations: fullTemplate.sectionDurations,
      questions: questionsWithDisplayNumbers,
      startedAt: updatedExam.startedAt.toISOString(),
    };
  }

  /**
   * Submits a student's answers for an in-progress exam, enforcing the deadline.
   */
  async submitAnswers(scheduledExamId, studentId, answers) {
    console.log("--- Backend: submitAnswers ---");
    console.log("Scheduled Exam ID:", scheduledExamId);
    // ... rest of the logs will be added after fetching scheduledExam and durations
    const scheduledExam = await prisma.scheduledMockExam.findUnique({
      where: { id: scheduledExamId },
      include: {
        template: {
          select: { sectionDurations: true },
        },
      },
    });

    console.log("Student ID:", studentId);
    console.log("Received answers payload:", JSON.stringify(answers, null, 2));

    // Validation Checks
    if (!scheduledExam) {
      const error = new Error("Exam not found.");
      error.statusCode = 404;
      throw error;
    }
    if (scheduledExam.studentId !== studentId) {
      const error = new Error(
        "Forbidden: You cannot submit answers for this exam."
      );
      error.statusCode = 403;
      throw error;
    }
    if (scheduledExam.status !== "IN_PROGRESS") {
      const error = new Error("This exam is not in progress.");
      error.statusCode = 409;
      throw error;
    }

    // Correct Deadline Enforcement
    const durations = scheduledExam.template.sectionDurations;
    console.log("Exam Status (before submission check):", scheduledExam.status);
    console.log(
      "Exam startedAt (from DB):",
      scheduledExam.startedAt.toISOString(),
      scheduledExam.startedAt.getTime()
    );
    console.log("Template sectionDurations:", durations);

    if (!durations) {
      const error = new Error(
        "Exam misconfiguration: Section durations not set for this template."
      );
      error.statusCode = 500;
      throw error;
    }
    const totalDurationMs =
      ((durations.listening || 0) +
        (durations.reading || 0) +
        (durations.writing || 0)) *
      60000;
    const absoluteDeadline = new Date(
      scheduledExam.startedAt.getTime() + totalDurationMs
    );

    console.log("Calculated totalDurationMs:", totalDurationMs);
    console.log(
      "Calculated absoluteDeadline:",
      absoluteDeadline.toISOString(),
      absoluteDeadline.getTime()
    );
    const currentTime = new Date();
    console.log(
      "Current time (new Date()):",
      currentTime.toISOString(),
      currentTime.getTime()
    );
    console.log(
      "Is current time > absoluteDeadline?",
      currentTime > absoluteDeadline
    );
    console.log("--- End submitAnswers ---");

    if (new Date() > absoluteDeadline) {
      await prisma.scheduledMockExam.update({
        where: { id: scheduledExamId },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
      const error = new Error(
        "Submission failed: The time limit for this exam has expired."
      );
      error.statusCode = 403;
      throw error;
    }

    // Transaction to Save Answers and Update Status
    return prisma.$transaction(async (tx) => {
      const studentAnswersData = answers.map((ans) => ({
        scheduledExamId: scheduledExamId,
        questionId: ans.questionId,
        answer: ans.answer,
      }));
      await tx.studentAnswer.deleteMany({
        where: { scheduledExamId: scheduledExamId },
      });
      await tx.studentAnswer.createMany({ data: studentAnswersData });
      const updatedExam = await tx.scheduledMockExam.update({
        where: { id: scheduledExamId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
      return updatedExam;
    });
  }

  /**
   * Fetches the final results for a student, including calculated scores.
   */
  async getResults(scheduledExamId, studentId) {
    const results = await prisma.scheduledMockExam.findUnique({
      where: { id: scheduledExamId },
      include: {
        studentAnswers: {
          include: {
            question: true,
          },
        },
        template: { select: { title: true } },
      },
    });

    // Validation Checks
    if (!results) {
      const error = new Error("Results not found.");
      error.statusCode = 404;
      throw error;
    }
    if (results.studentId !== studentId) {
      const error = new Error(
        "Forbidden: You are not authorized to view these results."
      );
      error.statusCode = 403;
      throw error;
    }
    if (results.status !== "RESULTS_RELEASED") {
      const error = new Error("These results have not been released yet.");
      error.statusCode = 403;
      throw error;
    }

    const scores = await markingService.calculateScores(scheduledExamId);
    return { ...results, scores };
  }

  /**
   * Fetches an exam that is already in progress to allow a student to resume.
   */
  async getInProgressExam(scheduledExamId, studentId) {
    const scheduledExam = await prisma.scheduledMockExam.findFirst({
      where: {
        id: scheduledExamId,
        studentId: studentId,
        status: "IN_PROGRESS",
      },
      include: { template: true },
    });

    if (!scheduledExam) {
      const error = new Error("No active exam session found.");
      error.statusCode = 404;
      throw error;
    }

    const fullTemplate = await prisma.mockExamTemplate.findUnique({
      where: { id: scheduledExam.templateId },
      include: {
        questions: {
          // This is MockExamTemplateQuestion
          orderBy: { order: "asc" },
          include: {
            question: {
              include: {
                questionSet: {
                  include: {
                    passages: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log("--- Backend: getInProgressExam ---");
    console.log("Scheduled Exam ID:", scheduledExamId);
    console.log("Student ID:", studentId);
    console.log("Exam Status:", scheduledExam.status);
    console.log("Exam startedAt (from DB):", scheduledExam.startedAt);
    console.log("Template sectionDurations:", fullTemplate.sectionDurations);
    console.log("--- End getInProgressExam ---");

    // Add display numbers to questions
    const questionsWithDisplayNumbers = addDisplayNumbers(fullTemplate.questions);

    return {
      scheduledExamId: scheduledExam.id,
      title: fullTemplate.title,
      audioFiles: fullTemplate.audioFiles,
      sectionDurations: fullTemplate.sectionDurations,
      questions: questionsWithDisplayNumbers,
      startedAt: scheduledExam.startedAt.toISOString(),
    };
  }
}

module.exports = new ExamService();
