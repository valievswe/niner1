const markingService = require("../services/marking.services");
const scheduleService = require("../services/schedule.services");

class MarkingController {
  async getSubmission(req, res) {
    const { id } = req.params;
    const submission = await markingService.getSubmissionForMarking(id);

    if (!submission) {
      const error = new Error("Submission not found.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(submission);
  }

  async markSubmission(req, res) {
    const { id } = req.params;
    const { manualScores } = req.body; // Expect an optional array of manual scores
    const result = await markingService.markSubmission(id, manualScores);
    res.status(200).json({
      message: "Submission marked successfully.",
      examStatus: result.status,
    });
  }

  async getAllSubmissions(req, res) {
    const { page = 1, limit = 10, search = "", status = "" } = req.query;

    const paginatedResult = await markingService.getAllSubmissions({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
      status,
    });

    res.status(200).json(paginatedResult);
  }

  async releaseResults(req, res) {
    const { id } = req.params;
    const result = await markingService.releaseResults(id);
    res.status(200).json({
      message: "Results have been successfully released to the student.",
      examStatus: result.status,
    });
  }
}

module.exports = new MarkingController();
