const express = require("express");
const router = express.Router();
const templateController = require("../../controllers/template.controller");
const {
  authenticateToken,
  authorizeRole,
} = require("../../middleware/auth.middleware");
const catchAsync = require("../../utils/catchAsync");

router.post(
  "/",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(templateController.create)
);

// Get all templates (ADMIN only)
router.get(
  "/",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(templateController.getAll)
);

// Get a single template by ID (ADMIN only)
router.get(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(templateController.getById)
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(templateController.update)
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(templateController.remove)
);
module.exports = router;
