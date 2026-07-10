/**
 * storage.js
 * Handles all Local Storage operations for the Student Management System.
 */

const STORAGE_KEY = 'sms_students';

const Storage = {

  /** Get all students from Local Storage */
  getAll() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  /** Save entire students array to Local Storage */
  saveAll(students) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  },

  /** Add a new student */
  add(student) {
    const students = this.getAll();
    students.push(student);
    this.saveAll(students);
  },

  /** Update a student by index */
  update(index, updatedStudent) {
    const students = this.getAll();
    if (index >= 0 && index < students.length) {
      students[index] = updatedStudent;
      this.saveAll(students);
    }
  },

  /** Delete a student by index */
  delete(index) {
    const students = this.getAll();
    if (index >= 0 && index < students.length) {
      students.splice(index, 1);
      this.saveAll(students);
    }
  },

  /** Find a student by field value */
  findBy(field, value) {
    return this.getAll().find(s => s[field] === value);
  },

  /** Check if a field value already exists (optionally excluding an index) */
  isDuplicate(field, value, excludeIndex = -1) {
    const students = this.getAll();
    return students.some((s, i) => i !== excludeIndex && s[field] === value);
  },

  /** Get unique cities from all students */
  getUniqueCities() {
    const students = this.getAll();
    const cities = students.map(s => s.city).filter(Boolean);
    return [...new Set(cities)].sort();
  },

  /** Get unique courses from all students */
  getUniqueCourses() {
    const students = this.getAll();
    const courses = students.map(s => s.course).filter(Boolean);
    return [...new Set(courses)];
  },

  /** Clear all student data */
  clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
};
