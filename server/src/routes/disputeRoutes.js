import express from 'express';
import {
  createDispute,
  getMyDisputes,
  getAdminDisputes,
  resolveDispute,
  getDisputeDocument,
} from '../controllers/disputeController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { uploadDisputeDocument } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

// Resident routes
router.post('/', uploadDisputeDocument.single('evidence'), createDispute);
router.get('/my-disputes', getMyDisputes);

// Admin routes
router.get('/admin/all', adminOnly, getAdminDisputes);
router.patch('/admin/:id', adminOnly, resolveDispute);

// Private document streaming
router.get('/document/:id', getDisputeDocument);

export default router;
