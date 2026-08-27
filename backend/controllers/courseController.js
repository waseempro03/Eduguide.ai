import { readJson } from '../utils/storage.js';

export async function getAllCourses(req, res) {
  try {
    const { field, degree, country, search } = req.query;
    let courses = await readJson('seeds/courses.json', []);

    if (field && field !== 'All') {
      courses = courses.filter(c => c.field.toLowerCase().includes(field.toLowerCase()));
    }

    if (degree && degree !== 'All') {
      courses = courses.filter(c => c.degree.toLowerCase().includes(degree.toLowerCase()));
    }

    if (country && country !== 'All') {
      courses = courses.filter(c => c.country.toLowerCase().includes(country.toLowerCase()));
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      courses = courses.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.university.toLowerCase().includes(q) ||
        c.field.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    console.error('[CourseController] Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to retrieve courses' });
  }
}
