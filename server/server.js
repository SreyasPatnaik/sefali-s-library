const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedData = require('./seed/seedData');

const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// Ensure upload directory exists
const uploadsDir = path.join(__dirname, 'uploads', 'ebooks');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (PDFs, EPUBs, documents)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: "Sefali's Library MERN API", timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const isLocalMongo = await connectDB();
    
    // Automatically seed data if using in-memory fallback or fresh database
    await seedData();

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` Sefali's Library Backend API Server Running `);
      console.log(` Port: http://localhost:${PORT}`);
      console.log(` Health: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Server failed to start:', err.message);
  }
};

startServer();
