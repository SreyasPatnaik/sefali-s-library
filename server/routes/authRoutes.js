const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register-admin
// @desc    Register a new admin account (requires invite code)
const ADMIN_INVITE_CODE = process.env.ADMIN_INVITE_CODE || 'sefali-admin-2026';

router.post('/register-admin', async (req, res) => {
  try {
    const { name, email, password, inviteCode } = req.body;

    if (!name || !email || !password || !inviteCode) {
      return res.status(400).json({ message: 'All fields including the admin invite code are required.' });
    }

    if (inviteCode !== ADMIN_INVITE_CODE) {
      return res.status(403).json({ message: 'Invalid admin invite code. Contact your system administrator.' });
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
