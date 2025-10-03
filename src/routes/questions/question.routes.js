const express = require("express");
const router = express.Router();
const questionController = require("../../controllers/question.controller");
const {
  authenticateToken,
  authorizeRole,
} = require("../../middleware/auth.middleware");
const catchAsync = require("../../utils/catchAsync");

router.post(
  "/",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(questionController.create)
);

router.get(
  "/",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(questionController.getAll)
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(questionController.update)
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(questionController.remove)
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(questionController.getById)
);

module.exports = router;
