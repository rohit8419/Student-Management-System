import React, { useEffect, useState, useCallback } from "react";
import { api } from "../api/client.js";
import { useToast } from "../components/Toast.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconBook,
  IconClose,
  IconEmptyBox,
} from "../components/Icons.jsx";

const emptyForm = { name: "", code: "", instructor: "", credits: 3 };

function CourseFormModal({ initial, onClose, onSubmit }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [error, setError] = useState("");
  const isEdit = Boolean(initial);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      setError("Course name and code are required");
      return;
    }
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div
      className="modal-scrim"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal"
        style={{ maxWidth: 480 }}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-head">
          <h2>{isEdit ? "Edit course" : "Add a new course"}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose width={20} height={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="field full">
                <label htmlFor="c-name">Course name</label>
                <input
                  id="c-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Data Structures"
                />
              </div>
              <div className="field">
                <label htmlFor="c-code">Course code</label>
                <input
                  id="c-code"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="CS201"
                />
              </div>
              <div className="field">
                <label htmlFor="c-credits">Credits</label>
                <input
                  id="c-credits"
                  type="number"
                  min={1}
                  max={6}
                  value={form.credits}
                  onChange={(e) =>
                    setForm({ ...form, credits: Number(e.target.value) })
                  }
                />
              </div>
              <div className="field full">
                <label htmlFor="c-instructor">Instructor</label>
                <input
                  id="c-instructor"
                  value={form.instructor || ""}
                  onChange={(e) =>
                    setForm({ ...form, instructor: e.target.value })
                  }
                  placeholder="Dr. Mehta"
                />
              </div>
              {error && <div className="field full field-error">{error}</div>}
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? "Save changes" : "Add course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    api
      .getCourses()
      .then(setCourses)
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(load, [load]);

  async function handleCreate(payload) {
    await api.createCourse(payload);
    toast("Course added");
    setFormOpen(false);
    load();
  }

  async function handleUpdate(payload) {
    await api.updateCourse(editing.id, payload);
    toast("Course updated");
    setEditing(null);
    load();
  }

  async function handleDelete() {
    try {
      await api.deleteCourse(deleting.id);
      toast("Course removed");
      setDeleting(null);
      load();
    } catch (e) {
      toast(e.message, "error");
    }
  }

  return (
    <div className="main">
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Records</div>
          <h1 className="page-title">Courses</h1>
          <p className="page-desc">
            The catalog of courses offered this term, and who's enrolled.
          </p>
        </div>
        <button className="btn btn-gold" onClick={() => setFormOpen(true)}>
          <IconPlus width={16} height={16} /> Add course
        </button>
      </div>

      {loading ? (
        <div className="student-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 130 }} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <IconEmptyBox />
          <h3>No courses yet</h3>
          <p>Add your first course to start enrolling students.</p>
          <button className="btn btn-primary" onClick={() => setFormOpen(true)}>
            <IconPlus width={16} height={16} /> Add course
          </button>
        </div>
      ) : (
        <div className="student-grid">
          {courses.map((c) => (
            <div
              className="card card-pad"
              key={c.id}
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 9,
                    background: "var(--paper)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--gold)",
                  }}
                >
                  <IconBook width={19} height={19} />
                </div>
                <span className="index-roll">{c.code}</span>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 17,
                    fontWeight: 600,
                  }}
                >
                  {c.name}
                </div>
                <div
                  style={{ fontSize: 13, color: "var(--slate)", marginTop: 2 }}
                >
                  {c.instructor || "Instructor TBA"} · {c.credits} credits
                </div>
              </div>
              <div className="chip" style={{ width: "fit-content" }}>
                {c.student_count} students enrolled
              </div>
              <div className="index-card-actions">
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => setEditing(c)}
                >
                  <IconEdit width={14} height={14} /> Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => setDeleting(c)}
                >
                  <IconTrash width={14} height={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <CourseFormModal
          onClose={() => setFormOpen(false)}
          onSubmit={handleCreate}
        />
      )}
      {editing && (
        <CourseFormModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={handleUpdate}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Remove this course?"
          message={`This will delete "${deleting.name}" and unenroll all its students.`}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
