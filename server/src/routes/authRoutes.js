import express from 'express';
import { login, logout, getMe, bootstrapAdmin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/bootstrap-admin', bootstrapAdmin);

export default router;
