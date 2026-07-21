# 🎵 Musicify - Music Player (Local JSON Storage)

No MongoDB needed! All data is saved in a local **JSON file**.

---

## 🚀 Quick Start

### Step 1 — Backend Setup

```bash
cd backend
npm install
npm run dev
```

Server starts at: `http://localhost:5000`
Data saves to: `backend/db/data.json`

---

### Step 2 — Frontend Setup

Open a **new terminal**:

```bash
cd frontend
npm install
npm start
```

App opens at: `http://localhost:3000`

---

## 👑 Make Yourself Admin

1. First **register** an account on the app
2. Then run this command:

```bash
cd backend
node scripts/makeAdmin.js your@email.com
```

Now login again — you'll see the Admin Dashboard!

---

## 📁 Project Structure

```
backend/
  db/
    data.json        ← All data stored here (songs, users, playlists)
  routes/            ← API endpoints
  middleware/        ← JWT auth
  scripts/           ← makeAdmin.js
  server.js

frontend/
  src/
    pages/           ← All pages
    components/      ← Player, Sidebar, SongCard, SongRow
    context/         ← Auth + Player state
```

---

## ✅ Features

| Feature | Status |
|---|---|
| Register / Login | ✅ |
| JWT Auth | ✅ |
| Music Player (Play/Pause/Next/Prev/Seek/Volume) | ✅ |
| Shuffle & Repeat modes | ✅ |
| Search songs | ✅ |
| Browse by Genre | ✅ |
| Playlists (Create/Delete/Rename/Add songs) | ✅ |
| Favorites / Liked Songs | ✅ |
| Admin Dashboard | ✅ |
| Admin: Add/Edit/Delete songs | ✅ |
| 10 Sample songs pre-loaded | ✅ |
| No MongoDB needed | ✅ |

---

## 🔌 API Endpoints

| Method | URL | Description |
|---|---|---|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/songs | All songs |
| GET | /api/songs/trending | Trending |
| GET | /api/search?q= | Search |
| GET | /api/playlists | My playlists |
| POST | /api/playlists | Create playlist |
| GET | /api/favorites | Liked songs |
| POST | /api/admin/upload-song | Add song (admin) |
| PUT | /api/admin/songs/:id | Edit song (admin) |
| DELETE | /api/admin/songs/:id | Delete song (admin) |
| GET | /api/admin/stats | Dashboard stats |
