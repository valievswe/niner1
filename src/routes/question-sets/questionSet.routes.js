const express = require("express");
const router = express.Router();
const questionSetController = require("../../controllers/questionSet.controller");
const {
  authenticateToken,
  authorizeRole,
} = require("../../middleware/auth.middleware");
const catchAsync = require("../../utils/catchAsync");

router.post(
  "/",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(questionSetController.create)
);
router.get(
  "/",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(questionSetController.getAll)
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(questionSetController.getById)
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(questionSetController.update)
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(questionSetController.remove)
);

module.exports = router;
