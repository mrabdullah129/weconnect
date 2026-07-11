// ===================================================
//  Student Result Management System — app.js
// ===================================================

// ---------- Constants ----------
const SUBJECTS = ['math', 'english', 'urdu', 'science', 'computer'];
const TOTAL_MARKS = SUBJECTS.length * 100; // 500
const PASS_PERCENTAGE = 40; // overall pass threshold

// ---------- Load from localStorage ----------
let students = JSON.parse(localStorage.getItem('students')) || [];

// ---------- Save to localStorage ----------
function saveToStorage() {
  localStorage.setItem('students', JSON.stringify(students));
}

// ===================================================
//  CALCULATION HELPERS
// ===================================================

/**
 * Calculate total marks from subject scores
 * @param {Object} marks - { math, english, urdu, science, computer }
 * @returns {number}
 */
function calcTotal(marks) {
  return SUBJECTS.reduce((sum, subj) => sum + Number(marks[subj]), 0);
}

/**
 * Calculate percentage
 * @param {number} total
 * @returns {string} e.g. "75.20"
 */
function calcPercentage(total) {
  return ((total / TOTAL_MARKS) * 100).toFixed(2);
}

/**
 * Calculate grade based on percentage
 * @param {number} percentage
 * @returns {string}
 */
function calcGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}

/**
 * Determine pass / fail
 * A student fails if overall percentage < 40 OR any subject < 33
 * @param {Object} marks
 * @param {number} percentage
 * @returns {string}
 */
function calcResult(marks, percentage) {
  const anySubjectFail = SUBJECTS.some(s => Number(marks[s]) < 33);
  if (percentage < PASS_PERCENTAGE || anySubjectFail) return 'Fail';
  return 'Pass';
}

// ===================================================
//  FORM HANDLING
// ===================================================

/**
 * Main form submit — handles both Add and Edit
 */
function handleFormSubmit(event) {
  event.preventDefault();

  if (!validateForm()) return;

  const editIndex = parseInt(document.getElementById('editIndex').value);
  const marks = {};
  SUBJECTS.forEach(s => (marks[s] = Number(document.getElementById(s).value)));

  const total = calcTotal(marks);
  const percentage = parseFloat(calcPercentage(total));
  const grade = calcGrade(percentage);
  const result = calcResult(marks, percentage);

  const studentData = {
    name: document.getElementById('studentName').value.trim(),
    roll: document.getElementById('rollNumber').value.trim(),
    className: document.getElementById('className').value.trim(),
    marks,
    total,
    percentage,
    grade,
    result,
  };

  if (editIndex === -1) {
    // ADD mode — check duplicate roll number
    const duplicate = students.find(s => s.roll === studentData.roll);
    if (duplicate) {
      showToast('⚠️ Roll number already exists!', 'error');
      return;
    }
    students.push(studentData);
    showToast('✅ Student added successfully!', 'success');
  } else {
    // EDIT mode
    students[editIndex] = studentData;
    showToast('✏️ Student updated successfully!', 'success');
  }

  saveToStorage();
  resetForm();
  renderTable(students);
  updateStats();
}

/**
 * Validate all form fields
 * @returns {boolean}
 */
function validateForm() {
  let valid = true;

  // Clear previous errors
  clearErrors();

  const name = document.getElementById('studentName').value.trim();
  const roll = document.getElementById('rollNumber').value.trim();
  const cls  = document.getElementById('className').value.trim();

  if (!name) {
    setError('nameError', 'studentName', 'Name is required');
    valid = false;
  } else if (name.length < 3) {
    setError('nameError', 'studentName', 'Name must be at least 3 characters');
    valid = false;
  }

  if (!roll) {
    setError('rollError', 'rollNumber', 'Roll number is required');
    valid = false;
  }

  if (!cls) {
    setError('classError', 'className', 'Class is required');
    valid = false;
  }

  SUBJECTS.forEach(subj => {
    const val = document.getElementById(subj).value;
    if (val === '' || val === null) {
      setError(`${subj}Error`, subj, 'Required');
      valid = false;
    } else if (Number(val) < 0 || Number(val) > 100) {
      setError(`${subj}Error`, subj, '0–100 only');
      valid = false;
    }
  });

  return valid;
}

function setError(errorId, inputId, message) {
  document.getElementById(errorId).textContent = message;
  document.getElementById(inputId).classList.add('invalid');
}

function clearErrors() {
  ['nameError', 'rollError', 'classError', ...SUBJECTS.map(s => `${s}Error`)].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  ['studentName', 'rollNumber', 'className', ...SUBJECTS].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('invalid');
  });
}

/**
 * Reset form to default Add state
 */
