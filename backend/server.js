// server.js
// Entry point for the Student Management System API.
// Run with: npm run dev   (after npm install)
// Server listens on http://localhost:5000

const express = require("express");
const cors = require("cors");
require("./db/database"); // initializes + seeds sms.db on first run

const studentsRouter = require("./routes/students");
const coursesRouter = require("./routes/courses");
const dashboardRouter = require("./routes/dashboard");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) =>
  res.json({ ok: true, service: "sms-backend" }),
);

app.use("/api/students", studentsRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/dashboard", dashboardRouter);

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
