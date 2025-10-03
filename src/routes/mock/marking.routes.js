const express = require("express");
const router = express.Router();
const markingController = require("../../controllers/marking.controller");
const {
  authenticateToken,
  authorizeRole,
} = require("../../middleware/auth.middleware");
const catchAsync = require("../../utils/catchAsync");

router.get(
  "/submissions/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(markingController.getSubmission)
);

router.post(
  "/submissions/:id/mark",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(markingController.markSubmission)
);

router.get(
  "/submissions",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(markingController.getAllSubmissions)
);

router.post(
  "/submissions/:id/release",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(markingController.releaseResults)
);

module.exports = router;
