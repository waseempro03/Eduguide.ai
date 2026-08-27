import { readJson, writeJson } from '../utils/storage.js';
import { matchScholarshipsForStudent } from '../services/recommendationService.js';

export async function getAllScholarships(req, res) {
  try {
    const { country, degree, funding, field, search } = req.query;
    let scholarships = await readJson('seeds/scholarships.json', []);

    if (country && country !== 'All') {
      scholarships = scholarships.filter(s =>
        s.country.toLowerCase().includes(country.toLowerCase()) ||
        s.country.toLowerCase() === 'european union' ||
        s.country.toLowerCase() === 'global'
      );
    }

    if (degree && degree !== 'All') {
      scholarships = scholarships.filter(s =>
        s.degree.some(d => d.toLowerCase().includes(degree.toLowerCase())) ||
        s.degree.includes('All Degrees')
      );
    }

    if (funding && funding !== 'All') {
      scholarships = scholarships.filter(s =>
        s.funding.toLowerCase().includes(funding.toLowerCase())
      );
    }

    if (field && field !== 'All') {
      scholarships = scholarships.filter(s =>
        s.fields.some(f => f.toLowerCase().includes(field.toLowerCase())) ||
        s.fields.includes('All Fields')
      );
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      scholarships = scholarships.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      count: scholarships.length,
      scholarships
    });
  } catch (error) {
    console.error('[ScholarshipController] Error fetching scholarships:', error);
    res.status(500).json({ error: 'Failed to retrieve scholarships' });
  }
}

export async function matchScholarships(req, res) {
  try {
    const studentProfile = req.body;
    const matched = await matchScholarshipsForStudent(studentProfile);

    res.json({
      success: true,
      count: matched.length,
      matches: matched
    });
  } catch (error) {
    console.error('[ScholarshipController] Error matching scholarships:', error);
    res.status(500).json({ error: 'Failed to match scholarships' });
  }
}

export async function createScholarship(req, res) {
  try {
    const scholarshipData = req.body;
    const scholarships = await readJson('seeds/scholarships.json', []);
    const newId = scholarships.length > 0 ? Math.max(...scholarships.map(s => s.id || 0)) + 1 : 1;

    const newScholarship = {
      id: newId,
      ...scholarshipData,
      lastVerified: new Date().toISOString()
    };

    scholarships.push(newScholarship);
    await writeJson('seeds/scholarships.json', scholarships);

    res.status(201).json({
      success: true,
      scholarship: newScholarship
    });
  } catch (error) {
    console.error('[ScholarshipController] Error creating scholarship:', error);
    res.status(500).json({ error: 'Failed to create scholarship' });
  }
}
