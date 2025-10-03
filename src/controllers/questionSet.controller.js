const questionSetService = require("../services/questionSet.services");

class QuestionSetController {
  async create(req, res) {
    const { name, section, passage } = req.body;
    if (!name || !section) {
      return res.status(400).json({ error: "Name and section are required." });
    }
    const newSet = await questionSetService.createSet(
      req.body,
      req.user.userId,
      passage
    );
    res.status(201).json(newSet);
  }

  async getAll(req, res) {
    const { section } = req.query;
    const sets = await questionSetService.getAllSets(section);
    res.status(200).json(sets);
  }

  async update(req, res) {
    const updatedSet = await questionSetService.updateSet(
      req.params.id,
      req.body
    );
    res.status(200).json(updatedSet);
  }

  async remove(req, res) {
    try {
      await questionSetService.deleteSet(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting question set:", error);

      if (error.code === "P2025") {
        return res.status(404).json({ error: "Question set not found." });
      }

      if (error.code === "P2003") {
        return res.status(400).json({
          error:
            "Cannot delete this set because it still contains questions. Please delete the questions inside it first.",
        });
      }

      res.status(500).json({
        error: "Failed to delete question set due to an unexpected error.",
      });
    }
  }
}
module.exports = new QuestionSetController();
