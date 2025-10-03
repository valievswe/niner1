const statsService = require("../services/stats.services"); // Adjust path if needed

class StatsController {
  async getAdminStats(req, res) {
    try {
      const stats = await statsService.getAdminDashboardStats();
      res.status(200).json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard statistics." });
    }
  }
}
module.exports = new StatsController();
