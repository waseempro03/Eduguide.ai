import { Router } from 'express';
import {
  logUnanswered,
  getUnanswered,
  updateUnansweredStatus,
  deleteUnanswered
} from '../controllers/unansweredController.js';

const router = Router();

router.post('/', logUnanswered);
router.get('/', getUnanswered);
router.patch('/:id', updateUnansweredStatus);
router.delete('/:id', deleteUnanswered);

export default router;
