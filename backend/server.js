import dotenv from 'dotenv';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { connectRedis } from './src/config/redis.js';

// Trigger nodemon restart to load JWT_SECRET env change
// Load environment variables at the very beginning
dotenv.config();

const PORT = process.env.PORT || 5000;

// Execute the startup sequence: Connect DB first, then start listening
try {
  // Await successful database connection
  await connectDB();

  // Await Redis connection
  await connectRedis();

  // Start listening on port only if database connected successfully
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (error) {
  console.error(`Server startup failed: ${error.message}`);
  process.exit(1);
}
