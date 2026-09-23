const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sefalis_library';
  
  try {
    // Attempt standard MongoDB connection with 2 second timeout
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[MongoDB] Connected to database at ${mongoUri}`);
    return true;
  } catch (err) {
    console.log('[MongoDB] Local MongoDB connection failed. Initializing MongoMemoryServer fallback...');
    try {
      mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[MongoDB] Connected to MongoMemoryServer at ${inMemoryUri}`);
      return false; // Indicates memory server was started, trigger seeding
    } catch (memErr) {
      console.error('[MongoDB] Memory Server initialization failed:', memErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
