import { Router } from 'express';
import {
  getAllFAQs,
  getCategories,
  getFAQById,
  createFAQ
} from '../controllers/faqController.js';

const router = Router();

router.get('/', getAllFAQs);
router.get('/categories', getCategories);
router.get('/:id', getFAQById);
router.post('/', createFAQ);

export default router;
