const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Health check for auth module
router.get('/health', (req, res) => {
  res.json({
    module: 'auth',
    status: 'operational',
    endpoints: ['/login', '/register', '/verify'],
    timestamp: new Date().toISOString()
  });
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Simulated authentication
    if (email && password) {
      const token = jwt.sign(
        { userId: 'test-user', email },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '24h' }
      );
      
      res.json({
        success: true,
        token,
        user: { id: 'test-user', email }
      });
    } else {
      res.status(400).json({ error: 'Email and password required' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Simulated registration
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign(
      { userId: 'new-user', email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: { id: 'new-user', email, name }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Verify token endpoint
router.post('/verify', (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

module.exports = router;
