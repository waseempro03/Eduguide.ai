import { Router } from 'express';
import {
  submitFeedback,
  getAllFeedback,
  getFeedbackStats
} from '../controllers/feedbackController.js';

const router = Router();

router.post('/', submitFeedback);
router.get('/', getAllFeedback);
router.get('/stats', getFeedbackStats);

export default router;
