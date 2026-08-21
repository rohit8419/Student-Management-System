import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useToast } from "../components/Toast.jsx";
import StudentFormModal from "../components/StudentFormModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconEmptyBox,
} from "../components/Icons.jsx";
import { initials, fullName } from "../utils.js";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    api
      .getStudents({ search, status })
      .then(setStudents)
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, [search, status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce search
    return () => clearTimeout(t);
  }, [load]);

  async function handleCreate(payload) {
    try {
      await api.createStudent(payload);
      toast("Student added");
      setFormOpen(false);
      load();
    } catch (e) {
      toast(e.message, "error");
      throw e;
    }
  }

  async function handleUpdate(payload) {
    try {
      await api.updateStudent(editing.id, payload);
      toast("Changes saved");
      setEditing(null);
      load();
    } catch (e) {
      toast(e.message, "error");
      throw e;
    }
  }

  async function handleDelete() {
    try {
      await api.deleteStudent(deleting.id);
      toast("Student removed");
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
          <h1 className="page-title">Students</h1>
          <p className="page-desc">
            Browse, search and manage every student on file.
          </p>
        </div>
        <button className="btn btn-gold" onClick={() => setFormOpen(true)}>
          <IconPlus width={16} height={16} /> Add student
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <IconSearch width={17} height={17} />
          <input
            placeholder="Search by name, roll number or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search students"
          />
        </div>
        <select
          className="select-filter"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="graduated">Graduated</option>
        </select>
      </div>

      {loading ? (
        <div className="student-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 172 }} />
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="empty-state">
          <IconEmptyBox />
          <h3>No students found</h3>
          <p>Try a different search, or add a new student to the register.</p>
          <button className="btn btn-primary" onClick={() => setFormOpen(true)}>
            <IconPlus width={16} height={16} /> Add student
          </button>
        </div>
      ) : (
        <div className="student-grid">
          {students.map((s) => (
            <div className="index-card" key={s.id}>
              <div className="index-card-top">
                <span className="index-roll">{s.roll_no}</span>
                <span className={`status-pill status-${s.status}`}>
                  {s.status}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  className="avatar-badge"
                  style={{ background: s.avatar_color }}
                >
                  {initials(s.first_name, s.last_name)}
                </div>
                <div>
                  <div className="index-name">
                    <Link
                      to={`/students/${s.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      {fullName(s)}
                    </Link>
                  </div>
                  <div className="index-meta">
                    <span className="email">{s.email}</span>
                    <span>Batch {s.batch_year || "—"}</span>
                  </div>
                </div>
              </div>
              <div className="index-card-actions">
                <Link
                  to={`/students/${s.id}`}
                  className="btn btn-ghost btn-sm"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  View
                </Link>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditing(s)}
                  aria-label={`Edit ${fullName(s)}`}
                >
                  <IconEdit width={15} height={15} />
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => setDeleting(s)}
                  aria-label={`Delete ${fullName(s)}`}
                >
                  <IconTrash width={15} height={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <StudentFormModal
          onClose={() => setFormOpen(false)}
          onSubmit={handleCreate}
        />
      )}
      {editing && (
        <StudentFormModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={handleUpdate}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Remove this student?"
          message={`This will permanently delete ${fullName(deleting)} (${deleting.roll_no}) and their enrollment records.`}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
