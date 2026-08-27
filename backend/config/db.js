import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let isConnectedToMongo = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduguide_ai';

  try {
    // Attempt connection with short timeout so startup is instant if offline
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnectedToMongo = true;
    console.log(`[MongoDB] Connected successfully to database: ${mongoose.connection.name}`);
  } catch (error) {
    isConnectedToMongo = false;
    console.log(`[MongoDB] Running in dual-mode (Local JSON/In-Memory active). MongoDB status: ${error.message}`);
  }
}

export function isMongoActive() {
  return isConnectedToMongo && mongoose.connection.readyState === 1;
}
