import express from 'express';
import { login, logout, getMe, bootstrapAdmin, register, getPublicFlats } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/flats', getPublicFlats);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/bootstrap-admin', bootstrapAdmin);

export default router;
