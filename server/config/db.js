const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  // If a MongoDB URI is provided (Atlas or production)
  if (mongoUri) {
    try {
      console.log(`[MongoDB] Connecting to cloud/custom database...`);
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`[MongoDB] Successfully connected to MongoDB!`);
      return true;
    } catch (err) {
      console.error(`[MongoDB] Connection error to ${mongoUri.replace(/:([^@]+)@/, ':****@')}:`, err.message);
      console.error(`[MongoDB] Check if:
 1. 0.0.0.0/0 is allowed in Atlas Network Access
 2. Your database username and password in MONGO_URI are correct
 3. Your IP whitelist entry has been deployed in Atlas (takes ~1 min)`);
      process.exit(1);
    }
  }

  // Local fallback: try local MongoDB first, then MongoMemoryServer
  const localUri = 'mongodb://127.0.0.1:27017/sefalis_library';
  try {
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 });
    console.log(`[MongoDB] Connected to local MongoDB at ${localUri}`);
    return true;
  } catch (err) {
    console.log('[MongoDB] Local MongoDB not running. Initializing in-memory fallback for local dev...');
    try {
      mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[MongoDB] Connected to MongoMemoryServer at ${inMemoryUri}`);
      return false;
    } catch (memErr) {
      console.error('[MongoDB] Memory Server initialization failed:', memErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
