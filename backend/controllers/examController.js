import { readJson } from '../utils/storage.js';

export async function getAllExams(req, res) {
  try {
    const { search } = req.query;
    let exams = await readJson('seeds/exams.json', []);

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      exams = exams.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.fullName.toLowerCase().includes(q) ||
        e.purpose.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      count: exams.length,
      exams
    });
  } catch (error) {
    console.error('[ExamController] Error fetching exams:', error);
    res.status(500).json({ error: 'Failed to retrieve exams' });
  }
}
