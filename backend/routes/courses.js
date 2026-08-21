// routes/courses.js
const express = require("express");
const db = require("../db/database");

const router = express.Router();

// GET /api/courses
router.get("/", (req, res) => {
  const courses = db
    .prepare(
      `SELECT c.*, COUNT(e.id) AS student_count
       FROM courses c
       LEFT JOIN enrollments e ON e.course_id = c.id
       GROUP BY c.id
       ORDER BY c.id DESC`
    )
    .all();
  res.json(courses);
});

// POST /api/courses
router.post("/", (req, res) => {
  const { name, code, instructor, credits } = req.body;
  if (!name || !code) return res.status(400).json({ error: "name and code are required" });
  try {
    const info = db
      .prepare("INSERT INTO courses (name, code, instructor, credits) VALUES (?, ?, ?, ?)")
      .run(name, code, instructor || null, credits || 3);
    const course = db.prepare("SELECT * FROM courses WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json(course);
  } catch (err) {
    if (String(err.message).includes("UNIQUE")) {
      return res.status(409).json({ error: "Course code already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/courses/:id
router.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM courses WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Course not found" });
  const merged = { ...existing, ...req.body };
  db.prepare("UPDATE courses SET name=?, code=?, instructor=?, credits=? WHERE id=?").run(
    merged.name, merged.code, merged.instructor, merged.credits, req.params.id
  );
  res.json(db.prepare("SELECT * FROM courses WHERE id = ?").get(req.params.id));
});

// DELETE /api/courses/:id
router.delete("/:id", (req, res) => {
  const info = db.prepare("DELETE FROM courses WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Course not found" });
  res.json({ success: true });
});

module.exports = router;
