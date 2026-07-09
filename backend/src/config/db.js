import mongoose from 'mongoose';

/**
 * Connects to MongoDB.
 * Assumes MONGO_URI is set in environmental variables, falling back to localhost.
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/url-shortener';
    const conn = await mongoose.connect(mongoURI);
    console.log(`Database Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
