/**
 * ui.js
 * DOM manipulation, rendering and UI helper functions.
 */

const UI = {

  // ── Navigation ──────────────────────────────────────────

  /** Show a page by id (e.g. 'dashboard') */
  showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    const page = document.getElementById(`page-${pageId}`);
    const link = document.querySelector(`[data-page="${pageId}"]`);

    if (page) page.classList.add('active');
    if (link) link.classList.add('active');

    const titles = {
      'dashboard':    'Dashboard',
      'add-student':  'Add New Student',
      'student-list': 'Student List',
      'about':        'About'
    };
    document.getElementById('page-title').textContent = titles[pageId] || '';
    window.scrollTo(0, 0);
  },

  // ── Toast Notifications ──────────────────────────────────

  toastTimer: null,

  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  },

  // ── Dashboard ────────────────────────────────────────────

  updateDashboard() {
    const students = Storage.getAll();
    const total    = students.length;
    const male     = students.filter(s => s.gender === 'Male').length;
    const female   = students.filter(s => s.gender === 'Female').length;
    const courses  = new Set(students.map(s => s.course)).size;

    document.getElementById('stat-total').textContent   = total;
    document.getElementById('stat-male').textContent    = male;
    document.getElementById('stat-female').textContent  = female;
    document.getElementById('stat-courses').textContent = courses;

    this._renderRecentStudents(students);
    this._renderDonutChart(total, male, female);
  },

  _renderRecentStudents(students) {
    const list = document.getElementById('recent-list');
    if (!students.length) {
      list.innerHTML = '<p class="no-data">No students added yet.</p>';
      return;
    }

    // Last 5 added (reversed)
    const recent = [...students].reverse().slice(0, 5);
    list.innerHTML = recent.map(s => `
      <div class="recent-item">
        <div class="recent-avatar">
          ${s.profilePic
            ? `<img src="${s.profilePic}" alt="${s.fullName}" />`
            : `<i class="fas fa-user-circle"></i>`}
        </div>
        <div class="recent-info">
          <h4>${this._esc(s.fullName)}</h4>
          <p>${this._esc(s.course)} &bull; ${this._esc(s.semester)} Semester</p>
        </div>
      </div>
    `).join('');
  },

  _renderDonutChart(total, male, female) {
    const circumference = 100;
    let malePercent   = total ? (male / total) * circumference : 0;
    let femalePercent = total ? (female / total) * circumference : 0;

    const donutMale   = document.getElementById('donut-male');
    const donutFemale = document.getElementById('donut-female');
    const center      = document.getElementById('donut-center');
    const lMale       = document.getElementById('legend-male');
    const lFemale     = document.getElementById('legend-female');

    // Male arc starts at 0 (offset 25 = 12 o'clock position)
    donutMale.setAttribute('stroke-dasharray', `${malePercent} ${circumference - malePercent}`);
    donutMale.setAttribute('stroke-dashoffset', '25');

    // Female arc starts after male
    const femaleOffset = 25 - malePercent;
    donutFemale.setAttribute('stroke-dasharray', `${femalePercent} ${circumference - femalePercent}`);
    donutFemale.setAttribute('stroke-dashoffset', femaleOffset.toString());

    center.innerHTML   = `${total}<br><small>Total</small>`;
    lMale.textContent  = male;
    lFemale.textContent = female;
  },

  // ── Student List Table ───────────────────────────────────

  renderStudentList(students) {
    const tbody = document.getElementById('students-tbody');
    const count = document.getElementById('result-count');

    count.textContent = `Showing ${students.length} student${students.length !== 1 ? 's' : ''}`;

    if (!students.length) {
      tbody.innerHTML = `
        <tr class="no-records">
          <td colspan="8"><i class="fas fa-inbox"></i><br>No students found.</td>
        </tr>`;
      return;
    }

    tbody.innerHTML = students.map(({ student: s, originalIndex: idx }) => `
      <tr>
        <td>
          <div class="table-avatar">
            ${s.profilePic
              ? `<img src="${s.profilePic}" alt="${this._esc(s.fullName)}" />`
              : `<i class="fas fa-user-circle"></i>`}
          </div>
        </td>
        <td><strong>${this._esc(s.studentId)}</strong></td>
        <td>${this._esc(s.fullName)}</td>
        <td>${this._esc(s.email)}</td>
        <td>${this._esc(s.course)}</td>
        <td><span class="sem-badge">${this._esc(s.semester)}</span></td>
        <td>${this._esc(s.city)}</td>
        <td>
          <button class="action-btn view"   title="View"   data-idx="${idx}"><i class="fas fa-eye"></i></button>
          <button class="action-btn edit"   title="Edit"   data-idx="${idx}"><i class="fas fa-edit"></i></button>
          <button class="action-btn delete" title="Delete" data-idx="${idx}"><i class="fas fa-trash-alt"></i></button>
        </td>
      </tr>
    `).join('');
  },

  // ── City Filter Population ───────────────────────────────

  populateCityFilter() {
    const select = document.getElementById('filter-city');
    const current = select.value;
    const cities = Storage.getUniqueCities();

    // Keep only the "All Cities" option, then re-add cities
    while (select.options.length > 1) select.remove(1);

    cities.forEach(city => {
      const opt = document.createElement('option');
      opt.value = city;
      opt.textContent = city;
      select.appendChild(opt);
    });

    // Restore previous selection if still valid
    if (cities.includes(current)) select.value = current;
  },

  // ── Student Detail Modal ─────────────────────────────────

  showDetailModal(student) {
    const avatar = document.getElementById('modal-avatar');
    avatar.innerHTML = student.profilePic
      ? `<img src="${student.profilePic}" alt="${this._esc(student.fullName)}" />`
      : `<i class="fas fa-user-circle"></i>`;

    document.getElementById('modal-name').textContent         = student.fullName;
    document.getElementById('modal-course-badge').textContent = student.course;

    const age = this._calcAge(student.dob);

    document.getElementById('modal-details').innerHTML = `
      <div class="detail-item">
        <label>Student ID</label>
        <p>${this._esc(student.studentId)}</p>
      </div>
      <div class="detail-item">
        <label>Father's Name</label>
        <p>${this._esc(student.fatherName)}</p>
      </div>
      <div class="detail-item">
        <label>Email</label>
        <p>${this._esc(student.email)}</p>
      </div>
      <div class="detail-item">
        <label>Phone</label>
        <p>${this._esc(student.phone)}</p>
      </div>
      <div class="detail-item">
        <label>Gender</label>
        <p>${this._esc(student.gender)}</p>
      </div>
      <div class="detail-item">
        <label>Date of Birth</label>
        <p>${this._formatDate(student.dob)} <em style="color:var(--text-light);font-size:0.8rem;">(Age: ${age})</em></p>
      </div>
      <div class="detail-item">
        <label>Course</label>
        <p>${this._esc(student.course)}</p>
      </div>
      <div class="detail-item">
        <label>Semester</label>
        <p>${this._esc(student.semester)} Semester</p>
      </div>
      <div class="detail-item">
        <label>City</label>
        <p>${this._esc(student.city)}</p>
      </div>
      <div class="detail-item full">
        <label>Address</label>
        <p>${this._esc(student.address)}</p>
      </div>
    `;

    document.getElementById('detail-modal').classList.add('open');
  },

  hideDetailModal() {
    document.getElementById('detail-modal').classList.remove('open');
  },

  // ── Delete Confirmation Modal ────────────────────────────

  showDeleteModal() {
    document.getElementById('delete-modal').classList.add('open');
  },

  hideDeleteModal() {
    document.getElementById('delete-modal').classList.remove('open');
  },

  // ── Form Management ──────────────────────────────────────

  resetForm() {
    document.getElementById('student-form').reset();
    document.getElementById('edit-index').value = '';
    document.getElementById('form-heading').innerHTML =
      '<i class="fas fa-user-plus"></i> Add New Student';
    document.getElementById('submit-btn').innerHTML =
      '<i class="fas fa-save"></i> Save Student';
    document.getElementById('pic-preview').innerHTML =
      '<i class="fas fa-user-circle"></i>';
    document.getElementById('pic-name').textContent = 'No file chosen';

    // Clear all errors
    document.querySelectorAll('.err').forEach(e => e.textContent = '');
    document.querySelectorAll('.error').forEach(e => e.classList.remove('error'));
  },

  fillEditForm(student, index) {
    const fields = ['studentId','fullName','fatherName','email','phone',
                    'gender','dob','course','semester','city','address'];
    fields.forEach(f => {
      const el = document.getElementById(f);
      if (el) el.value = student[f] || '';
    });

    document.getElementById('edit-index').value = index;
    document.getElementById('form-heading').innerHTML =
      '<i class="fas fa-user-edit"></i> Edit Student';
    document.getElementById('submit-btn').innerHTML =
      '<i class="fas fa-save"></i> Update Student';

    if (student.profilePic) {
      document.getElementById('pic-preview').innerHTML =
        `<img src="${student.profilePic}" alt="preview" />`;
      document.getElementById('pic-name').textContent = 'Photo loaded';
    } else {
      document.getElementById('pic-preview').innerHTML =
        '<i class="fas fa-user-circle"></i>';
      document.getElementById('pic-name').textContent = 'No file chosen';
    }

    // Clear errors
    document.querySelectorAll('.err').forEach(e => e.textContent = '');
    document.querySelectorAll('.error').forEach(e => e.classList.remove('error'));
  },

  showFieldError(field, message) {
    const errEl = document.getElementById(`err-${field}`);
    const input = document.getElementById(field);
    if (errEl) errEl.textContent = message;
    if (input) input.classList.add('error');
  },

  clearFieldError(field) {
    const errEl = document.getElementById(`err-${field}`);
    const input = document.getElementById(field);
    if (errEl) errEl.textContent = '';
    if (input) input.classList.remove('error');
  },

  showErrors(errors) {
    // Clear all first
    document.querySelectorAll('.err').forEach(e => e.textContent = '');
    document.querySelectorAll('.error').forEach(e => e.classList.remove('error'));

    for (const [field, msg] of Object.entries(errors)) {
      this.showFieldError(field, msg);
    }

    // Scroll to first error
    const firstErr = document.querySelector('.error');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  // ── Sidebar Toggle ───────────────────────────────────────

  toggleSidebar() {
    const isMobile = window.innerWidth <= 900;
    if (isMobile) {
      document.getElementById('sidebar').classList.toggle('mobile-open');
      document.querySelector('.sidebar-overlay').classList.toggle('active');
    } else {
      document.body.classList.toggle('sidebar-collapsed');
    }
  },

  closeMobileSidebar() {
    document.getElementById('sidebar').classList.remove('mobile-open');
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) overlay.classList.remove('active');
  },

  // ── Helpers ──────────────────────────────────────────────

  /** Escape HTML to prevent XSS */
  _esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  _formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
  },

  _calcAge(dateStr) {
    if (!dateStr) return '-';
    const dob  = new Date(dateStr);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  }
};
