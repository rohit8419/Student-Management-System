// routes/students.js
const express = require("express");
const db = require("../db/database");

const router = express.Router();

function getEnrollmentsForStudent(studentId) {
  return db
    .prepare(
      `SELECT e.id AS enrollment_id, c.id AS course_id, c.name, c.code, e.grade
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.student_id = ?`,
    )
    .all(studentId);
}

// GET /api/students?search=&status=&batch_year=
router.get("/", (req, res) => {
  const { search = "", status = "", batch_year = "" } = req.query;

  let sql = `SELECT * FROM students WHERE 1=1`;
  const params = [];

  if (search) {
    sql += ` AND (first_name LIKE ? OR last_name LIKE ? OR roll_no LIKE ? OR email LIKE ?)`;
    const like = `%${search}%`;
    params.push(like, like, like, like);
  }
  if (status) {
    sql += ` AND status = ?`;
    params.push(status);
  }
  if (batch_year) {
    sql += ` AND batch_year = ?`;
    params.push(batch_year);
  }
  sql += ` ORDER BY id DESC`;

  const students = db.prepare(sql).all(...params);
  res.json(students);
});

// GET /api/students/:id
router.get("/:id", (req, res) => {
  const student = db
    .prepare("SELECT * FROM students WHERE id = ?")
    .get(req.params.id);
  if (!student) return res.status(404).json({ error: "Student not found" });
  student.enrollments = getEnrollmentsForStudent(student.id);
  res.json(student);
});

// POST /api/students
router.post("/", (req, res) => {
  const {
    roll_no,
    first_name,
    last_name,
    email,
    phone,
    gender,
    dob,
    address,
    guardian_name,
    batch_year,
    status,
    avatar_color,
  } = req.body;

  if (!roll_no || !first_name || !last_name || !email) {
    return res
      .status(400)
      .json({ error: "roll_no, first_name, last_name and email are required" });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO students
        (roll_no, first_name, last_name, email, phone, gender, dob, address, guardian_name, batch_year, status, avatar_color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      roll_no,
      first_name,
      last_name,
      email,
      phone || null,
      gender || null,
      dob || null,
      address || null,
      guardian_name || null,
      batch_year || null,
      status || "active",
      avatar_color || "#1B2A4A",
    );
    const student = db
      .prepare("SELECT * FROM students WHERE id = ?")
      .get(info.lastInsertRowid);
    res.status(201).json(student);
  } catch (err) {
    if (String(err.message).includes("UNIQUE")) {
      return res
        .status(409)
        .json({ error: "Roll number or email already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/students/:id
router.put("/:id", (req, res) => {
  const existing = db
    .prepare("SELECT * FROM students WHERE id = ?")
    .get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Student not found" });

  const merged = { ...existing, ...req.body };

  try {
    db.prepare(
      `
      UPDATE students SET
        roll_no = ?, first_name = ?, last_name = ?, email = ?, phone = ?,
        gender = ?, dob = ?, address = ?, guardian_name = ?, batch_year = ?,
        status = ?, avatar_color = ?
      WHERE id = ?
    `,
    ).run(
      merged.roll_no,
      merged.first_name,
      merged.last_name,
      merged.email,
      merged.phone,
      merged.gender,
      merged.dob,
      merged.address,
      merged.guardian_name,
      merged.batch_year,
      merged.status,
      merged.avatar_color,
      req.params.id,
    );
    const updated = db
      .prepare("SELECT * FROM students WHERE id = ?")
      .get(req.params.id);
    res.json(updated);
  } catch (err) {
    if (String(err.message).includes("UNIQUE")) {
      return res
        .status(409)
        .json({ error: "Roll number or email already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/students/:id
router.delete("/:id", (req, res) => {
  const info = db
    .prepare("DELETE FROM students WHERE id = ?")
    .run(req.params.id);
  if (info.changes === 0)
    return res.status(404).json({ error: "Student not found" });
  res.json({ success: true });
});

// POST /api/students/:id/enroll  { course_id }
router.post("/:id/enroll", (req, res) => {
  const { course_id } = req.body;
  if (!course_id)
    return res.status(400).json({ error: "course_id is required" });
  try {
    db.prepare(
      "INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)",
    ).run(req.params.id, course_id);
    res.status(201).json(getEnrollmentsForStudent(req.params.id));
  } catch (err) {
    if (String(err.message).includes("UNIQUE")) {
      return res.status(409).json({ error: "Already enrolled in this course" });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/students/enrollments/:enrollmentId  { grade }
router.put("/enrollments/:enrollmentId", (req, res) => {
  const { grade } = req.body;
  db.prepare("UPDATE enrollments SET grade = ? WHERE id = ?").run(
    grade,
    req.params.enrollmentId,
  );
  res.json({ success: true });
});

// DELETE /api/students/enrollments/:enrollmentId
router.delete("/enrollments/:enrollmentId", (req, res) => {
  db.prepare("DELETE FROM enrollments WHERE id = ?").run(
    req.params.enrollmentId,
  );
  res.json({ success: true });
});

module.exports = router;
