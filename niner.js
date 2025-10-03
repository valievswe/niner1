const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

// Start the cron job
require("./src/lib/cron.js");

const app = express();

const PORT = process.env.PORT || 8000;

app.use(cors());

app.use(express.json());

const authRoutes = require("./src/routes/auth/auth.routes.js");
const questionRoutes = require("./src/routes/questions/question.routes.js");
const templateRoutes = require("./src/routes/mock/template.routes.js");
const scheduleRoutes = require("./src/routes/mock/schedule.routes.js");
const studentRoutes = require("./src/routes/student/student.routes.js");
const markingRoutes = require("./src/routes/mock/marking.routes.js");
const userRoutes = require("./src/routes/user/user.routes.js");
const questionSetRoutes = require("./src/routes/question-sets/questionSet.routes.js");
const statsRoutes = require("./src/routes/stats/stats.routes.js");

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/marking", markingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/question-sets", questionSetRoutes);
app.use("/api/stats", statsRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the CD IELTS Mock Exam API!",
    status: "Server is running smoothly.",
  });
});

// Centralized error handler
const errorHandler = require("./src/middleware/error.middleware.js");
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
