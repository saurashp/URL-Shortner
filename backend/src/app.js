import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import urlRoutes from './routes/url.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { bodyJsonParser } from './middleware/bodyJsonParser.js';

// Load environment variables
dotenv.config();

const app = express();

// Standard middleware
app.use(cors());
app.use(bodyJsonParser);

// Auth and Admin routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Specific routes (defined before wildcard redirects)
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the URL Shortener API!',
    status: 'Live',
    timestamp: new Date()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// Wildcard / model-backed routes
app.use('/', urlRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
