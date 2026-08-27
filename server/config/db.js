import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log('ℹ️  No MONGODB_URI provided in environment. Using resilient local persistent storage engine.');
    return { isConnected: false, mode: 'local' };
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return { isConnected: true, mode: 'mongodb' };
  } catch (error) {
    console.warn(`⚠️  MongoDB connection failed (${error.message}). Falling back to resilient local storage.`);
    return { isConnected: false, mode: 'local' };
  }
};
