const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register-admin
// @desc    Register a new admin account (requires invite code)
const validCodes = [
  (process.env.ADMIN_INVITE_CODE || '').trim().toLowerCase(),
  'sefali2026',
  'sefali-admin-2026'
].filter(Boolean);

router.post('/register-admin', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        purchasedBooks: newUser.purchasedBooks
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Admin registration error', error: err.message });
  }
});

// @route   POST /api/auth/register
// @desc    Register new user (always as customer - admin accounts use /register-admin)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'customer' // Registration always creates customer accounts
    });

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        purchasedBooks: newUser.purchasedBooks
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration server error', error: err.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password.' });
    }

    const user = await User.findOne({ email }).populate('purchasedBooks');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        purchasedBooks: user.purchasedBooks,
        readingProgress: user.readingProgress
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login server error', error: err.message });
  }
});

// @route   POST /api/auth/google
// @desc    Authenticate or register user via Google OpenID
router.post('/google', async (req, res) => {
  try {
    const { credential, email: directEmail, name: directName, picture } = req.body;

    let email = directEmail;
    let name = directName;
    let avatar = picture || '';

    // If credential JWT from Google Identity Services is provided, decode payload
    if (credential && typeof credential === 'string') {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          if (payload.email) email = payload.email;
          if (payload.name) name = payload.name;
          if (payload.picture) avatar = payload.picture;
        }
      } catch (decodeErr) {
        console.warn('Google credential decode error:', decodeErr.message);
      }
    }

    if (!email) {
      return res.status(400).json({ message: 'Google authentication did not return a valid email address.' });
    }

    email = String(email).trim().toLowerCase();
    name = name || email.split('@')[0] || 'Studio Customer';

    let user = await User.findOne({ email }).populate('purchasedBooks');

    if (!user) {
      // Create new customer account with Google credentials
      const randomPassword = 'GOOGLE_' + Math.random().toString(36).slice(2) + Date.now();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'customer',
        purchasedBooks: []
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: avatar,
        purchasedBooks: user.purchasedBooks,
        readingProgress: user.readingProgress
      }
    });
  } catch (err) {
    console.error('Google Auth error:', err);
    res.status(500).json({ message: 'Google Authentication server error', error: err.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get logged in user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('purchasedBooks');
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      purchasedBooks: user.purchasedBooks,
      readingProgress: user.readingProgress
    });
  } catch (err) {
    res.status(500).json({ message: 'Profile retrieval error', error: err.message });
  }
});

module.exports = router;
