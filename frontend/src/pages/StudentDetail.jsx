import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useToast } from "../components/Toast.jsx";
import StudentFormModal from "../components/StudentFormModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import {
  IconArrowLeft,
  IconMail,
  IconPhone,
  IconCalendar,
  IconEdit,
  IconTrash,
  IconPlus,
} from "../components/Icons.jsx";
import { initials, fullName, formatDate } from "../utils.js";

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [enrollCourseId, setEnrollCourseId] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.getStudent(id), api.getCourses()])
      .then(([s, c]) => {
        setStudent(s);
        setCourses(c);
      })
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(load, [load]);

  async function handleUpdate(payload) {
    try {
      const updated = await api.updateStudent(id, payload);
      setStudent((prev) => ({ ...prev, ...updated }));
      toast("Changes saved");
      setEditOpen(false);
    } catch (e) {
      toast(e.message, "error");
      throw e;
    }
  }

  async function handleDelete() {
    try {
      await api.deleteStudent(id);
      toast("Student removed");
      navigate("/students");
    } catch (e) {
      toast(e.message, "error");
    }
  }

  async function handleEnroll() {
    if (!enrollCourseId) return;
    try {
      await api.enrollStudent(id, Number(enrollCourseId));
      toast("Enrolled in course");
      setEnrollCourseId("");
      load();
    } catch (e) {
      toast(e.message, "error");
    }
  }

  async function handleGradeChange(enrollmentId, grade) {
    try {
      await api.updateEnrollmentGrade(enrollmentId, grade || null);
      toast("Grade updated");
      load();
    } catch (e) {
      toast(e.message, "error");
    }
  }

  async function handleUnenroll(enrollmentId) {
    try {
      await api.removeEnrollment(enrollmentId);
      toast("Removed from course");
      load();
    } catch (e) {
      toast(e.message, "error");
    }
  }

  if (loading) {
    return (
      <div className="main">
        <div
          className="skeleton"
          style={{ height: 32, width: 140, marginBottom: 20 }}
        />
        <div className="skeleton" style={{ height: 220 }} />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="main">
        <p>Student not found.</p>
        <Link to="/students" className="btn btn-ghost">
          <IconArrowLeft width={15} height={15} /> Back to students
        </Link>
      </div>
    );
  }

  const enrolledIds = new Set(student.enrollments.map((e) => e.course_id));
  const availableCourses = courses.filter((c) => !enrolledIds.has(c.id));

  return (
    <div className="main">
      <Link
        to="/students"
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 18 }}
      >
        <IconArrowLeft width={15} height={15} /> Back to students
      </Link>

      <div className="two-col">
        <div className="card card-pad" style={{ textAlign: "center" }}>
          <div
            className="avatar-badge"
            style={{
              background: student.avatar_color,
              width: 72,
              height: 72,
              fontSize: 26,
              margin: "0 auto 14px",
            }}
          >
            {initials(student.first_name, student.last_name)}
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 21,
              margin: "0 0 4px",
            }}
          >
            {fullName(student)}
          </h2>
          <div
            className="index-roll"
            style={{ display: "inline-block", marginBottom: 10 }}
          >
            {student.roll_no}
          </div>
          <div>
            <span
              className={`status-pill status-${student.status}`}
              style={{ margin: "0 auto" }}
            >
              {student.status}
            </span>
          </div>

          <div className="divider" />

          <div
            style={{
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              fontSize: 13.5,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                color: "var(--slate)",
                overflowWrap: "break-word",
                wordBreak: " break-word",
              }}
            >
              <IconMail width={15} height={15} /> {student.email}
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                color: "var(--slate)",
              }}
            >
              <IconPhone width={15} height={15} /> {student.phone || "—"}
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                color: "var(--slate)",
              }}
            >
              <IconCalendar width={15} height={15} /> DOB{" "}
              {formatDate(student.dob)}
            </div>
          </div>

          <div className="divider" />

          <div
            style={{
              textAlign: "left",
              fontSize: 13.5,
              color: "var(--slate)",
              lineHeight: 1.7,
            }}
          >
            <div>
              <strong style={{ color: "var(--ink)" }}>Batch:</strong>{" "}
              {student.batch_year || "—"}
            </div>
            <div>
              <strong style={{ color: "var(--ink)" }}>Gender:</strong>{" "}
              {student.gender || "—"}
            </div>
            <div>
              <strong style={{ color: "var(--ink)" }}>Guardian:</strong>{" "}
              {student.guardian_name || "—"}
            </div>
            <div>
              <strong style={{ color: "var(--ink)" }}>Address:</strong>{" "}
              {student.address || "—"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            <button
              className="btn btn-ghost"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={() => setEditOpen(true)}
            >
              <IconEdit width={15} height={15} /> Edit
            </button>
            <button
              className="btn btn-danger"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={() => setDeleteOpen(true)}
            >
              <IconTrash width={15} height={15} /> Delete
            </button>
          </div>
        </div>

        <div className="card card-pad">
          <h3 className="section-title">Enrolled courses</h3>

          {student.enrollments.length === 0 ? (
            <p style={{ color: "var(--slate)", fontSize: 14 }}>
              Not enrolled in any course yet.
            </p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Code</th>
                    <th>Grade</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {student.enrollments.map((e) => (
                    <tr key={e.enrollment_id}>
                      <td>{e.name}</td>
                      <td style={{ fontFamily: "var(--font-mono)" }}>
                        {e.code}
                      </td>
                      <td>
                        <select
                          className="select-filter"
                          style={{ padding: "6px 8px", fontSize: 13 }}
                          value={e.grade || ""}
                          onChange={(ev) =>
                            handleGradeChange(e.enrollment_id, ev.target.value)
                          }
                        >
                          <option value="">Ungraded</option>
                          {["A", "B", "C", "D", "F"].map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleUnenroll(e.enrollment_id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="divider" />

          <h3 className="section-title">Enroll in a new course</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select
              className="select-filter"
              style={{ flex: 1, minWidth: 200 }}
              value={enrollCourseId}
              onChange={(e) => setEnrollCourseId(e.target.value)}
            >
              <option value="">Select a course…</option>
              {availableCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
            <button
              className="btn btn-primary"
              onClick={handleEnroll}
              disabled={!enrollCourseId}
            >
              <IconPlus width={15} height={15} /> Enroll
            </button>
          </div>
        </div>
      </div>

      {editOpen && (
        <StudentFormModal
          initial={student}
          onClose={() => setEditOpen(false)}
          onSubmit={handleUpdate}
        />
      )}
      {deleteOpen && (
        <ConfirmDialog
          title="Remove this student?"
          message={`This will permanently delete ${fullName(student)} and their enrollment records.`}
          onCancel={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