function resetForm() {
  document.getElementById('studentForm').reset();
  document.getElementById('editIndex').value = '-1';
  document.getElementById('formTitle').textContent = '➕ Add New Student';
  document.getElementById('submitBtn').textContent = '➕ Add Student';
  clearErrors();
}

// ===================================================
//  EDIT
// ===================================================
function editStudent(index) {
  const s = students[index];

  document.getElementById('studentName').value = s.name;
  document.getElementById('rollNumber').value  = s.roll;
  document.getElementById('className').value   = s.className;

  SUBJECTS.forEach(subj => {
    document.getElementById(subj).value = s.marks[subj];
  });

  document.getElementById('editIndex').value    = index;
  document.getElementById('formTitle').textContent = '✏️ Edit Student';
  document.getElementById('submitBtn').textContent = '💾 Update Student';

  // Scroll to form
  document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// ===================================================
//  DELETE
// ===================================================
function deleteStudent(index) {
  const student = students[index];
  if (!confirm(`Delete "${student.name}" (Roll: ${student.roll})? This cannot be undone.`)) return;

  students.splice(index, 1);
  saveToStorage();
  renderTable(students);
  updateStats();
  showToast('🗑️ Student deleted.', 'info');
}

// ===================================================
//  CLEAR ALL
// ===================================================
function clearAllStudents() {
  if (!confirm('Delete ALL students? This cannot be undone.')) return;
  students = [];
  saveToStorage();
  renderTable(students);
  updateStats();
  showToast('🗑️ All students removed.', 'info');
}

// ===================================================
//  SEARCH
// ===================================================
function searchStudents() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();

  if (!query) {
    renderTable(students);
    return;
  }

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(query) ||
    s.roll.toLowerCase().includes(query) ||
    s.className.toLowerCase().includes(query)
  );

  renderTable(filtered, query);
}

// ===================================================
//  RENDER TABLE
// ===================================================

/**
 * Render the results table
 * @param {Array} data - array of student objects to display
 * @param {string} query - optional search term for highlighting
 */
function renderTable(data, query = '') {
  const tbody = document.getElementById('tableBody');
  const emptyState = document.getElementById('emptyState');
  const clearAllBtn = document.getElementById('clearAllBtn');

  tbody.innerHTML = '';

  if (data.length === 0) {
    emptyState.style.display = 'block';
    clearAllBtn.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  clearAllBtn.style.display = students.length > 0 ? 'inline-block' : 'none';

  data.forEach((s, displayIndex) => {
    // Find the real index in the global students array for edit/delete
    const realIndex = students.indexOf(s);

    const gradeCls = `grade-${s.grade.replace('+', '-plus')}`;
    const resultCls = s.result === 'Pass' ? 'result-pass' : 'result-fail';
    const highlight = query ? 'highlight' : '';

    const row = document.createElement('tr');
    row.className = highlight;

    row.innerHTML = `
      <td>${displayIndex + 1}</td>
      <td><strong>${escapeHtml(s.name)}</strong></td>
      <td>${escapeHtml(s.roll)}</td>
      <td>${escapeHtml(s.className)}</td>
      <td>${s.marks.math}</td>
      <td>${s.marks.english}</td>
      <td>${s.marks.urdu}</td>
      <td>${s.marks.science}</td>
      <td>${s.marks.computer}</td>
      <td><strong>${s.total}</strong></td>
      <td>${s.percentage}%</td>
      <td><span class="grade-badge ${gradeCls}">${s.grade}</span></td>
      <td><span class="${resultCls}">${s.result}</span></td>
      <td>
        <div class="actions-cell">
          <button class="btn btn-edit" onclick="editStudent(${realIndex})">✏️ Edit</button>
          <button class="btn btn-delete" onclick="deleteStudent(${realIndex})">🗑️ Del</button>
        </div>
      </td>
    `;

    tbody.appendChild(row);
  });
}

// ===================================================
//  STATS
// ===================================================
function updateStats() {
  const total  = students.length;
  const passed = students.filter(s => s.result === 'Pass').length;
  const failed = total - passed;
  const avg    = total > 0
    ? (students.reduce((sum, s) => sum + s.percentage, 0) / total).toFixed(2)
    : 0;

  document.getElementById('totalStudents').textContent = total;
  document.getElementById('totalPassed').textContent   = passed;
  document.getElementById('totalFailed').textContent   = failed;
  document.getElementById('classAverage').textContent  = `${avg}%`;
}

// ===================================================
//  TOAST NOTIFICATION
// ===================================================

let toastTimer = null;

/**
 * Show a toast message
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ===================================================
//  UTILITY
// ===================================================

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===================================================
//  INIT — runs on page load
// ===================================================
(function init() {
  renderTable(students);
  updateStats();
})();
