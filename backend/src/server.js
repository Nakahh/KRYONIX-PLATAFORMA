const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://kryonix-plataforma.vercel.app', 'https://www.kryonix.com.br']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

app.use(morgan('combined'));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'KRYONIX Backend API',
    version: '1.0.0',
    status: 'Running',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      waitlist: '/api/waitlist',
      contact: '/api/contact',
      partnerships: '/api/partnerships'
    }
  });
});

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, company } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcryptjs.hash(password, saltRounds);

    // Create user
    const newUser = await pool.query(
      'INSERT INTO users (email, password, name, company, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, name, company, created_at',
      [email, hashedPassword, name, company]
    );

    // Generate token
    const token = jwt.sign(
      { userId: newUser.rows[0].id, email: newUser.rows[0].email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: newUser.rows[0]
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcryptjs.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.rows[0].id, email: user.rows[0].email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.rows[0].id]
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email,
        name: user.rows[0].name,
        company: user.rows[0].company
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Waitlist Routes
app.post('/api/waitlist', async (req, res) => {
  try {
    const { email, name, company, phone, interest_type, message } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    // Check if already in waitlist
    const existing = await pool.query(
      'SELECT * FROM waitlist WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(200).json({ 
        message: 'Already in waitlist',
        position: existing.rows[0].id 
      });
    }

    // Add to waitlist
    const result = await pool.query(
      'INSERT INTO waitlist (email, name, company, phone, interest_type, message, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [email, name, company, phone, interest_type, message]
    );

    // Get position in waitlist
    const position = await pool.query(
      'SELECT COUNT(*) as position FROM waitlist WHERE id <= $1',
      [result.rows[0].id]
    );

    res.status(201).json({
      message: 'Successfully added to waitlist',
      position: parseInt(position.rows[0].position),
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Waitlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/waitlist/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as today,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as week,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as month
      FROM waitlist
    `);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Waitlist stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Contact Routes
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, company, subject, message, type } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const result = await pool.query(
      'INSERT INTO contacts (name, email, phone, company, subject, message, type, created_at, status) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8) RETURNING *',
      [name, email, phone, company, subject, message, type || 'general', 'new']
    );

    res.status(201).json({
      message: 'Contact form submitted successfully',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Partnership Routes
app.post('/api/partnerships', async (req, res) => {
  try {
    const { name, email, phone, company, partnership_type, investment_range, message, revenue, employees } = req.body;

    if (!name || !email || !partnership_type) {
      return res.status(400).json({ error: 'Name, email, and partnership type are required' });
    }

    const result = await pool.query(
      'INSERT INTO partnerships (name, email, phone, company, partnership_type, investment_range, message, revenue, employees, created_at, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10) RETURNING *',
      [name, email, phone, company, partnership_type, investment_range, message, revenue, employees, 'new']
    );

    res.status(201).json({
      message: 'Partnership inquiry submitted successfully',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Partnership error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics Routes
app.get('/api/analytics/overview', authenticateToken, async (req, res) => {
  try {
    const overview = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM waitlist) as waitlist_count,
        (SELECT COUNT(*) FROM contacts WHERE created_at >= NOW() - INTERVAL '7 days') as recent_contacts,
        (SELECT COUNT(*) FROM partnerships WHERE created_at >= NOW() - INTERVAL '30 days') as recent_partnerships
    `);

    res.json(overview.rows[0]);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// System Routes
app.get('/api/system/status', (req, res) => {
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    services: {
      database: 'operational',
      authentication: 'operational',
      api: 'operational'
    },
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database initialization
async function initializeDatabase() {
  try {
    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        phone VARCHAR(50),
        interest_type VARCHAR(100),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notified BOOLEAN DEFAULT FALSE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        company VARCHAR(255),
        subject VARCHAR(255),
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'general',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'new'
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS partnerships (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        company VARCHAR(255),
        partnership_type VARCHAR(100) NOT NULL,
        investment_range VARCHAR(100),
        message TEXT,
        revenue VARCHAR(100),
        employees VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'new'
      )
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 KRYONIX Backend Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  
  // Initialize database
  await initializeDatabase();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  pool.end();
  process.exit(0);
});

module.exports = app;
