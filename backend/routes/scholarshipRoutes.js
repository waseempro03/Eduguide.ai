import { Router } from 'express';
import {
  getAllScholarships,
  matchScholarships,
  createScholarship
} from '../controllers/scholarshipController.js';

const router = Router();

router.get('/', getAllScholarships);
router.post('/match', matchScholarships);
router.post('/', createScholarship);

export default router;
