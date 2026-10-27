import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 4000, // Timeout after 4 seconds instead of 30s
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Warning] Could not connect to MongoDB (${error.message}). Please verify MONGODB_URI in server/.env.`);
  }
};
