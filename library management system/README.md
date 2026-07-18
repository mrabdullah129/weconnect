#Dashboard#
<img width="947" height="442" alt="Screenshot 2026-07-18 130328" src="https://github.com/user-attachments/assets/52873387-ca2b-49ec-afce-7b7ef47e2abc" />
<img width="896" height="319" alt="Screenshot 2026-07-18 130339" src="https://github.com/user-attachments/assets/29e21223-0b78-410d-b0f3-79364ba6f82c" />
<img width="898" height="302" alt="Screenshot 2026-07-18 130348" src="https://github.com/user-attachments/assets/760a838f-bdde-4a3b-8c3d-b6e7a30fe604" />
<img width="898" height="296" alt="Screenshot 2026-07-18 130358" src="https://github.com/user-attachments/assets/4769513f-6ca2-4400-88c3-7bcd6e425882" />






# 📚 Library Management System

A full-stack, production-ready Library Management System built with **React.js + Node.js + Express.js + MySQL**.

---

## 🚀 Tech Stack

| Layer     | Technology                                          |
|-----------|-----------------------------------------------------|
| Frontend  | React 19, Vite, React Router DOM, Chart.js, Axios   |
| Backend   | Node.js, Express.js, JWT Auth, bcryptjs, Multer     |
| Database  | MySQL (via XAMPP)                                   |
| UI        | Custom CSS (Glassmorphism, Dark Mode, Responsive)   |

---

## ✨ Features

- **JWT Authentication** — Login, Logout, Change Password, Profile Management
- **Role-Based Access** — Admin & Librarian roles
- **Dashboard** — Live stats, charts (Bar, Line, Doughnut), recent activity
- **Books Module** — Full CRUD, cover image & PDF upload, search, filter, sort, export CSV
- **Categories, Authors, Publishers** — Complete CRUD with book counts
- **Members** — Registration, photo upload, membership tracking
- **Borrow Module** — Book availability check, borrow limits, duplicate prevention
- **Return Module** — Auto fine calculation, overdue detection
- **Fine Management** — Pay/waive fines, fine statistics
- **Reports** — Books, Members, Borrow, Return, Fine, Inventory — exportable to CSV
- **Settings** — Library config, user management, activity logs
- **Dark Mode** — Full theme toggle
- **Responsive** — Mobile-friendly layout

---

## 📁 Project Structure

```
library management system/
├── backend/
│   ├── config/          # DB connection, schema.sql, setup script
│   ├── controllers/     # Auth, Books, Members, Borrow, Return, Fines, Reports, Settings
│   ├── middleware/      # JWT auth, file uploads
│   ├── routes/          # All API routes
│   ├── uploads/         # Uploaded files (books, members, avatars)
│   ├── utils/           # Response helpers, activity logger
│   ├── server.js        # Express app entry point
│   └── .env             # Environment variables
│
└── frontend/
    └── src/
        ├── components/  # Sidebar, Topbar, Modal, Pagination, Charts, StatCard
        ├── context/     # AuthContext, ThemeContext
        ├── layouts/     # MainLayout
        ├── pages/       # All pages (dashboard, books, members, etc.)
        ├── routes/      # ProtectedRoute
        ├── services/    # Axios API instance
        └── utils/       # Helpers (format, export, alerts)
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v18+
- XAMPP (MySQL + Apache)
- npm

### Step 1 — Start XAMPP
Open XAMPP Control Panel and start **MySQL** (and optionally Apache).

### Step 2 — Backend Setup

```bash
cd backend

# Install dependencies (already done)
npm install

# Set up the database (creates DB + tables + sample data)
npm run setup-db

# Start the backend server
npm run dev
```

Backend runs at: `http://localhost:5000`

### Step 3 — Frontend Setup

```bash
cd frontend

# Install dependencies (already done)
npm install

# Start the development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔐 Default Login

| Field    | Value                  |
|----------|------------------------|
| Email    | admin@library.com      |
| Password | Admin@123              |
| Role     | Admin                  |

---

## 🌐 API Endpoints

| Module      | Endpoint               | Methods                    |
|-------------|------------------------|----------------------------|
| Auth        | /api/auth              | POST login/logout, GET me, PUT profile/change-password |
| Dashboard   | /api/dashboard         | GET stats, charts data     |
| Books       | /api/books             | GET, POST, PUT, DELETE      |
| Categories  | /api/categories        | GET, POST, PUT, DELETE      |
| Authors     | /api/authors           | GET, POST, PUT, DELETE      |
| Publishers  | /api/publishers        | GET, POST, PUT, DELETE      |
| Members     | /api/members           | GET, POST, PUT, DELETE      |
| Borrow      | /api/borrow            | GET, POST                   |
| Returns     | /api/returns           | GET, POST, GET calculate-fine |
| Fines       | /api/fines             | GET, PUT pay/waive          |
| Reports     | /api/reports           | GET books/members/borrow/return/fines/inventory |
| Settings    | /api/settings          | GET, PUT, activity-logs, users |

---

## 🎨 UI Highlights

- **Color Palette** — Primary: `#2563EB`, Success: `#22C55E`, Danger: `#EF4444`, Warning: `#F59E0B`
- **Design** — Glassmorphism cards, soft shadows, rounded corners, smooth animations
- **Dark Mode** — Full dark theme toggled via toolbar button
- **Responsive** — Sidebar collapses on mobile, grid adapts

---

## 📊 Database Tables

`users` · `roles` · `books` · `categories` · `authors` · `publishers` · `members` · `borrow_records` · `return_records` · `fines` · `settings` · `activity_logs`

---

## 🛠️ Environment Variables

**backend/.env**
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=library_management
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

**frontend/.env**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Library Management System
```
