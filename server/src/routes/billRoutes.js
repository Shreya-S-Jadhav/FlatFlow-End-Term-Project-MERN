import express from 'express';
import {
  generateSingleBill,
  generateBatchBills,
  getAdminBills,
  getMyBills,
  getBillById,
  sendDueDateReminders,
} from '../controllers/billController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All bill routes require authentication
router.use(protect);

// Resident routes
router.get('/my-bills', getMyBills);

// Admin billing routes
router.get('/admin/all', adminOnly, getAdminBills);
router.post('/admin/generate-single', adminOnly, generateSingleBill);
router.post('/admin/generate-batch', adminOnly, generateBatchBills);
router.post('/admin/send-due-reminders', adminOnly, sendDueDateReminders);

// Single bill view (enforces ownership guard in controller)
router.get('/:id', getBillById);

export default router;

