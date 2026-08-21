# Campus — Student Management System

A full-stack, responsive Student Management System.

- **Frontend:** React 18 + React Router (Vite)
- **Backend:** Node.js + Express (REST API)
- **Database:** SQLite (via `better-sqlite3`) — a single file, zero setup
- **Design:** custom "registrar's ledger" UI — no UI framework, hand-built CSS

## Features

- Dashboard with live stats (enrollment, attendance, gender/batch breakdown, top courses)
- Students: search, filter by status, add / edit / delete, detail profile page
- Courses: add / edit / delete, see enrolled student count
- Enroll a student in a course and record/update their grade, right from the profile page
- Fully responsive — collapses to a mobile drawer nav below 900px
- Data is seeded automatically on first run (24 sample students, 5 courses) so it looks good immediately

## Project structure

```
student-management-system/
├── backend/            Express API + SQLite database
│   ├── db/database.js  Schema + auto-seed logic
│   ├── routes/         students.js, courses.js, dashboard.js
│   └── server.js       App entry point (port 5000)
└── frontend/            React app (Vite)
    └── src/
        ├── api/client.js       Fetch wrapper for the backend
        ├── components/          Sidebar, modals, icons, toast
        ├── pages/                Dashboard, Students, StudentDetail, Courses
        └── index.css            Design system (colors, type, components)
```

## Running it locally

You need **Node.js 18+** installed. Two terminals, two servers:

**1. Backend** (http://localhost:5000)
```bash
cd backend
npm install
npm run dev
```
This also creates `backend/db/sms.db` and seeds it with sample data the first time it runs.

**2. Frontend** (http://localhost:5173)
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** — the Vite dev server proxies `/api/*` calls to the backend automatically (see `vite.config.js`), so no extra configuration is needed.

## Building for production

```bash
cd frontend
npm run build       # outputs static files to frontend/dist
```
Serve `frontend/dist` with any static host, and run the backend (`npm start` inside `backend/`) behind it — point your web server / reverse proxy so that `/api` reaches the Express server on port 5000.

## API overview

| Method | Route                                   | Purpose                       |
|--------|------------------------------------------|--------------------------------|
| GET    | `/api/students?search=&status=`          | List / search students        |
| GET    | `/api/students/:id`                      | Student profile + enrollments |
| POST   | `/api/students`                          | Create student                |
| PUT    | `/api/students/:id`                      | Update student                |
| DELETE | `/api/students/:id`                      | Delete student                |
| POST   | `/api/students/:id/enroll`               | Enroll in a course             |
| PUT    | `/api/students/enrollments/:enrollmentId`| Update a grade                 |
| DELETE | `/api/students/enrollments/:enrollmentId`| Unenroll from a course          |
| GET    | `/api/courses`                           | List courses                   |
| POST   | `/api/courses`                           | Create course                  |
| PUT    | `/api/courses/:id`                       | Update course                  |
| DELETE | `/api/courses/:id`                       | Delete course                  |
| GET    | `/api/dashboard/stats`                   | Aggregate dashboard stats       |

## Notes

- To reset the sample data, just delete `backend/db/sms.db` (and its `.db-wal`/`.db-shm` files) and restart the backend — it will reseed.
- The whole thing is dependency-light on purpose: no Redux, no CSS framework, no chart library — it uses plain React state, hand-rolled SVG icons, and CSS custom properties, so it's easy to read and extend.
