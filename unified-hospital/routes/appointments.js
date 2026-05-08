const express = require('express');
const { pool } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/appointments/doctors/:dept  — list doctors by department
router.get('/doctors/:dept', async (req, res) => {
  try {
    const dept = req.params.dept;
    const [doctors] = await pool.query(
      'SELECT id, full_name AS name, fee FROM doctors WHERE department = ? AND is_active = 1',
      [dept]
    );
    res.json(doctors);
  } catch (error) {
    console.error('Doctors fetch error:', error);
    res.status(500).json({ success: false, message: 'Error fetching doctors' });
  }
});

// POST /api/appointments  — book an appointment (works for both authenticated and guest users)
router.post('/', async (req, res) => {
  try {
    const {
      firstName, first_name,
      lastName, last_name,
      email,
      phone,
      department,
      doctorId, doctor_id,
      appointmentDate, preferred_date,
      appointmentTime, preferred_time,
      description,
      consultationFee, fee,
      tax,
      grandTotal, grand_total
    } = req.body;

    // Support both camelCase (from appointment page) and snake_case (from landing page)
    const fName = firstName || first_name || '';
    const lName = lastName || last_name || '';
    const dId = doctorId || doctor_id || null;
    const date = appointmentDate || preferred_date;
    const time = appointmentTime || preferred_time || null;
    const consultFee = consultationFee || fee || null;
    const totalTax = tax || null;
    const total = grandTotal || grand_total || null;

    // Try to get doctor name from DB
    let doctorName = null;
    if (dId) {
      const [docs] = await pool.query('SELECT full_name FROM doctors WHERE id = ?', [dId]);
      if (docs.length > 0) doctorName = docs[0].full_name;
    }

    // Get patient_id from JWT if present
    let patientId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        patientId = decoded.userId;
      } catch (e) { /* no valid token — that's fine */ }
    }

    const [result] = await pool.query(
      `INSERT INTO appointments 
        (patient_id, first_name, last_name, email, phone, department, doctor_id, doctor_name,
         preferred_date, preferred_time, consultation_fee, tax, grand_total, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [patientId, fName, lName, email || null, phone, department, dId, doctorName,
       date, time, consultFee, totalTax, total, description || null]
    );

    const appointmentId = 'APT-' + String(result.insertId).padStart(6, '0');

    res.status(201).json({
      success: true,
      message: `Appointment booked! We'll call ${fName} shortly to confirm.`,
      appointment: {
        appointmentId,
        id: result.insertId,
        patient: { firstName: fName, lastName: lName, email, phone },
        department,
        doctor: { id: dId, name: doctorName },
        appointmentDate: date,
        appointmentTime: time,
        consultationFee: consultFee,
        tax: totalTax,
        grandTotal: total,
        status: 'pending',
        bookedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Appointment error:', error);
    res.status(500).json({ success: false, message: 'Server error booking appointment. Please try again.' });
  }
});

// GET /api/appointments/my  — get user's appointments (protected)
router.get('/my', verifyToken, async (req, res) => {
  try {
    const [appointments] = await pool.query(
      'SELECT * FROM appointments WHERE patient_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json({ success: true, appointments });
  } catch (error) {
    console.error('My appointments error:', error);
    res.status(500).json({ success: false, message: 'Error fetching appointments' });
  }
});

module.exports = router;
