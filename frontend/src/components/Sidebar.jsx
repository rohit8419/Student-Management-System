import React from "react";
import campusLogo from "../assets/campus-logo.png";

import { NavLink } from "react-router-dom";
import {
  IconGrid,
  IconUsers,
  IconBook,
  IconChart,
  IconClose,
} from "./Icons.jsx";

export default function Sidebar({ open, onClose }) {
  const linkClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;

  return (
    <>
      <aside
        className={`sidebar${open ? " open" : ""}`}
        aria-label="Main navigation"
      >
        <div className="brand">
          <img className="brand-mark" src={campusLogo} alt="c" />
          <div className="brand-text">
            <div className="name">Campus</div>
            <div className="sub">Student Registry</div>
          </div>
          <button
            className="icon-btn"
            style={{ marginLeft: "auto", display: open ? "flex" : "none" }}
            onClick={onClose}
            aria-label="Close menu"
          >
            <IconClose width={20} height={20} />
          </button>
        </div>

        <div className="nav-group">
          <div className="nav-label">Overview</div>
          <NavLink to="/" end className={linkClass} onClick={onClose}>
            <IconChart /> Dashboard
          </NavLink>
        </div>

        <div className="nav-group">
          <div className="nav-label">Records</div>
          <NavLink to="/students" className={linkClass} onClick={onClose}>
            <IconUsers /> Students
          </NavLink>
          <NavLink to="/courses" className={linkClass} onClick={onClose}>
            <IconBook /> Courses
          </NavLink>
        </div>

        <div className="sidebar-footer">
          Campus SMS v1.0
          <br />
          React · Express · SQLite
        </div>
      </aside>
      <div className={`scrim${open ? " open" : ""}`} onClick={onClose} />
    </>
  );
}
