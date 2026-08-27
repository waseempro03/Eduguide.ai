import { readJson } from '../utils/storage.js';

export async function getAllPlacements(req, res) {
  try {
    const { country, university, search } = req.query;
    let placements = await readJson('seeds/placements.json', []);

    if (country && country !== 'All') {
      placements = placements.filter(p => p.country.toLowerCase().includes(country.toLowerCase()));
    }

    if (university && university !== 'All') {
      placements = placements.filter(p => p.university.toLowerCase().includes(university.toLowerCase()));
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      placements = placements.filter(p =>
        p.university.toLowerCase().includes(q) ||
        p.program.toLowerCase().includes(q) ||
        (p.topRecruiters && p.topRecruiters.some(r => r.toLowerCase().includes(q)))
      );
    }

    res.json({
      success: true,
      count: placements.length,
      placements
    });
  } catch (error) {
    console.error('[PlacementController] Error fetching placements:', error);
    res.status(500).json({ error: 'Failed to retrieve placements' });
  }
}
