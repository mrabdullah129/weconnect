/**
 * app.js
 * Main application controller — events, routing, search, filter, sort.
 */

// ── State ──────────────────────────────────────────────────
let pendingDeleteIndex = -1;
let currentProfilePic  = '';   // base64 string

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  _createSidebarOverlay();
  _bindNavigation();
  _bindSidebarToggle();
  _bindFormEvents();
  _bindListControls();
  _bindModalControls();

  // Boot on dashboard
  UI.showPage('dashboard');
  UI.updateDashboard();
});

// ── Overlay for mobile sidebar ──────────────────────────────
function _createSidebarOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  overlay.addEventListener('click', () => UI.closeMobileSidebar());
  document.body.appendChild(overlay);
}

// ── Navigation ─────────────────────────────────────────────
function _bindNavigation() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const page = link.dataset.page;
      _navigateTo(page);
      UI.closeMobileSidebar();
    });
  });

  // "Add Student" shortcut from list page
  document.getElementById('add-new-btn').addEventListener('click', () => {
    _navigateTo('add-student');
  });
}

function _navigateTo(page) {
  if (page === 'dashboard')    UI.updateDashboard();
  if (page === 'student-list') _loadStudentList();
  if (page === 'add-student') {
    UI.resetForm();
    currentProfilePic = '';
  }
  UI.showPage(page);
}

// ── Sidebar Toggle ──────────────────────────────────────────
function _bindSidebarToggle() {
  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    UI.toggleSidebar();
  });
}

// ── FORM: Add / Edit Student ────────────────────────────────
function _bindFormEvents() {

  // File input → preview
  const fileInput = document.getElementById('profilePic');
  fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      UI.showToast('Image size must be under 2MB.', 'error');
      fileInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      currentProfilePic = ev.target.result;
      document.getElementById('pic-preview').innerHTML =
        `<img src="${currentProfilePic}" alt="preview" />`;
      document.getElementById('pic-name').textContent = file.name;
    };
    reader.readAsDataURL(file);
  });

  // Real-time validation on blur
  const fields = ['studentId','fullName','fatherName','email','phone',
                  'gender','dob','course','semester','city','address'];
  fields.forEach(field => {
    const el = document.getElementById(field);
    if (!el) return;
    el.addEventListener('blur', () => {
      const editIndex = parseInt(document.getElementById('edit-index').value);
      const idx = isNaN(editIndex) ? -1 : editIndex;
      const err = Validation.validateField(field, el.value, idx);
      if (err) {
        UI.showFieldError(field, err);
      } else {
        UI.clearFieldError(field);
      }
    });

    // Clear error on input
    el.addEventListener('input', () => UI.clearFieldError(field));
  });

  // Reset button
  document.getElementById('reset-form-btn').addEventListener('click', () => {
    UI.resetForm();
    currentProfilePic = '';
  });

  // Form submit
  document.getElementById('student-form').addEventListener('submit', e => {
    e.preventDefault();
    _handleFormSubmit();
  });
}

function _getFormData() {
  return {
    studentId:  document.getElementById('studentId').value.trim(),
    fullName:   document.getElementById('fullName').value.trim(),
    fatherName: document.getElementById('fatherName').value.trim(),
    email:      document.getElementById('email').value.trim().toLowerCase(),
    phone:      document.getElementById('phone').value.trim(),
    gender:     document.getElementById('gender').value,
    dob:        document.getElementById('dob').value,
    course:     document.getElementById('course').value,
    semester:   document.getElementById('semester').value,
    city:       document.getElementById('city').value.trim(),
    address:    document.getElementById('address').value.trim(),
    profilePic: currentProfilePic
  };
}

function _handleFormSubmit() {
  const data = _getFormData();
  const editIndexRaw = document.getElementById('edit-index').value;
  const editIndex = editIndexRaw !== '' ? parseInt(editIndexRaw) : -1;

  const { valid, errors } = Validation.validateAll(data, editIndex);

  if (!valid) {
    UI.showErrors(errors);
    UI.showToast('Please fix the errors below.', 'error');
    return;
  }

  if (editIndex === -1) {
    // New student — add timestamp
    data.createdAt = new Date().toISOString();
    Storage.add(data);
    UI.showToast('Student added successfully!', 'success');
  } else {
    // Update — preserve original createdAt
    const existing = Storage.getAll()[editIndex];
    data.createdAt = existing.createdAt;
    Storage.update(editIndex, data);
    UI.showToast('Student updated successfully!', 'success');
  }

  UI.resetForm();
  currentProfilePic = '';
  UI.populateCityFilter();

  // Go to student list after save
  _navigateTo('student-list');
}

