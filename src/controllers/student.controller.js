const scheduleService = require("../services/schedule.services");
const examService = require("../services/exam.services");

class StudentController {
  async getDashboard(req, res) {
    const studentId = req.user.userId;
    const scheduledExams = await scheduleService.getScheduledExamsForStudent(
      studentId
    );
    res.status(200).json(scheduledExams);
  }

  async startExam(req, res) {
    const studentId = req.user.userId;
    const scheduledExamId = req.params.id;
    const examDetails = await examService.startExam(
      scheduledExamId,
      studentId
    );
    res.status(200).json(examDetails);
  }

  async submitExam(req, res) {
    const studentId = req.user.userId;
    const scheduledExamId = req.params.id;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        error: "The `answers` field must be an array and is required.",
      });
    }

    const result = await examService.submitAnswers(
      scheduledExamId,
      studentId,
      answers
    );
    res.status(200).json({
      message:
        "Exam submitted successfully. Your results will be available after they have been marked.",
      examStatus: result.status,
    });
  }

  async getResults(req, res) {
    const studentId = req.user.userId;
    const scheduledExamId = req.params.id;
    const results = await examService.getResults(scheduledExamId, studentId);
    res.status(200).json(results);
  }

  async getExamSession(req, res) {
    const examData = await examService.getInProgressExam(
      req.params.id,
      req.user.userId
    );
    res.status(200).json(examData);
  }
}

module.exports = new StudentController();
