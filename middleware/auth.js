/*
 * auth.js - Authentication Middleware
 * This middleware verifies JWT tokens to protect private routes
 */

const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to request
    next(); // Continue to the next middleware/route
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token. Please sign in again.'
    });
  }
};

module.exports = { verifyToken };
