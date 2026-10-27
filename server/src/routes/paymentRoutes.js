import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getMyPayments,
  getAdminPayments,
  getReceipt,
} from '../controllers/paymentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.get('/my-payments', getMyPayments);
router.get('/receipt/:id', getReceipt);
router.get('/admin/all', adminOnly, getAdminPayments);

export default router;
