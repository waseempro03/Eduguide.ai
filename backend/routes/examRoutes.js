import { Router } from 'express';
import { getAllExams } from '../controllers/examController.js';

const router = Router();

router.get('/', getAllExams);

export default router;
