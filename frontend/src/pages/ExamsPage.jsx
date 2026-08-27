import React, { useState, useEffect } from 'react';
import { BookOpen, Search, ExternalLink, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { getExams } from '../services/api';

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getExams({ search: searchQuery });
      setExams(res.exams || []);
    } catch (err) {
      console.error('Failed to load exams:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, height: '100%', overflowY: 'auto', padding: '24px 32px', background: 'var(--bg-app)' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <BookOpen size={22} color="#8b5cf6" />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Standardized & Entrance Exams Guide</h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Test structures, duration, registration fees, score scales, and official websites for IELTS, TOEFL, GRE, GMAT, and GATE.
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px', position: 'relative', maxWidth: '380px' }}>
        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search exams by name or purpose..."
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

      {/* Exams Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>Loading exam information...</div>
      ) : exams.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>No exams found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          {exams.map((e) => (
            <div
              key={e.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>{e.name}</h3>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', fontWeight: 600 }}>
                    {e.totalScore}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px', fontStyle: 'italic' }}>
                  {e.fullName}
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '12px' }}>
                  {e.purpose}
                </p>

                <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: '0.78rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                  <div><strong>⏱️ Duration:</strong> {e.duration}</div>
                  <div><strong>💵 Registration Fee:</strong> {e.fee}</div>
                  <div><strong>🌍 Key Acceptance:</strong> {e.countries?.join(', ')}</div>
                </div>

                {e.sections && e.sections.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>Test Sections:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {e.sections.map((sec, idx) => (
                        <div key={idx} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>• {sec.name} ({sec.description})</span>
                          <span style={{ color: 'var(--text-muted)' }}>{sec.scoreRange}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Official Test Agency</span>
                <a
                  href={e.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500 }}
                >
                  <span>Book / Register</span>
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
