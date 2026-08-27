import React, { useState, useEffect } from 'react';
import { UserCheck, Save, Sparkles, CheckCircle } from 'lucide-react';
import { getProfile, saveProfile } from '../services/api';

export default function ProfilePage({ onNavigate }) {
  const [profile, setProfile] = useState({
    nationality: 'India',
    educationLevel: 'Undergraduate',
    degree: 'Masters',
    field: 'Computer Science',
    cgpa: 8.5,
    graduationYear: 2025,
    preferredCountries: 'Germany, United States, United Kingdom',
    budget: 'Moderate',
    ieltsScore: 7.5,
    toeflScore: 102,
    greScore: 324,
    workExperience: 1
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await getProfile();
        if (res.profile) {
          setProfile({
            ...res.profile,
            preferredCountries: Array.isArray(res.profile.preferredCountries)
              ? res.profile.preferredCountries.join(', ')
              : (res.profile.preferredCountries || '')
          });
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    }
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const payload = {
        ...profile,
        preferredCountries: profile.preferredCountries.split(',').map(s => s.trim()).filter(Boolean),
        cgpa: parseFloat(profile.cgpa || '0'),
        ieltsScore: parseFloat(profile.ieltsScore || '0'),
        toeflScore: parseFloat(profile.toeflScore || '0'),
        greScore: parseInt(profile.greScore || '0', 10),
        workExperience: parseInt(profile.workExperience || '0', 10)
      };

      await saveProfile(payload);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ flex: 1, height: '100%', overflowY: 'auto', padding: '24px 32px', background: 'var(--bg-app)' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <UserCheck size={22} color="#ec4899" />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Student Academic Profile</h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Configure your academic qualifications, test scores, and country preferences to unlock personalized 100-point scholarship matches.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px', maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Academic Details Section */}
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
          Academic Qualifications
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Nationality / Citizenship
            </label>
            <input
              type="text"
              value={profile.nationality}
              onChange={(e) => setProfile({ ...profile, nationality: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Target Degree Level
            </label>
            <select
              value={profile.degree}
              onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
            >
              <option value="Masters">Masters (M.S. / M.Sc. / M.Tech / MBA)</option>
              <option value="PhD">PhD / Doctorate</option>
              <option value="Undergraduate">Undergraduate (Bachelor's / B.Tech)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Field of Study / Major
            </label>
            <input
              type="text"
              value={profile.field}
              onChange={(e) => setProfile({ ...profile, field: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Academic CGPA (Out of 10.0 or 4.0)
            </label>
            <input
              type="number"
              step="0.01"
              value={profile.cgpa}
              onChange={(e) => setProfile({ ...profile, cgpa: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Test Scores Section */}
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginTop: '10px' }}>
          Standardized Test Scores
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              IELTS Academic Band
            </label>
            <input
              type="number"
              step="0.5"
              placeholder="e.g. 7.5"
              value={profile.ieltsScore}
              onChange={(e) => setProfile({ ...profile, ieltsScore: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              TOEFL iBT Score
            </label>
            <input
              type="number"
              placeholder="e.g. 102"
              value={profile.toeflScore}
              onChange={(e) => setProfile({ ...profile, toeflScore: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              GRE Total (out of 340)
            </label>
            <input
              type="number"
              placeholder="e.g. 324"
              value={profile.greScore}
              onChange={(e) => setProfile({ ...profile, greScore: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Preferences Section */}
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginTop: '10px' }}>
          Destination Preferences
        </h3>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Preferred Study Abroad Destinations (comma-separated)
          </label>
          <input
            type="text"
            placeholder="e.g. Germany, United States, United Kingdom, Canada"
            value={profile.preferredCountries}
            onChange={(e) => setProfile({ ...profile, preferredCountries: e.target.value })}
            style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', marginTop: '6px' }}>
          {savedSuccess && (
            <span style={{ fontSize: '0.85rem', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={14} /> Profile Saved Successfully!
            </span>
          )}

          <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
            <button
              type="button"
              className="btn"
              onClick={() => onNavigate('scholarships')}
            >
              <Sparkles size={14} />
              <span>Find Matching Scholarships</span>
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              <Save size={14} />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
