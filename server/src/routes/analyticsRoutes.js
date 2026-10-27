import express from 'express';
import {
  getDashboardAnalytics,
  getResidentSummary,
} from '../controllers/analyticsController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin-only society-wide analytics
router.get('/dashboard', protect, adminOnly, getDashboardAnalytics);

// Resident's own summary
router.get('/my-summary', protect, getResidentSummary);

export default router;