// ── STUDENT LIST: Search, Filter, Sort ─────────────────────
function _bindListControls() {
  ['search-input','filter-gender','filter-course',
   'filter-semester','filter-city','sort-by'].forEach(id => {
    document.getElementById(id).addEventListener('input', _loadStudentList);
    document.getElementById(id).addEventListener('change', _loadStudentList);
  });

  // Table action buttons (event delegation)
  document.getElementById('students-tbody').addEventListener('click', e => {
    const btn = e.target.closest('.action-btn');
    if (!btn) return;
    const idx = parseInt(btn.dataset.idx);

    if (btn.classList.contains('view'))   _viewStudent(idx);
    if (btn.classList.contains('edit'))   _editStudent(idx);
    if (btn.classList.contains('delete')) _confirmDelete(idx);
  });
}

function _loadStudentList() {
  UI.populateCityFilter();

  let students = Storage.getAll();

  // Attach original indices before filtering
  let indexed = students.map((student, originalIndex) => ({ student, originalIndex }));

  // ── Search ──
  const query = document.getElementById('search-input').value.trim().toLowerCase();
  if (query) {
    indexed = indexed.filter(({ student: s }) =>
      s.fullName.toLowerCase().includes(query)   ||
      s.email.toLowerCase().includes(query)       ||
      s.studentId.toLowerCase().includes(query)
    );
  }

  // ── Filters ──
  const gender   = document.getElementById('filter-gender').value;
  const course   = document.getElementById('filter-course').value;
  const semester = document.getElementById('filter-semester').value;
  const city     = document.getElementById('filter-city').value;

  if (gender)   indexed = indexed.filter(({ student: s }) => s.gender === gender);
  if (course)   indexed = indexed.filter(({ student: s }) => s.course === course);
  if (semester) indexed = indexed.filter(({ student: s }) => s.semester === semester);
  if (city)     indexed = indexed.filter(({ student: s }) => s.city === city);

  // ── Sort ──
  const sortBy = document.getElementById('sort-by').value;
  if (sortBy === 'name-asc') {
    indexed.sort((a, b) => a.student.fullName.localeCompare(b.student.fullName));
  } else if (sortBy === 'name-desc') {
    indexed.sort((a, b) => b.student.fullName.localeCompare(a.student.fullName));
  } else if (sortBy === 'newest') {
    indexed.sort((a, b) => new Date(b.student.createdAt) - new Date(a.student.createdAt));
  } else if (sortBy === 'oldest') {
    indexed.sort((a, b) => new Date(a.student.createdAt) - new Date(b.student.createdAt));
  } else if (sortBy === 'semester') {
    const semOrder = ['1st','2nd','3rd','4th','5th','6th','7th','8th'];
    indexed.sort((a, b) =>
      semOrder.indexOf(a.student.semester) - semOrder.indexOf(b.student.semester)
    );
  }

  UI.renderStudentList(indexed);
}

// ── View Student ────────────────────────────────────────────
function _viewStudent(index) {
  const student = Storage.getAll()[index];
  if (!student) return;
  UI.showDetailModal(student);
}

// ── Edit Student ────────────────────────────────────────────
function _editStudent(index) {
  const student = Storage.getAll()[index];
  if (!student) return;

  currentProfilePic = student.profilePic || '';
  UI.fillEditForm(student, index);
  // showPage already handles nav active state
  UI.showPage('add-student');
  document.getElementById('page-title').textContent = 'Edit Student';
}

// ── Delete Student ──────────────────────────────────────────
function _confirmDelete(index) {
  pendingDeleteIndex = index;
  UI.showDeleteModal();
}

// ── Modal Controls ──────────────────────────────────────────
function _bindModalControls() {

  // Detail modal close
  document.getElementById('modal-close').addEventListener('click', () => {
    UI.hideDetailModal();
  });
  document.getElementById('detail-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) UI.hideDetailModal();
  });

  // Delete modal
  document.getElementById('cancel-delete').addEventListener('click', () => {
    pendingDeleteIndex = -1;
    UI.hideDeleteModal();
  });

  document.getElementById('confirm-delete').addEventListener('click', () => {
    if (pendingDeleteIndex === -1) return;
    Storage.delete(pendingDeleteIndex);
    pendingDeleteIndex = -1;
    UI.hideDeleteModal();
    UI.showToast('Student deleted successfully.', 'info');
    _loadStudentList();
    UI.updateDashboard();
  });

  document.getElementById('delete-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) {
      pendingDeleteIndex = -1;
      UI.hideDeleteModal();
    }
  });

  // ESC key closes modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      UI.hideDetailModal();
      UI.hideDeleteModal();
    }
  });
}
