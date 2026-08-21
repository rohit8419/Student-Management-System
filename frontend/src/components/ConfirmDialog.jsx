import React from "react";

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  onCancel,
  onConfirm,
  danger = true,
}) {
  return (
    <div
      className="modal-scrim"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        className="modal"
        style={{ maxWidth: 420 }}
        role="alertdialog"
        aria-modal="true"
      >
        <div className="modal-body" style={{ paddingTop: 24 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 19,
              margin: "0 0 8px",
            }}
          >
            {title}
          </h2>
          <p style={{ color: "var(--slate)", fontSize: 14, margin: 0 }}>
            {message}
          </p>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
