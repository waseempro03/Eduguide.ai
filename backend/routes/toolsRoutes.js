import express from 'express';
import {
  evaluateSop,
  getLivingCostsData,
  getDeadlinesData,
  compareUniversities,
  getMockExamsData
} from '../services/toolsService.js';

const router = express.Router();

// SOP & Essay Review
router.post('/sop-review', async (req, res, next) => {
  try {
    const { text, targetUniversity, targetProgram, degreeLevel } = req.body;
    const result = await evaluateSop({ text, targetUniversity, targetProgram, degreeLevel });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// Living Costs
router.get('/living-costs', async (req, res, next) => {
  try {
    const currency = req.query.currency || 'USD';
    const result = await getLivingCostsData(currency);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// Deadlines
router.get('/deadlines', async (req, res, next) => {
  try {
    const category = req.query.category || 'All';
    const deadlines = await getDeadlinesData(category);
    res.json({ success: true, deadlines });
  } catch (err) {
    next(err);
  }
});

// Comparison
router.post('/compare', async (req, res, next) => {
  try {
    const { universities = [] } = req.body;
    const comparison = await compareUniversities(universities);
    res.json({ success: true, comparison });
  } catch (err) {
    next(err);
  }
});

// Mock Exams
router.get('/mock-exams', async (req, res, next) => {
  try {
    const category = req.query.category || 'all';
    const categories = await getMockExamsData(category);
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
});

export default router;
