const express = require("express");
const router = express.Router();
const studentController = require("../../controllers/student.controller");
const { authenticateToken } = require("../../middleware/auth.middleware");
const catchAsync = require("../../utils/catchAsync");

router.get("/dashboard", authenticateToken, catchAsync(studentController.getDashboard));

router.post("/exams/:id/start", authenticateToken, catchAsync(studentController.startExam));

router.post(
  "/exams/:id/submit",
  authenticateToken,
  catchAsync(studentController.submitExam)
);

router.get(
  "/exams/:id/results",
  authenticateToken,
  catchAsync(studentController.getResults)
);
router.get("/exams/:id", authenticateToken, catchAsync(studentController.getExamSession));
module.exports = router;
