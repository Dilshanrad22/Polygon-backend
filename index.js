const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'farminvestlite',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Connected to MySQL database');
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection error:', err);
  });

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'farminvest_secret_key';

/**
 * Authentication Middleware
 */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Validates investment input data
 */
const validateInvestment = (body) => {
  const errors = [];
  
  if (!body.farmer_name || typeof body.farmer_name !== 'string' || body.farmer_name.trim() === '') {
    errors.push('farmer_name is required and must be a non-empty string');
  }
  
  if (body.amount === undefined || body.amount === null || isNaN(Number(body.amount)) || Number(body.amount) <= 0) {
    errors.push('amount is required and must be a positive number');
  }
  
  if (!body.crop || typeof body.crop !== 'string' || body.crop.trim() === '') {
    errors.push('crop is required and must be a non-empty string');
  }
  
  return errors;
};

/**
 * Validates user registration input
 */
const validateRegistration = (body) => {
  const errors = [];
  
  if (!body.name || body.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push('Valid email is required');
  }
  
  if (!body.password || body.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  return errors;
};

// ==================== AUTH ROUTES ====================

/**
 * POST /api/auth/register
 * Register a new user
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    const errors = validateRegistration(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name.trim(), email.toLowerCase(), hashedPassword]
    );
    
    // Generate token
    const token = jwt.sign(
      { id: result.insertId, email: email.toLowerCase(), name: name.trim() },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: result.insertId,
        name: name.trim(),
        email: email.toLowerCase()
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user
    const [users] = await pool.execute(
      'SELECT id, name, email, password FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = users[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== INVESTMENT ROUTES ====================

/**
 * GET /api/investments
 * Returns list of all investments ordered by created_at descending
 */
app.get('/api/investments', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, farmer_name, amount, crop, created_at FROM investments ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/investments
 * Creates a new investment record
 */
app.post('/api/investments', async (req, res) => {
  try {
    const { farmer_name, amount, crop } = req.body;
    
    // Validate input
    const errors = validateInvestment(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    // Insert into database using parameterized query
    const [result] = await pool.execute(
      'INSERT INTO investments (farmer_name, amount, crop) VALUES (?, ?, ?)',
      [farmer_name.trim(), Number(amount), crop.trim()]
    );
    
    // Fetch and return the created row
    const [rows] = await pool.execute(
      'SELECT id, farmer_name, amount, crop, created_at FROM investments WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating investment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', async (req, res) => {
  try {
    await pool.execute('SELECT 1');
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FarmInvest API running on http://localhost:${PORT}`);
});

module.exports = app;
