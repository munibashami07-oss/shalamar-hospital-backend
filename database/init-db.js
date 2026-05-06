/*
 * init-db.js - Database Initialization Script
 * Run this first to create the database and tables
 * Usage: npm run init-db
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuration (without database name first, to create it)
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306
};

const DB_NAME = process.env.DB_NAME || 'shalamar_hospital';

async function initializeDatabase() {
  let connection;

  try {
    // Connect to MySQL (without specifying database)
    connection = await mysql.createConnection(config);
    console.log('🔗 Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
    console.log(`✅ Database "${DB_NAME}" created or already exists`);

    // Use the database
    await connection.query(`USE ${DB_NAME}`);

    // Create patients table (for registered users)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        cnic VARCHAR(15) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        date_of_birth DATE,
        address TEXT,
        blood_group VARCHAR(5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);
    console.log('✅ "patients" table created');

    // Create appointments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        department VARCHAR(100) NOT NULL,
        preferred_date DATE NOT NULL,
        description TEXT,
        status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ "appointments" table created');

    // Create doctors table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        specialty VARCHAR(100) NOT NULL,
        qualification VARCHAR(255),
        experience_years INT,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20),
        department VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ "doctors" table created');

    // Insert sample doctors (only if table is empty)
    const [existingDoctors] = await connection.query('SELECT COUNT(*) as count FROM doctors');
    if (existingDoctors[0].count === 0) {
      await connection.query(`
        INSERT INTO doctors (full_name, specialty, qualification, experience_years, department) VALUES
        ('Prof. Dr. Azhar Hussain', 'Cardiology', 'MBBS, FRCP (London)', 28, 'Cardiology'),
        ('Dr. Sadia Nawaz', 'Obstetrics & Gynaecology', 'MBBS, FCPS, MRCOG', 18, 'Obstetrics & Gynaecology'),
        ('Dr. Usman Tariq', 'Neurosurgery', 'MBBS, FRCS (Edin)', 22, 'Neurology'),
        ('Dr. Nadia Iqbal', 'Paediatrics', 'MBBS, FCPS, DCH', 15, 'Paediatrics')
      `);
      console.log('✅ Sample doctors inserted');
    }

    console.log('\n🎉 Database initialized successfully!');
    console.log(`📊 Database: ${DB_NAME}`);
    console.log('   - patients table (for user accounts)');
    console.log('   - appointments table (for booking requests)');
    console.log('   - doctors table (for doctor listings)\n');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    console.log('\n⚠️  Troubleshooting:');
    console.log('   1. Make sure MySQL is running (start XAMPP/WAMP)');
    console.log('   2. Check your .env file has correct DB_USER and DB_PASSWORD');
    console.log('   3. Try connecting manually: mysql -u root -p\n');
  } finally {
    if (connection) await connection.end();
  }
}

// Run the initialization
initializeDatabase();
