const express = require("express");
const router = express.Router();
const scheduleController = require("../../controllers/schedule.controller");
const {
  authenticateToken,
  authorizeRole,
} = require("../../middleware/auth.middleware");
const catchAsync = require("../../utils/catchAsync");

router.post(
  "/",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(scheduleController.create)
);

module.exports = router;
