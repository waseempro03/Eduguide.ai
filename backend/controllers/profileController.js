import { readJson, writeJson } from '../utils/storage.js';
import { getSupabaseClient } from '../config/supabase.js';

export async function getProfile(req, res) {
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('student_profiles').select('*').limit(1).maybeSingle();
        if (!error && data) {
          return res.json({ success: true, profile: data });
        }
      } catch (e) {
        console.warn('[Supabase] Error reading profile from Supabase:', e.message);
      }
    }

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

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('student_profiles').upsert({
          user_id: profileData.userId || 'default_user',
          degree: profileData.degree,
          field: profileData.field,
          cgpa: profileData.cgpa,
          nationality: profileData.nationality,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn('[Supabase] Error saving profile to Supabase:', e.message);
      }
    }

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
