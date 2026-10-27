import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import billRoutes from './routes/billRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import disputeRoutes from './routes/disputeRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { connectDB } from './config/db.js';

const app = express();

// Allowed origins for development and deployment
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  process.env.CLIENT_URL,
].filter(Boolean);

// Middleware Pipeline
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin, configured allowed origins, localhost, or any vercel.app deployment
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /\.vercel\.app$/.test(origin) ||
        process.env.VERCEL
      ) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true, // Allow cookies to be sent across origins
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Ensure MongoDB is connected for serverless environments
app.use(async (req, res, next) => {
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
    } catch (e) {
      // Caught inside connectDB
    }
  }
  next();
});

// Base Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FlatFlow API server is up and running.',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(1)}s`,
  });
});

// Mount Feature API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve client build in production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.resolve(clientDistPath, 'index.html'));
  });
}

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
