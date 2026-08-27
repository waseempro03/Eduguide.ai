import React, { useState, useEffect } from 'react';
import { GraduationCap, Search, ExternalLink, MapPin, DollarSign, Award, BookOpen } from 'lucide-react';
import { getUniversities } from '../services/api';

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState([]);
  const [countryFilter, setCountryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [countryFilter, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getUniversities({ country: countryFilter, search: searchQuery });
      setUniversities(res.universities || []);
    } catch (err) {
      console.error('Failed to load universities:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, height: '100%', overflowY: 'auto', padding: '24px 32px', background: 'var(--bg-app)' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <GraduationCap size={22} color="#10b981" />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Global Universities Directory</h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Explore world-class research institutions, QS global rankings, tuition costs, and admission requirements.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search universities by name, courses, or city..."
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
          <option value="United States">United States</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="Germany">Germany</option>
          <option value="India">India</option>
          <option value="Canada">Canada</option>
          <option value="Singapore">Singapore</option>
          <option value="Switzerland">Switzerland</option>
        </select>
      </div>

      {/* Universities Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>Loading universities...</div>
      ) : universities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>No universities found matching your search.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          {universities.map((u) => (
            <div
              key={u.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</h3>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    QS #{u.ranking?.qsWorld || 'Top'}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  📍 {u.city}, {u.country} • Acceptance Rate: {u.acceptanceRate}
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '12px' }}>
                  {u.description}
                </p>

                <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: '0.78rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                  <div><strong>Undergraduate Tuition:</strong> {u.tuition?.undergraduate}</div>
                  <div><strong>Postgraduate Tuition:</strong> {u.tuition?.postgraduate}</div>
                </div>

                {u.courses && u.courses.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {u.courses.map((c, i) => (
                      <span key={i} style={{ fontSize: '0.7rem', background: 'var(--bg-input)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Verified Institution</span>
                <a
                  href={u.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500 }}
                >
                  <span>Admissions Website</span>
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
