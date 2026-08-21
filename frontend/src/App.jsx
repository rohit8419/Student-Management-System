import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import { IconMenu } from "./components/Icons.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Students from "./pages/Students.jsx";
import StudentDetail from "./pages/StudentDetail.jsx";
import Courses from "./pages/Courses.jsx";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="app-shell">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div>
          <div className="topbar">
            <button
              className="icon-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <IconMenu width={22} height={22} />
            </button>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
              Campus
            </div>
            <span style={{ width: 22 }} />
          </div>

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/:id" element={<StudentDetail />} />
            <Route path="/courses" element={<Courses />} />
            <Route
              path="*"
              element={
                <div className="main">
                  <p>Page not found.</p>
                </div>
              }
            />
          </Routes>
        </div>
      </div>
    </ToastProvider>
  );
}
