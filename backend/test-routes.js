const express = require('express');
const app = express();

// Test middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Test route to see what's happening
app.get('/test', (req, res) => {
  res.json({
    message: 'Test route working',
    url: req.originalUrl,
    method: req.method,
    headers: req.headers
  });
});

// Mount auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 - ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: ['/test', '/api/auth/login', '/api/auth/register']
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- GET /test');
  console.log('- POST /api/auth/login');
  console.log('- POST /api/auth/register');
});

module.exports = app; 