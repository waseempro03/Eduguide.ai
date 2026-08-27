import React, { useState, useEffect } from 'react';
import { Award, Search, CheckCircle, ExternalLink, SlidersHorizontal, Sparkles, UserCheck } from 'lucide-react';
import { getScholarships, matchScholarships, getProfile } from '../services/api';

export default function ScholarshipsPage({ onNavigate }) {
  const [scholarships, setScholarships] = useState([]);
  const [countryFilter, setCountryFilter] = useState('All');
  const [degreeFilter, setDegreeFilter] = useState('All');
  const [fundingFilter, setFundingFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMatchingMode, setIsMatchingMode] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);

  useEffect(() => {
    loadData();
  }, [countryFilter, degreeFilter, fundingFilter, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isMatchingMode && studentProfile) {
        const matchRes = await matchScholarships(studentProfile);
        setScholarships(matchRes.matches || []);
      } else {
        const res = await getScholarships({
          country: countryFilter,
          degree: degreeFilter,
          funding: fundingFilter,
          search: searchQuery
        });
        setScholarships(res.scholarships || []);
      }
    } catch (err) {
      console.error('Failed to load scholarships:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMatching = async () => {
    if (!isMatchingMode) {
      setLoading(true);
      try {
        const profileRes = await getProfile();
        setStudentProfile(profileRes.profile);
        const matchRes = await matchScholarships(profileRes.profile);
        setScholarships(matchRes.matches || []);
        setIsMatchingMode(true);
      } catch (err) {
        console.error('Matching failed:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setIsMatchingMode(false);
      loadData();
    }
  };

  const getTierColor = (tier) => {
    if (tier === 'Excellent Match') return 'var(--success)';
    if (tier === 'Strong Match') return 'var(--accent-primary)';
    if (tier === 'Possible Match') return 'var(--warning)';
    return 'var(--text-muted)';
  };

  return (
    <div style={{ flex: 1, height: '100%', overflowY: 'auto', padding: '24px 32px', background: 'var(--bg-app)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Award size={22} color="var(--accent-primary)" />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Global Scholarships & Funding</h1>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Discover verified fully-funded government fellowships, university grants, and merit scholarships.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className={`btn ${isMatchingMode ? 'btn-primary' : ''}`}
            onClick={handleToggleMatching}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={14} />
            <span>{isMatchingMode ? 'Viewing 100-Point Match Results' : 'Match With My Student Profile'}</span>
          </button>
        </div>
      </div>

      {/* Matching Banner if Active */}
      {isMatchingMode && studentProfile && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>100-Point Match Engine Active:</span> Scored against Profile ({studentProfile.nationality}, {studentProfile.degree} in {studentProfile.field}, CGPA: {studentProfile.cgpa}, IELTS: {studentProfile.ieltsScore}).
          </div>
          <button
            className="btn"
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            onClick={() => onNavigate('profile')}
          >
            <UserCheck size={12} /> Edit Profile
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search scholarships by name, country, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>

        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          style={{ padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
        >
          <option value="All">All Countries</option>
          <option value="Germany">Germany</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="United States">United States</option>
          <option value="European Union">European Union</option>
          <option value="Canada">Canada</option>
          <option value="Japan">Japan</option>
          <option value="Switzerland">Switzerland</option>
          <option value="South Korea">South Korea</option>
        </select>

        <select
          value={degreeFilter}
          onChange={(e) => setDegreeFilter(e.target.value)}
          style={{ padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
        >
          <option value="All">All Degrees</option>
          <option value="Masters">Masters</option>
          <option value="PhD">PhD</option>
          <option value="Undergraduate">Undergraduate</option>
        </select>

        <select
          value={fundingFilter}
          onChange={(e) => setFundingFilter(e.target.value)}
          style={{ padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
        >
          <option value="All">All Funding Levels</option>
          <option value="Fully Funded">Fully Funded</option>
          <option value="Partial">Partial</option>
        </select>
      </div>

      {/* Scholarships List Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>Loading scholarships...</div>
      ) : scholarships.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>No scholarships found matching your filter criteria.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          {scholarships.map((s) => (
            <div
              key={s.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</h3>
                  <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--accent-primary)', whiteSpace: 'nowrap' }}>
                    {s.funding}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  📍 {s.country} • 🏛️ {s.university}
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '12px' }}>
                  {s.description}
                </p>

                <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: '0.78rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong>Coverage:</strong> {s.amount}</div>
                  <div><strong>Deadline:</strong> {s.deadline}</div>
                  <div><strong>Min CGPA:</strong> {s.eligibility?.minCGPA || 'N/A'} • <strong>Lang:</strong> {s.eligibility?.languageRequirement || 'Standard'}</div>
                </div>

                {/* Match Score Badge if Match Mode */}
                {s.matchScore !== undefined && (
                  <div style={{ marginTop: '10px', padding: '8px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(129, 140, 248, 0.1)', border: '1px solid rgba(129, 140, 248, 0.25)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 600, color: getTierColor(s.matchTier) }}>{s.matchTier} ({s.matchScore}/100)</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>C:{s.matchBreakdown?.countryMatch} D:{s.matchBreakdown?.degreeMatch} F:{s.matchBreakdown?.fieldMatch} A:{s.matchBreakdown?.academicEligibility}</span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', marginTop: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Verified Source</span>
                <a
                  href={s.officialWebsite || s.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500 }}
                >
                  <span>Official Application</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
