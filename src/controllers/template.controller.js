const templateService = require("../services/template.services");

class TemplateController {
  async create(req, res) {
    const { title, description, sectionDurations, audioFiles, questions } =
      req.body;
    const adminId = req.user.userId;

    // 1. Validation
    if (!title || !questions) {
      return res
        .status(400)
        .json({ error: "Missing required fields: title, questions." });
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      return res
        .status(400)
        .json({ error: "`questions` must be a non-empty array." });
    }

    const newTemplate = await templateService.createTemplate(
      { title, description, sectionDurations, audioFiles },
      questions,
      adminId
    );

    res.status(201).json(newTemplate);
  }
  async getAll(req, res) {
    const templates = await templateService.getAllTemplates();
    res.status(200).json(templates);
  }

  async getById(req, res) {
    const templateId = req.params.id;
    const template = await templateService.getTemplateById(templateId);

    if (!template) {
      const error = new Error("Template not found.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(template);
  }

  async update(req, res) {
    const { title, description, sectionDurations, audioFiles, questions } =
      req.body;
    const templateId = req.params.id;

    if (!title || !questions) {
      return res
        .status(400)
        .json({ error: "Missing required fields: title, questions." });
    }

    const updatedTemplate = await templateService.updateTemplate(
      templateId,
      { title, description, sectionDurations, audioFiles },
      questions
    );
    res.status(200).json(updatedTemplate);
  }

  async remove(req, res) {
    await templateService.deleteTemplate(req.params.id);
    res.status(204).send(); // Success with no content to return
  }
}

module.exports = new TemplateController();
