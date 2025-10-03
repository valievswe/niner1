const express = require("express");
const router = express.Router();
const statsController = require("../../controllers/stats.controller");
const {
  authenticateToken,
  authorizeRole,
} = require("../../middleware/auth.middleware");

// GET /api/stats/admin-dashboard
router.get(
  "/admin-dashboard",
  authenticateToken,
  authorizeRole("ADMIN"),
  statsController.getAdminStats
);

module.exports = router;
