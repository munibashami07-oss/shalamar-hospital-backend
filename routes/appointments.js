/*
 * appointments.js - Appointment Routes
 * Handles: booking appointments, viewing appointments
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// ═══════════════════════════════════════
// POST /api/appointments - Book a new appointment
// ═══════════════════════════════════════
router.post(
  '/',
  [
    body('first_name').trim().isLength({ min: 1 }).withMessage('First name is required'),
    body('last_name').trim().isLength({ min: 1 }).withMessage('Last name is required'),
    body('phone').trim().isLength({ min: 10 }).withMessage('Valid phone number is required'),
    body('department').notEmpty().withMessage('Please select a department'),
    body('preferred_date').isDate().withMessage('Please select a valid date')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Please fill in all required fields',
          errors: errors.array()
        });
      }

      const { first_name, last_name, phone, department, preferred_date, description, patient_id } = req.body;

      // Insert appointment
      const [result] = await pool.query(
        'INSERT INTO appointments (patient_id, first_name, last_name, phone, department, preferred_date, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [patient_id || null, first_name, last_name, phone, department, preferred_date, description || null]
      );

      res.status(201).json({
        success: true,
        message: 'Appointment request submitted successfully! We will contact you shortly to confirm.',
        appointment: {
          id: result.insertId,
          first_name,
          last_name,
          department,
          preferred_date,
          status: 'pending'
        }
      });

    } catch (error) {
      console.error('Appointment booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while booking appointment. Please try again.'
      });
    }
  }
);

// ═══════════════════════════════════════
// GET /api/appointments - Get user's appointments (protected)
// ═══════════════════════════════════════
router.get('/', verifyToken, async (req, res) => {
  try {
    const [appointments] = await pool.query(
      'SELECT * FROM appointments WHERE patient_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );

    res.json({
      success: true,
      appointments
    });

  } catch (error) {
    console.error('Fetch appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching appointments'
    });
  }
});

// ═══════════════════════════════════════
// GET /api/appointments/all - Get all appointments (admin only - for demo)
// ═══════════════════════════════════════
router.get('/all', async (req, res) => {
  try {
    const [appointments] = await pool.query(
      'SELECT a.*, p.full_name as patient_name, p.email as patient_email FROM appointments a LEFT JOIN patients p ON a.patient_id = p.id ORDER BY a.created_at DESC'
    );

    res.json({
      success: true,
      appointments
    });

  } catch (error) {
    console.error('Fetch all appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching appointments'
    });
  }
});

module.exports = router;
