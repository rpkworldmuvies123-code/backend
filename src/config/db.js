import mongoose from 'mongoose';

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI is not set. Database-dependent routes will return a service-unavailable response.');
    return false;
  }
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  console.log('MongoDB connected');
  return true;
}
export const isDatabaseReady = () => mongoose.connection.readyState === 1;
