import { readJson } from '../utils/storage.js';

export async function getAllUniversities(req, res) {
  try {
    const { country, search } = req.query;
    let universities = await readJson('seeds/universities.json', []);

    if (country && country !== 'All') {
      universities = universities.filter(u => u.country.toLowerCase().includes(country.toLowerCase()));
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      universities = universities.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.country.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q) ||
        (u.courses && u.courses.some(c => c.toLowerCase().includes(q)))
      );
    }

    res.json({
      success: true,
      count: universities.length,
      universities
    });
  } catch (error) {
    console.error('[UniversityController] Error fetching universities:', error);
    res.status(500).json({ error: 'Failed to retrieve universities' });
  }
}

export async function getUniversityById(req, res) {
  try {
    const { id } = req.params;
    const universities = await readJson('seeds/universities.json', []);
    const university = universities.find(u => u.id === Number(id));

    if (!university) {
      return res.status(404).json({ error: `University with ID ${id} not found` });
    }

    res.json({ success: true, university });
  } catch (error) {
    console.error('[UniversityController] Error fetching university by ID:', error);
    res.status(500).json({ error: 'Failed to retrieve university' });
  }
}
