const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shalamar_hospital',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅  MySQL Database connected');
    connection.release();
  } catch (error) {
    console.error('❌  Database connection failed:', error.message);
    console.log('\n⚠️   Check your DB credentials in .env and make sure MySQL is running\n');
    process.exit(1);
  }
};

module.exports = { pool, testConnection };
