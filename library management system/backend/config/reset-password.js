const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetPassword() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'library_management',
  });

  try {
    // Hash Admin@123
    const hash = await bcrypt.hash('Admin@123', 10);
    console.log('New hash:', hash);

    // Verify it works
    const ok = await bcrypt.compare('Admin@123', hash);
    console.log('Verify Admin@123:', ok);

    // Update in DB
    await conn.query(
      "UPDATE users SET password = ? WHERE email = 'admin@library.com'",
      [hash]
    );

    const [rows] = await conn.query(
      "SELECT email, status FROM users WHERE email = 'admin@library.com'"
    );
    console.log('User updated:', rows[0]);
    console.log('\n✅ Password reset to: Admin@123');
    console.log('Email: admin@library.com');
  } finally {
    await conn.end();
  }
}

resetPassword().catch(console.error);
