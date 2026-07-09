import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';

dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/url-shortener';

const seed = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('Database Connected successfully.');

    const email = 'admin@short.ly';
    let user = await User.findOne({ email });

    if (user) {
      console.log('Admin user already exists in database. Resetting password/role...');
      user.password = 'admin'; // Pre-save hook hashes this
      user.role = 'admin';
      user.isActive = true;
      await user.save();
      console.log('Admin user updated successfully.');
    } else {
      console.log('Admin user does not exist in database. Registering new admin account...');
      user = new User({
        username: 'admin',
        email,
        password: 'admin',
        role: 'admin',
        isActive: true
      });
      await user.save();
      console.log('Admin user registered successfully.');
    }
  } catch (error) {
    console.error('Failed to seed admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

seed();
