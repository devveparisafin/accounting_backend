// src/config/db.ts
import mongoose from 'mongoose';
import 'dotenv/config';

// Function to connect to MongoDB
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('FATAL ERROR: MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1); // Exit process if database error occurs
  }
};

export default connectDB;