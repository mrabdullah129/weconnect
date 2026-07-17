-- Library Management System - Complete Database Schema
-- Version: 1.0.0

CREATE DATABASE IF NOT EXISTS library_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE library_management;

-- =============================================
-- ROLES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO roles (name, description) VALUES
('admin', 'Full system access'),
('librarian', 'Manage books, members, borrow and return');

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL DEFAULT 2,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar VARCHAR(255),
  status ENUM('active','inactive') DEFAULT 'active',
  reset_token VARCHAR(255),
  reset_token_expire DATETIME,
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- =============================================
-- SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  library_name VARCHAR(200) DEFAULT 'City Public Library',
  logo VARCHAR(255),
  address TEXT,
  email VARCHAR(150),
  phone VARCHAR(30),
  fine_per_day DECIMAL(10,2) DEFAULT 5.00,
  max_borrow_limit INT DEFAULT 5,
  borrow_duration INT DEFAULT 14,
  theme VARCHAR(20) DEFAULT 'light',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO settings (id, library_name, address, email, phone, fine_per_day, max_borrow_limit, borrow_duration)
VALUES (1, 'City Public Library', '123 Library Street, City', 'library@example.com', '+1-234-567-8900', 5.00, 5, 14);

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  status ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- AUTHORS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS authors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  country VARCHAR(100),
  biography TEXT,
  image VARCHAR(255),
  status ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- PUBLISHERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS publishers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  address TEXT,
  phone VARCHAR(30),
  email VARCHAR(150),
  website VARCHAR(255),
  status ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- BOOKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  isbn VARCHAR(50) UNIQUE,
  barcode VARCHAR(100),
  qr_code VARCHAR(255),
  title VARCHAR(300) NOT NULL,
  subtitle VARCHAR(300),
  author_id INT,
  category_id INT,
  publisher_id INT,
  edition VARCHAR(50),
  language VARCHAR(50) DEFAULT 'English',
  shelf_number VARCHAR(50),
  rack_number VARCHAR(50),
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  total_copies INT DEFAULT 1,
  available_copies INT DEFAULT 1,
  description TEXT,
  cover_image VARCHAR(255),
  pdf_file VARCHAR(255),
  status ENUM('available','unavailable','lost') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (publisher_id) REFERENCES publishers(id) ON DELETE SET NULL
);

-- =============================================
-- MEMBERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id VARCHAR(50) NOT NULL UNIQUE,
  photo VARCHAR(255),
  full_name VARCHAR(150) NOT NULL,
  father_name VARCHAR(150),
  cnic VARCHAR(20) UNIQUE,
  email VARCHAR(150) UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  department VARCHAR(100),
  class VARCHAR(50),
  roll_number VARCHAR(50),
  membership_date DATE,
  expiry_date DATE,
  status ENUM('active','inactive','suspended','expired') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- BORROW RECORDS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS borrow_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  borrow_id VARCHAR(50) NOT NULL UNIQUE,
  member_id INT NOT NULL,
  book_id INT NOT NULL,
  borrow_date DATE NOT NULL,
  due_date DATE NOT NULL,
  borrowed_by INT,
  status ENUM('borrowed','returned','overdue','lost') DEFAULT 'borrowed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id),
  FOREIGN KEY (book_id) REFERENCES books(id),
  FOREIGN KEY (borrowed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================
-- RETURN RECORDS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS return_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  return_id VARCHAR(50) NOT NULL UNIQUE,
  borrow_id INT NOT NULL,
  return_date DATE NOT NULL,
  late_days INT DEFAULT 0,
  fine DECIMAL(10,2) DEFAULT 0.00,
  remarks TEXT,
  returned_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (borrow_id) REFERENCES borrow_records(id),
  FOREIGN KEY (returned_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================
-- FINES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS fines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  borrow_id INT NOT NULL,
  member_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0.00,
  status ENUM('pending','paid','waived') DEFAULT 'pending',
  paid_date DATE,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (borrow_id) REFERENCES borrow_records(id),
  FOREIGN KEY (member_id) REFERENCES members(id)
);

-- =============================================
-- ACTIVITY LOGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  description TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Sample Categories
INSERT IGNORE INTO categories (name, description) VALUES
('Fiction', 'Fictional literature and novels'),
('Science', 'Science and technology books'),
('History', 'Historical books and biographies'),
('Mathematics', 'Math textbooks and references'),
('Computer Science', 'Programming and computing'),
('Literature', 'Classic and modern literature'),
('Religion', 'Religious texts and studies'),
('Medical', 'Medical and health sciences');

-- Sample Authors
INSERT IGNORE INTO authors (name, country, biography) VALUES
('George Orwell', 'United Kingdom', 'English novelist and essayist'),
('J.K. Rowling', 'United Kingdom', 'Author of the Harry Potter series'),
('Stephen Hawking', 'United Kingdom', 'Theoretical physicist and cosmologist'),
('Mark Twain', 'United States', 'American writer and humorist'),
('Leo Tolstoy', 'Russia', 'Russian novelist and philosopher');

-- Sample Publishers
INSERT IGNORE INTO publishers (name, address, email, website) VALUES
('Penguin Books', 'London, UK', 'info@penguin.com', 'www.penguin.com'),
('Oxford University Press', 'Oxford, UK', 'info@oup.com', 'www.oup.com'),
('HarperCollins', 'New York, USA', 'info@harpercollins.com', 'www.harpercollins.com');

-- Default Admin User (password: Admin@123)
-- Hash generated fresh via: node -e "require('bcryptjs').hash('Admin@123',10).then(console.log)"
-- Run config/reset-password.js after import to ensure correct hash
INSERT IGNORE INTO users (role_id, name, email, password, status) VALUES
(1, 'System Admin', 'admin@library.com', 'PLACEHOLDER_RUN_reset-password.js', 'active');

-- Sample Books
INSERT IGNORE INTO books (isbn, title, author_id, category_id, publisher_id, language, total_copies, available_copies, status, description) VALUES
('978-0-7432-7357-1', 'Animal Farm', 1, 1, 1, 'English', 5, 5, 'available', 'A satirical allegorical novella by George Orwell'),
('978-0-439-70818-8', 'Harry Potter and the Sorcerer''s Stone', 2, 1, 3, 'English', 8, 8, 'available', 'The first book in the Harry Potter series'),
('978-0-553-38016-3', 'A Brief History of Time', 3, 2, 2, 'English', 4, 4, 'available', 'A landmark volume in science writing'),
('978-0-486-28061-1', 'Adventures of Huckleberry Finn', 4, 6, 1, 'English', 3, 3, 'available', 'A novel by Mark Twain'),
('978-0-14-028329-7', 'War and Peace', 5, 3, 1, 'English', 2, 2, 'available', 'A novel by Leo Tolstoy');
