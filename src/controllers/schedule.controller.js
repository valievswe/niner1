const scheduleService = require("../services/schedule.services");

class ScheduleController {
  async create(req, res) {
    const { studentId, templateId, startAvailableAt, endAvailableAt } =
      req.body;
    if (!studentId || !templateId || !startAvailableAt || !endAvailableAt) {
      return res.status(400).json({
        error:
          "Missing required fields: studentId, templateId, startAvailableAt, endAvailableAt.",
      });
    }

    const newSchedule = await scheduleService.scheduleExam(req.body);

    res.status(201).json(newSchedule);
  }
}

module.exports = new ScheduleController();
