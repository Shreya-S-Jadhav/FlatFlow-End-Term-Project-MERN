import dotenv from 'dotenv';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { runDailyDueDateReminderJob } from './src/controllers/billController.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to Database and start listening
const startServer = async () => {
  await connectDB();

  // Run automated due date reminder check on startup and schedule periodic check
  runDailyDueDateReminderJob().catch((err) => console.error('[Reminder Job Error]', err));
  // Check every 6 hours
  setInterval(runDailyDueDateReminderJob, 1000 * 60 * 60 * 6);

  app.listen(PORT, () => {
    console.log(`[Server] FlatFlow backend running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
    console.log(`[Server] Health check endpoint: http://localhost:${PORT}/api/health`);
  });
};

startServer();

