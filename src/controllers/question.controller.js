const questionService = require("../services/question.services");

class QuestionController {
  async create(req, res) {
    // 1. Basic validation
    const { section, questionType, content, answer, questionSetId } = req.body;

    if (!section || !questionType || !content || !answer || !questionSetId) {
      return res.status(400).json({
        error:
          "Missing required fields: section, questionType, content, answer, and questionSetId.",
      });
    }

    const newQuestion = await questionService.createQuestion(req.body);

    res.status(201).json(newQuestion);
  }

  async getAll(req, res) {
    const questions = await questionService.getAllQuestions();
    res.status(200).json(questions);
  }

  async getById(req, res) {
    const question = await questionService.getQuestionById(req.params.id);
    if (!question) {
      const error = new Error("Question not found.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json(question);
  }

  async update(req, res) {
    const questionId = req.params.id;
    const updatedQuestion = await questionService.updateQuestion(
      questionId,
      req.body
    );
    res.status(200).json(updatedQuestion);
  }

  async remove(req, res) {
    const questionId = req.params.id;
    await questionService.deleteQuestion(questionId);

    res.status(204).send();
  }
}

module.exports = new QuestionController();
