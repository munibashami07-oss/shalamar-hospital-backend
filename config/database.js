/*
 * database.js - MySQL Database Connection
 * This file creates and exports the database connection pool.
 * A pool maintains multiple connections for better performance.
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool (efficient for multiple requests)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shalamar_hospital',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,     // Maximum 10 simultaneous connections
  queueLimit: 0            // Unlimited queue
});

// Test the database connection on startup
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully!');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n⚠️  Please make sure:');
    console.log('   1. MySQL is running (XAMPP/WAMP/MAMP is started)');
    console.log('   2. Database credentials in .env are correct');
    console.log('   3. Run "npm run init-db" to create the database\n');
    process.exit(1);
  }
};

module.exports = { pool, testConnection };
