const express = require("express");
const router = express.Router();
const authController = require("../../controllers/auth.controller");
const { authenticateToken } = require("../../middleware/auth.middleware");
const catchAsync = require("../../utils/catchAsync");

router.post("/register", catchAsync(authController.register));
router.post("/login", catchAsync(authController.login));
router.get("/me", authenticateToken, catchAsync(authController.getMe));

module.exports = router;
