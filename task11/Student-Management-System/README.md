# 🎓 EduManage — Student Management System

A fully client-side **Student Management System** built with pure **HTML, CSS, and JavaScript**. No backend, no database — all data is stored in the browser's **Local Storage**.

---

## 📁 Folder Structure

```
Student-Management-System/
│
├── index.html              # Main HTML file (single-page app)
│
├── css/
│   ├── style.css           # Main styles, layout, components
│   └── responsive.css      # Mobile, tablet, laptop breakpoints
│
└── js/
    ├── app.js              # Main controller — routing, events, logic
    ├── storage.js          # Local Storage CRUD operations
    ├── validation.js       # Form validation rules
    └── ui.js               # DOM rendering & UI helpers
```

---

## 🚀 Getting Started

No installation or server required.

1. Download or clone the project
2. Open `index.html` in any modern browser
3. Start managing students!

```
Double-click index.html  →  Opens in browser  →  Ready to use ✅
```

---

## 📸 Pages & Features

### 🏠 Dashboard
- **Total Students** count
- **Male / Female** student counts
- **Total Courses** in use
- **Recently Added Students** list (last 5)
- **Gender Distribution** — animated SVG donut chart

### ➕ Add Student
Full form with these fields:

| Field | Required |
|-------|----------|
| Student ID | ✅ |
| Full Name | ✅ |
| Father Name | ✅ |
| Email | ✅ |
| Phone Number | ✅ |
| Gender | ✅ |
| Date of Birth | ✅ |
| Course | ✅ |
| Semester | ✅ |
| City | ✅ |
| Address | ✅ |
| Profile Picture | ⬜ Optional |

### 📋 Student List
- All students displayed in a clean table
- Columns: Picture, Student ID, Name, Email, Course, Semester, City, Actions
- Action buttons: **View 👁 · Edit ✏️ · Delete 🗑**

### 🔍 Search
Searches simultaneously across:
- Full Name
- Email
- Student ID

### 🔽 Filters
- Gender (Male / Female / Other)
- Course
- Semester
- City (auto-populated from existing data)

### 🔃 Sort
- Name A → Z
- Name Z → A
- Latest Added
- Oldest Added
- Semester (1st → 8th)

### 👁 View Student Details
Modal popup showing complete student profile:
- Profile picture, name, course badge
- Father name, email, phone, DOB (with calculated age)
- Gender, semester, city, address

### ✏️ Edit Student
- Click Edit on any row
- Form pre-fills with existing data
- Duplicate validation skips the student's own ID/email

### 🗑 Delete Student
- Confirmation modal: **"Are you sure?"**
- Yes → deletes permanently
- No → cancels safely

---

## ✅ Validation Rules

| Field | Rule |
|-------|------|
| Student ID | Required, must be unique |
| Full Name | Required, letters only, min 3 chars |
| Father Name | Required, min 3 chars |
| Email | Required, valid format, must be unique |
| Phone | Required, exactly 11 digits |
| Gender | Required |
| Date of Birth | Required, must be in the past, age 5–80 |
| Course | Required |
| Semester | Required |
| City | Required, min 2 chars |
| Address | Required, min 5 chars |
| Profile Picture | Optional, max size 2MB |

---

## 💾 Local Storage

All data is saved in the browser's Local Storage under the key `sms_students`.

- Data **persists** after browser refresh or close
- Data is stored as a **JSON array** of student objects
- No internet connection required after first load

---

## 📱 Responsive Design

| Device | Behavior |
|--------|----------|
| 💻 Desktop (>1024px) | Full sidebar + multi-column layout |
| 🖥 Laptop (900–1024px) | Slightly narrower sidebar |
| 📱 Tablet (≤900px) | Sidebar becomes slide-in overlay |
| 📱 Mobile (≤640px) | Single-column, stacked controls |

---

## 🧠 JavaScript Concepts Used

| Concept | Used For |
|---------|----------|
| Variables & Data Types | Student data, state management |
| Operators & Conditions | Validation checks, filters |
| Loops | Rendering lists, clearing errors |
| Functions & Arrow Functions | Modular code structure |
| Arrays & Objects | Student records |
| Array Methods | `map`, `filter`, `find`, `sort`, `some`, `splice` |
| DOM Manipulation | Rendering UI, form handling |
| Events | Click, submit, input, blur, keydown |
| Form & Validation | Full form with real-time feedback |
| Local Storage | Persistent data storage |
| JSON | Serialize/deserialize student data |
| Template Literals | HTML generation |
| Destructuring | Extracting object properties |
| Spread Operator | Copying arrays |
| Date Object | Age calculation, timestamps |
| Search | Real-time multi-field search |
| Filter | Multi-criteria filtering |
| Sort | Multiple sort strategies |

---

## 🛠 Tech Stack

| Technology | Version |
|------------|---------|
| HTML | HTML5 |
| CSS | CSS3 (Custom Properties, Grid, Flexbox) |
| JavaScript | ES6+ (Vanilla, no frameworks) |
| Icons | Font Awesome 6.5 (CDN) |
| Storage | Browser Local Storage API |

> ⚠️ Requires an internet connection only to load Font Awesome icons from CDN.  
> All other functionality works completely offline.

---

## 🔧 Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ |
| Firefox | ✅ |
| Edge | ✅ |
| Safari | ✅ |
| Opera | ✅ |

---

## 📌 Notes

- Profile pictures are stored as **Base64 strings** in Local Storage. For many students with large images, this can increase storage usage. Keep images under 2MB.
- Local Storage has a browser limit of ~5MB. For large datasets, consider exporting to JSON.
- This project is intended for **learning purposes** and small-scale admin use.

---

## 👨‍💻 Author

Built as a frontend JavaScript practice project covering real-world CRUD operations, DOM manipulation, form validation, and responsive design — without any frameworks or libraries.
