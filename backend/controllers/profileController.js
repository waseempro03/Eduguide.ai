import { readJson, writeJson } from '../utils/storage.js';

export async function getProfile(req, res) {
  try {
    const profile = await readJson('profile.json', {
      nationality: 'India',
      educationLevel: 'Undergraduate',
      degree: 'Masters',
      field: 'Computer Science',
      cgpa: 8.5,
      graduationYear: 2025,
      preferredCountries: ['Germany', 'United States', 'United Kingdom'],
      budget: 'Moderate',
      ieltsScore: 7.5,
      toeflScore: 102,
      greScore: 324,
      workExperience: 1
    });

    res.json({ success: true, profile });
  } catch (error) {
    console.error('[ProfileController] Error getting profile:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
}

export async function saveProfile(req, res) {
  try {
    const profileData = req.body;
    await writeJson('profile.json', profileData);
    res.json({
      success: true,
      message: 'Student profile saved successfully',
      profile: profileData
    });
  } catch (error) {
    console.error('[ProfileController] Error saving profile:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
}
