/*
 * auth.js - Authentication Routes
 * Handles: POST /api/auth/register, POST /api/auth/login, GET /api/auth/profile
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// ═══════════════════════════════════════
// POST /api/auth/register - Create new account
// ═══════════════════════════════════════
router.post(
  '/register',
  [
    // Validation rules
    body('full_name').trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('cnic').trim().isLength({ min: 13 }).withMessage('CNIC must be at least 13 characters'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { full_name, email, cnic, password } = req.body;

      // Check if email already exists
      const [existingEmail] = await pool.query(
        'SELECT * FROM patients WHERE email = ?',
        [email]
      );
      if (existingEmail.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists. Please sign in instead.'
        });
      }

      // Check if CNIC already exists
      const [existingCnic] = await pool.query(
        'SELECT * FROM patients WHERE cnic = ?',
        [cnic]
      );
      if (existingCnic.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'An account with this CNIC already exists.'
        });
      }

      // Hash the password (secure one-way encryption)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new patient into database
      const [result] = await pool.query(
        'INSERT INTO patients (full_name, email, cnic, password) VALUES (?, ?, ?, ?)',
        [full_name, email, cnic, hashedPassword]
      );

      // Generate JWT token for immediate login
      const token = jwt.sign(
        { userId: result.insertId, email, full_name },
        process.env.JWT_SECRET,
        { expiresIn: '24h' } // Token valid for 24 hours
      );

      res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to Shalamar Hospital.',
        token,
        user: {
          id: result.insertId,
          full_name,
          email,
          cnic
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during registration. Please try again.'
      });
    }
  }
);

// ═══════════════════════════════════════
// POST /api/auth/login - Sign in to account
// ═══════════════════════════════════════
router.post(
  '/login',
  [
    body('email').trim().isLength({ min: 3 }).withMessage('Please enter your email or CNIC'),
    body('password').exists().withMessage('Please enter your password')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user by email OR CNIC
      const [users] = await pool.query(
        'SELECT * FROM patients WHERE email = ? OR cnic = ?',
        [email, email]
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email/CNIC or password. Please try again.'
        });
      }

      const user = users[0];

      // Compare password with stored hash
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email/CNIC or password. Please try again.'
        });
      }

      // Update last login time
      await pool.query(
        'UPDATE patients SET last_login = NOW() WHERE id = ?',
        [user.id]
      );

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, full_name: user.full_name },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: `Welcome back, ${user.full_name}!`,
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          cnic: user.cnic,
          last_login: user.last_login
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login. Please try again.'
      });
    }
  }
);

// ═══════════════════════════════════════
// GET /api/auth/profile - Get user profile (protected)
// ═══════════════════════════════════════
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, full_name, email, cnic, phone, date_of_birth, address, blood_group, created_at, last_login FROM patients WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: users[0]
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
});

// ═══════════════════════════════════════
// PUT /api/auth/profile - Update profile (protected)
// ═══════════════════════════════════════
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { phone, date_of_birth, address, blood_group } = req.body;

    await pool.query(
      'UPDATE patients SET phone = ?, date_of_birth = ?, address = ?, blood_group = ? WHERE id = ?',
      [phone, date_of_birth, address, blood_group, req.user.userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

module.exports = router;
