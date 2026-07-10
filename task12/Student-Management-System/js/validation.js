/**
 * validation.js
 * Form validation logic for student data.
 */

const Validation = {

  rules: {
    studentId: {
      required: true,
      label: 'Student ID',
      custom(val, editIndex) {
        if (!val.trim()) return 'Student ID is required.';
        if (Storage.isDuplicate('studentId', val.trim(), editIndex))
          return 'This Student ID already exists.';
        return null;
      }
    },
    fullName: {
      required: true,
      label: 'Full Name',
      minLen: 3,
      pattern: /^[a-zA-Z\s]+$/,
      patternMsg: 'Full Name should contain only letters.'
    },
    fatherName: {
      required: true,
      label: 'Father Name',
      minLen: 3
    },
    email: {
      required: true,
      label: 'Email',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMsg: 'Please enter a valid email address.',
      custom(val, editIndex) {
        if (!val.trim()) return 'Email is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()))
          return 'Please enter a valid email address.';
        if (Storage.isDuplicate('email', val.trim().toLowerCase(), editIndex))
          return 'This email is already registered.';
        return null;
      }
    },
    phone: {
      required: true,
      label: 'Phone Number',
      custom(val) {
        if (!val.trim()) return 'Phone number is required.';
        if (!/^\d{11}$/.test(val.trim())) return 'Phone number must be exactly 11 digits.';
        return null;
      }
    },
    gender: {
      required: true,
      label: 'Gender'
    },
    dob: {
      required: true,
      label: 'Date of Birth',
      custom(val) {
        if (!val) return 'Date of Birth is required.';
        const dob = new Date(val);
        const today = new Date();
        if (dob >= today) return 'Date of Birth must be in the past.';
        const age = today.getFullYear() - dob.getFullYear();
        if (age < 5 || age > 80) return 'Please enter a valid date of birth.';
        return null;
      }
    },
    course: {
      required: true,
      label: 'Course'
    },
    semester: {
      required: true,
      label: 'Semester'
    },
    city: {
      required: true,
      label: 'City',
      minLen: 2
    },
    address: {
      required: true,
      label: 'Address',
      minLen: 5
    }
  },

  /**
   * Validate a single field value.
   * @param {string} field  - field name
   * @param {string} value  - field value
   * @param {number} editIndex - index being edited (-1 for new)
   * @returns {string|null} error message or null
   */
  validateField(field, value, editIndex = -1) {
    const rule = this.rules[field];
    if (!rule) return null;

    const v = typeof value === 'string' ? value.trim() : value;

    // Custom validator takes full control
    if (rule.custom) return rule.custom(v, editIndex);

    // Required check
    if (rule.required && !v) return `${rule.label} is required.`;

    // Min length
    if (rule.minLen && v.length < rule.minLen)
      return `${rule.label} must be at least ${rule.minLen} characters.`;

    // Pattern
    if (rule.pattern && v && !rule.pattern.test(v))
      return rule.patternMsg || `${rule.label} format is invalid.`;

    return null;
  },

  /**
   * Validate all form fields.
   * @param {Object} data      - { field: value, ... }
   * @param {number} editIndex - index being edited
   * @returns {{ valid: boolean, errors: Object }}
   */
  validateAll(data, editIndex = -1) {
    const errors = {};
    let valid = true;

    for (const field of Object.keys(this.rules)) {
      const err = this.validateField(field, data[field] ?? '', editIndex);
      if (err) {
        errors[field] = err;
        valid = false;
      }
    }

    return { valid, errors };
  }
};
