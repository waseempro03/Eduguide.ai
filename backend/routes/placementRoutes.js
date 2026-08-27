import { Router } from 'express';
import { getAllPlacements } from '../controllers/placementController.js';

const router = Router();

router.get('/', getAllPlacements);

export default router;
