const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306
};

const DB_NAME = process.env.DB_NAME || 'shalamar_hospital';

// Run directly via: node database/init-db.js
// Or imported by server.js on startup
async function initializeDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('🔗  Connected to MySQL server');

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    console.log(`✅  Database "${DB_NAME}" ready`);

    await connection.query(`USE \`${DB_NAME}\``);

    // Patients table
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
    console.log('✅  patients table ready');

    // Appointments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20) NOT NULL,
        department VARCHAR(100) NOT NULL,
        doctor_id VARCHAR(20),
        doctor_name VARCHAR(255),
        preferred_date DATE NOT NULL,
        preferred_time VARCHAR(20),
        consultation_fee DECIMAL(10,2),
        tax DECIMAL(10,2),
        grand_total DECIMAL(10,2),
        description TEXT,
        status ENUM('pending','confirmed','completed','cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
      )
    `);
    console.log('✅  appointments table ready');

    // Doctors table
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
        fee DECIMAL(10,2) DEFAULT 2000,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅  doctors table ready');

    const [existingDoctors] = await connection.query('SELECT COUNT(*) as count FROM doctors');
    if (existingDoctors[0].count === 0) {
      await connection.query(`
        INSERT INTO doctors (full_name, specialty, qualification, experience_years, department, fee) VALUES
        ('Prof. Dr. Azhar Hussain', 'Cardiology', 'MBBS, FRCP (London)', 28, 'cardiologist', 3000),
        ('Dr. Ali Raza', 'Cardiology', 'MBBS, FCPS', 15, 'cardiologist', 3500),
        ('Dr. Sana Malik', 'Dermatology', 'MBBS, FCPS', 12, 'dermatologist', 2500),
        ('Dr. Ayesha Noor', 'Obstetrics & Gynaecology', 'MBBS, FCPS, MRCOG', 18, 'gynecologist', 2800),
        ('Dr. Bilal Ahmed', 'General Medicine', 'MBBS, MRCP', 10, 'general', 2000)
      `);
      console.log('✅  Sample doctors inserted');
    }

    console.log('\n🎉  Database initialized successfully!');
  } catch (error) {
    console.error('❌  Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

module.exports = { initializeDatabase };

if (require.main === module) {
  initializeDatabase();
}
