// api/client.js
// Thin wrapper around fetch for talking to the Express/SQLite backend.
// Vite's dev server proxies /api -> http://localhost:5000 (see vite.config.js).

// const BASE = "/api";
const VITE_API_URL = "https://student-management-backend.onrender.com";
async function request(path, options = {}) {
  const res = await fetch(`${VITE_API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  // Students
  getStudents: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
    return request(`/students?${qs.toString()}`);
  },
  getStudent: (id) => request(`/students/${id}`),
  createStudent: (payload) =>
    request(`/students`, { method: "POST", body: JSON.stringify(payload) }),
  updateStudent: (id, payload) =>
    request(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteStudent: (id) => request(`/students/${id}`, { method: "DELETE" }),
  enrollStudent: (id, course_id) =>
    request(`/students/${id}/enroll`, {
      method: "POST",
      body: JSON.stringify({ course_id }),
    }),
  updateEnrollmentGrade: (enrollmentId, grade) =>
    request(`/students/enrollments/${enrollmentId}`, {
      method: "PUT",
      body: JSON.stringify({ grade }),
    }),
  removeEnrollment: (enrollmentId) =>
    request(`/students/enrollments/${enrollmentId}`, { method: "DELETE" }),

  // Courses
  getCourses: () => request(`/courses`),
  createCourse: (payload) =>
    request(`/courses`, { method: "POST", body: JSON.stringify(payload) }),
  updateCourse: (id, payload) =>
    request(`/courses/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteCourse: (id) => request(`/courses/${id}`, { method: "DELETE" }),

  // Dashboard
  getStats: () => request(`/dashboard/stats`),
};
