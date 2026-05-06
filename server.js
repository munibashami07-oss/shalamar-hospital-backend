const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

// Health check (no database now)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running WITHOUT database',
    timestamp: new Date().toISOString()
  });
});

// Static frontend
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server (NO DB)
app.listen(PORT, () => {
  console.log('\n🏥 Server running WITHOUT database');
  console.log(`🌐 http://localhost:${PORT}`);
});