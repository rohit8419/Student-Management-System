// routes/dashboard.js
const express = require("express");
const db = require("../db/database");

const router = express.Router();

router.get("/stats", (req, res) => {
  const totalStudents = db.prepare("SELECT COUNT(*) AS c FROM students").get().c;
  const activeStudents = db.prepare("SELECT COUNT(*) AS c FROM students WHERE status='active'").get().c;
  const totalCourses = db.prepare("SELECT COUNT(*) AS c FROM courses").get().c;
  const graduated = db.prepare("SELECT COUNT(*) AS c FROM students WHERE status='graduated'").get().c;

  const genderBreakdown = db
    .prepare("SELECT COALESCE(gender,'Unspecified') AS gender, COUNT(*) AS count FROM students GROUP BY gender")
    .all();

  const batchBreakdown = db
    .prepare("SELECT batch_year, COUNT(*) AS count FROM students WHERE batch_year IS NOT NULL GROUP BY batch_year ORDER BY batch_year")
    .all();

  const gradeDistribution = db
    .prepare("SELECT COALESCE(grade,'Ungraded') AS grade, COUNT(*) AS count FROM enrollments GROUP BY grade")
    .all();

  const today = new Date().toISOString().slice(0, 10);
  const todayAttendance = db
    .prepare("SELECT status, COUNT(*) AS count FROM attendance WHERE date = ? GROUP BY status")
    .all(today);

  const recentStudents = db
    .prepare("SELECT id, roll_no, first_name, last_name, batch_year, status, avatar_color, created_at FROM students ORDER BY id DESC LIMIT 5")
    .all();

  const topCourses = db
    .prepare(
      `SELECT c.name, c.code, COUNT(e.id) AS student_count
       FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id
       GROUP BY c.id ORDER BY student_count DESC LIMIT 5`
    )
    .all();

  res.json({
    totalStudents,
    activeStudents,
    totalCourses,
    graduated,
    genderBreakdown,
    batchBreakdown,
    gradeDistribution,
    todayAttendance,
    recentStudents,
    topCourses,
  });
});

module.exports = router;
