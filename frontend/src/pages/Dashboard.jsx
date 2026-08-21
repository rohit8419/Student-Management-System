import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import {
  IconUsers,
  IconBook,
  IconGraduate,
  IconChart,
} from "../components/Icons.jsx";
import { initials, fullName, formatDate } from "../utils.js";

function BarRow({ label, value, max, color }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
      }}
    >
      <div
        style={{
          width: 96,
          fontSize: 13,
          color: "var(--slate)",
          flexShrink: 0,
        }}
      >
        {label}
      </div>
      <div
        style={{
          flex: 1,
          background: "var(--paper)",
          borderRadius: 6,
          height: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            background: color,
            height: "100%",
            borderRadius: 6,
            transition: "width 400ms ease",
          }}
        />
      </div>
      <div
        style={{
          width: 28,
          textAlign: "right",
          fontFamily: "var(--font-mono)",
          fontSize: 13,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="main">
        <div
          className="skeleton"
          style={{ height: 40, width: 280, marginBottom: 24 }}
        />
        <div className="stat-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 96 }} />
          ))}
        </div>
      </div>
    );
  }

  const genderColors = {
    Male: "#1b2a4a",
    Female: "#c9a227",
    Other: "#3a7d5c",
    Unspecified: "#8b93a1",
  };
  const maxGender = Math.max(...stats.genderBreakdown.map((g) => g.count), 1);
  const maxBatch = Math.max(...stats.batchBreakdown.map((b) => b.count), 1);
  const attendanceMap = Object.fromEntries(
    stats.todayAttendance.map((a) => [a.status, a.count]),
  );

  return (
    <div className="main">
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Registrar's Overview</div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-desc">
            A snapshot of enrollment, courses and today's attendance across
            campus.
          </p>
        </div>
        <Link to="/students" className="btn btn-gold">
          <IconUsers width={16} height={16} /> Manage students
        </Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card" style={{ "--accent": "#1b2a4a" }}>
          <div className="stat-label">Total students</div>
          <div className="stat-value">{stats.totalStudents}</div>
          <div className="stat-sub">
            {stats.activeStudents} currently active
          </div>
        </div>
        <div className="stat-card" style={{ "--accent": "#c9a227" }}>
          <div className="stat-label">Courses offered</div>
          <div className="stat-value">{stats.totalCourses}</div>
          <div className="stat-sub">across the current term</div>
        </div>
        <div className="stat-card" style={{ "--accent": "#3a7d5c" }}>
          <div className="stat-label">Present today</div>
          <div className="stat-value">{attendanceMap.present || 0}</div>
          <div className="stat-sub">
            {attendanceMap.absent || 0} absent · {attendanceMap.late || 0} late
          </div>
        </div>
        <div className="stat-card" style={{ "--accent": "#b9871f" }}>
          <div className="stat-label">Graduated</div>
          <div className="stat-value">{stats.graduated}</div>
          <div className="stat-sub">alumni on record</div>
        </div>
      </div>

      <div className="two-col">
        <div className="card card-pad">
          <h3 className="section-title">Gender breakdown</h3>
          {stats.genderBreakdown.map((g) => (
            <BarRow
              key={g.gender}
              label={g.gender}
              value={g.count}
              max={maxGender}
              color={genderColors[g.gender] || "#8b93a1"}
            />
          ))}

          <div className="divider" />

          <h3 className="section-title">By batch year</h3>
          {stats.batchBreakdown.map((b) => (
            <BarRow
              key={b.batch_year}
              label={String(b.batch_year)}
              value={b.count}
              max={maxBatch}
              color="#c9a227"
            />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card card-pad">
            <h3 className="section-title">Recently added students</h3>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll no.</th>
                    <th>Batch</th>
                    <th>Status</th>
                    <th>Added</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentStudents.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="row-name">
                          <div
                            className="row-avatar"
                            style={{ background: s.avatar_color }}
                          >
                            {initials(s.first_name, s.last_name)}
                          </div>
                          {fullName(s)}
                        </div>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)" }}>
                        {s.roll_no}
                      </td>
                      <td>{s.batch_year || "—"}</td>
                      <td>
                        <span className={`status-pill status-${s.status}`}>
                          {s.status}
                        </span>
                      </td>
                      <td>{formatDate(s.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card card-pad">
            <h3 className="section-title">Most enrolled courses</h3>
            {stats.topCourses.map((c) => (
              <div
                key={c.code}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "9px 0",
                  borderBottom: "1px solid var(--line-card)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--slate)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {c.code}
                  </div>
                </div>
                <div className="chip">
                  <IconBook width={13} height={13} /> {c.student_count} students
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
