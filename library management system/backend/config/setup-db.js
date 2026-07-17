/**
 * Database Setup Script
 * Run: node config/setup-db.js
 * 
 * This script creates the database and runs the schema
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function setupDatabase() {
  console.log('\n🚀 Library Management System - Database Setup\n');

  // Connect without specifying a database first
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    const dbName = process.env.DB_NAME || 'library_management';
    
    console.log(`📦 Creating database: ${dbName}`);
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE \`${dbName}\``);
    console.log('✅ Database created/selected\n');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let success = 0, skipped = 0;
    for (const stmt of statements) {
      try {
        await conn.query(stmt);
        success++;
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.code === 'ER_DUP_ENTRY') {
          skipped++;
        } else if (!err.message.includes('already exists')) {
          console.warn(`  ⚠️  ${err.message.slice(0, 80)}`);
        }
      }
    }

    console.log(`✅ Schema executed: ${success} statements, ${skipped} skipped\n`);

    // Verify tables
    const [tables] = await conn.query('SHOW TABLES');
    console.log(`📋 Tables created (${tables.length}):`);
    tables.forEach(t => console.log(`   - ${Object.values(t)[0]}`));

    // Check admin user
    const [users] = await conn.query('SELECT COUNT(*) as count FROM users');
    console.log(`\n👤 Users: ${users[0].count}`);

    console.log('\n🎉 Database setup complete!\n');
    console.log('━'.repeat(50));

    // Always reset admin password correctly (bcrypt hash can't go through SQL safely)
    const bcrypt = require('bcryptjs');
    const adminHash = await bcrypt.hash('Admin@123', 10);
    await conn.query(
      "INSERT INTO users (role_id, name, email, password, status) VALUES (1,'System Admin','admin@library.com',?,?) ON DUPLICATE KEY UPDATE password=?, status='active'",
      [adminHash, 'active', adminHash]
    );
    console.log('👤 Admin user created/updated');

    console.log('\nDefault Admin Credentials:');
    console.log('  Email:    admin@library.com');
    console.log('  Password: Admin@123');
    console.log('━'.repeat(50));
    console.log('\nStart the server with: npm run dev\n');

  } catch (err) {
    console.error('❌ Setup failed:', err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

setupDatabase();
