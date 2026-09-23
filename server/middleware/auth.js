const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'sefali_library_secret_key_2026';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      // Fallback for demo guest/admin headers if passed
      const demoEmail = req.header('X-Demo-Email');
      if (demoEmail) {
        const user = await User.findOne({ email: demoEmail });
        if (user) {
          req.user = user;
          return next();
        }
      }
      return res.status(401).json({ message: 'No authentication token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid authentication token.' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Authentication error', error: err.message });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin privileges required.' });
  }
};

module.exports = { auth, adminOnly, JWT_SECRET };
