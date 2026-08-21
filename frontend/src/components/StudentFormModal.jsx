import React, { useState } from "react";
import { IconClose } from "./Icons.jsx";

const AVATAR_COLORS = ["#1b2a4a", "#c9a227", "#3a7d5c", "#8a4b3b", "#5b6472"];

const emptyForm = {
  roll_no: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  gender: "Male",
  dob: "",
  address: "",
  guardian_name: "",
  batch_year: new Date().getFullYear(),
  status: "active",
  avatar_color: AVATAR_COLORS[0],
};

export default function StudentFormModal({ initial, onClose, onSubmit }) {
  const [form, setForm] = useState(
    initial ? { ...emptyForm, ...initial } : emptyForm,
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const e = {};
    if (!form.roll_no?.trim()) e.roll_no = "Roll number is required";
    if (!form.first_name?.trim()) e.first_name = "First name is required";
    if (!form.last_name?.trim()) e.last_name = "Last name is required";
    if (!form.email?.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="modal-scrim"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-form-title"
      >
        <div className="modal-head">
          <h2 id="student-form-title">
            {isEdit ? "Edit student record" : "Add a new student"}
          </h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose width={20} height={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="roll_no">Roll number</label>
                <input
                  id="roll_no"
                  value={form.roll_no}
                  onChange={(e) => update("roll_no", e.target.value)}
                  placeholder="STU1001"
                />
                {errors.roll_no && (
                  <span className="field-error">{errors.roll_no}</span>
                )}
              </div>
              <div className="field">
                <label htmlFor="batch_year">Batch year</label>
                <input
                  id="batch_year"
                  type="number"
                  value={form.batch_year}
                  onChange={(e) => update("batch_year", Number(e.target.value))}
                />
              </div>

              <div className="field">
                <label htmlFor="first_name">First name</label>
                <input
                  id="first_name"
                  value={form.first_name}
                  onChange={(e) => update("first_name", e.target.value)}
                />
                {errors.first_name && (
                  <span className="field-error">{errors.first_name}</span>
                )}
              </div>
              <div className="field">
                <label htmlFor="last_name">Last name</label>
                <input
                  id="last_name"
                  value={form.last_name}
                  onChange={(e) => update("last_name", e.target.value)}
                />
                {errors.last_name && (
                  <span className="field-error">{errors.last_name}</span>
                )}
              </div>

              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
                {errors.email && (
                  <span className="field-error">{errors.email}</span>
                )}
              </div>
              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  value={form.phone || ""}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="98XXXXXXXX"
                />
              </div>

              <div className="field">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  value={form.gender || ""}
                  onChange={(e) => update("gender", e.target.value)}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="dob">Date of birth</label>
                <input
                  id="dob"
                  type="date"
                  value={form.dob || ""}
                  onChange={(e) => update("dob", e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="guardian_name">Guardian name</label>
                <input
                  id="guardian_name"
                  value={form.guardian_name || ""}
                  onChange={(e) => update("guardian_name", e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="graduated">Graduated</option>
                </select>
              </div>

              <div className="field full">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  rows={2}
                  value={form.address || ""}
                  onChange={(e) => update("address", e.target.value)}
                />
              </div>

              <div className="field full">
                <label>Card color</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {AVATAR_COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => update("avatar_color", c)}
                      aria-label={`Choose color ${c}`}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: c,
                        cursor: "pointer",
                        border:
                          form.avatar_color === c
                            ? "3px solid var(--gold)"
                            : "1px solid var(--line)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
