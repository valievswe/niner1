const questionSetService = require("../services/questionSet.services");

class QuestionSetController {
  async create(req, res) {
    const { name, section, passages } = req.body;
    if (!name || !section) {
      return res.status(400).json({ error: "Name and section are required." });
    }

    // Validate passages for READING section
    if (section === "READING") {
      if (!passages || !Array.isArray(passages)) {
        return res
          .status(400)
          .json({ error: "Passages array is required for READING section." });
      }

      // Validate each passage
      for (const passage of passages) {
        if (passage.text && passage.text.trim() !== "") {
          if (
            typeof passage.partNumber !== "number" ||
            passage.partNumber <= 0
          ) {
            return res.status(400).json({
              error:
                "Each passage must have a valid partNumber (positive number).",
            });
          }
          if (typeof passage.text !== "string") {
            return res
              .status(400)
              .json({ error: "Passage text must be a string." });
          }
        }
      }
    }

    try {
      const newSet = await questionSetService.createSet(
        req.body,
        req.user.userId
      );
      res.status(201).json(newSet);
    } catch (error) {
      console.error("Error creating question set:", error);
      if (error.code === "P2002") {
        return res
          .status(400)
          .json({ error: "A question set with this name already exists." });
      }
      res.status(500).json({ error: "Failed to create question set." });
    }
  }

  async getAll(req, res) {
    const { section } = req.query;
    try {
      const sets = await questionSetService.getAllSets(section);
      res.status(200).json(sets);
    } catch (error) {
      console.error("Error fetching question sets:", error);
      res.status(500).json({ error: "Failed to load question sets." });
    }
  }

  async update(req, res) {
    try {
      const updatedSet = await questionSetService.updateSet(
        req.params.id,
        req.body
      );
      res.status(200).json(updatedSet);
    } catch (error) {
      console.error("Error updating question set:", error);
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Question set not found." });
      }
      res.status(500).json({ error: "Failed to update question set." });
    }
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

  async getById(req, res) {
    const set = await questionSetService.getSetById(req.params.id);
    if (!set) {
      return res.status(404).json({ error: "Question set not found." });
    }
    res.status(200).json(set);
  }
}

module.exports = new QuestionSetController();
