// db/database.js
// SQLite database connection + schema setup for the Student Management System.
// Uses better-sqlite3 - a fast, synchronous SQLite driver. No separate DB server
// needed; the whole database lives in a single file: sms.db

const path = require("path");
const Database = require("better-sqlite3");

const DB_PATH = path.join(__dirname, "sms.db");
const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ---------- Schema ----------
db.exec(`
CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  instructor TEXT,
  credits INTEGER DEFAULT 3,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  roll_no TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  gender TEXT,
  dob TEXT,
  address TEXT,
  guardian_name TEXT,
  batch_year INTEGER,
  status TEXT DEFAULT 'active',      -- active | inactive | graduated
  avatar_color TEXT DEFAULT '#1B2A4A',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  grade TEXT,                         -- A, B, C, D, F, or NULL if not graded yet
  enrolled_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id)
);

CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  status TEXT NOT NULL,               -- present | absent | late
  UNIQUE(student_id, date)
);
`);

// ---------- Seed (only if empty) ----------
const studentCount = db.prepare("SELECT COUNT(*) AS c FROM students").get().c;

if (studentCount === 0) {
  const insertCourse = db.prepare(
    "INSERT INTO courses (name, code, instructor, credits) VALUES (?, ?, ?, ?)"
  );
  const courses = [
    ["Data Structures", "CS201", "Dr. Mehta", 4],
    ["Database Systems", "CS301", "Dr. Rao", 4],
    ["English Literature", "HU101", "Prof. Kapoor", 3],
    ["Physics I", "PH101", "Dr. Iyer", 4],
    ["Web Development", "CS250", "Prof. Sharma", 3],
  ];
  const courseIds = courses.map((c) => insertCourse.run(...c).lastInsertRowid);

  const insertStudent = db.prepare(`
    INSERT INTO students
      (roll_no, first_name, last_name, email, phone, gender, dob, address, guardian_name, batch_year, status, avatar_color)
    VALUES (@roll_no, @first_name, @last_name, @email, @phone, @gender, @dob, @address, @guardian_name, @batch_year, @status, @avatar_color)
  `);

  const colors = ["#1B2A4A", "#C9A227", "#3A7D5C", "#8A4B3B", "#5B6472"];
  const genders = ["Male", "Female", "Other"];
  const firstNames = ["Aarav","Vivaan","Ishaan","Ananya","Diya","Kabir","Myra","Reyansh","Saanvi","Arjun","Priya","Rohan","Neha","Aditi","Karan","Simran","Yash","Tara","Dev","Meera"];
  const lastNames = ["Sharma","Verma","Gupta","Iyer","Nair","Reddy","Singh","Kapoor","Rao","Mehta"];

  const students = [];
  for (let i = 1; i <= 24; i++) {
    const fn = firstNames[(i * 3) % firstNames.length];
    const ln = lastNames[(i * 7) % lastNames.length];
    students.push({
      roll_no: `STU${String(1000 + i)}`,
      first_name: fn,
      last_name: ln,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@campus.edu`,
      phone: `98${String(10000000 + i * 137).slice(0, 8)}`,
      gender: genders[i % genders.length],
      dob: `${2002 + (i % 4)}-0${(i % 9) + 1}-1${i % 9}`,
      address: `${i} MG Road, Pune`,
      guardian_name: `${lastNames[(i + 2) % lastNames.length]} Family`,
      batch_year: 2023 + (i % 3),
      status: i % 11 === 0 ? "inactive" : i % 13 === 0 ? "graduated" : "active",
      avatar_color: colors[i % colors.length],
    });
  }

  const insertEnrollment = db.prepare(
    "INSERT OR IGNORE INTO enrollments (student_id, course_id, grade) VALUES (?, ?, ?)"
  );
  const grades = ["A", "A", "B", "B", "C", null];

  const insertMany = db.transaction((rows) => {
    rows.forEach((s, idx) => {
      const info = insertStudent.run(s);
      const studentId = info.lastInsertRowid;
      // enroll each student in 2-3 random courses
      const numCourses = 2 + (idx % 2);
      for (let c = 0; c < numCourses; c++) {
        const courseId = courseIds[(idx + c) % courseIds.length];
        const grade = grades[(idx + c) % grades.length];
        insertEnrollment.run(studentId, courseId, grade);
      }
      // a little attendance history for the dashboard stats
      const today = new Date();
      for (let d = 0; d < 5; d++) {
        const day = new Date(today);
        day.setDate(day.getDate() - d);
        const dateStr = day.toISOString().slice(0, 10);
        const status = (idx + d) % 6 === 0 ? "absent" : (idx + d) % 5 === 0 ? "late" : "present";
        db.prepare(
          "INSERT OR IGNORE INTO attendance (student_id, date, status) VALUES (?, ?, ?)"
        ).run(studentId, dateStr, status);
      }
    });
  });

  insertMany(students);
  console.log(`Seeded database with ${students.length} students and ${courses.length} courses.`);
}

module.exports = db;
