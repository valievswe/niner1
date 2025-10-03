// src/routes/user/user.routes.js

const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user.controller");
const {
  authenticateToken,
  authorizeRole,
} = require("../../middleware/auth.middleware");
const catchAsync = require("../../utils/catchAsync");

// POST /api/users - Admin creates a new user
router.post(
  "/",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(userController.create)
);

// GET /api/users - Admin gets all users
router.get(
  "/",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(userController.getAll)
);

// GET /api/users/:id - Admin gets a single user by ID
router.get(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(userController.getById)
);

// PUT /api/users/:id - Admin updates a user
router.put(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(userController.update)
);

// DELETE /api/users/:id - Admin deletes a user
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("ADMIN"),
  catchAsync(userController.remove)
);

module.exports = router;
