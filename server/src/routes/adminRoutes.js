import express from 'express';
import {
  createFlat,
  getFlats,
  updateFlat,
  createResident,
  getResidents,
  updateResident,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes here require authentication AND admin privileges
router.use(protect);
router.use(adminOnly);

router.route('/flats').get(getFlats).post(createFlat);
router.route('/flats/:id').put(updateFlat);

router.route('/residents').get(getResidents).post(createResident);
router.route('/residents/:id').put(updateResident);

export default router;

