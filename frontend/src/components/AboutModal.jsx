import React from 'react';
import { X, Sparkles, Database, Search, ShieldCheck, Award } from 'lucide-react';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="sparkle-icon">✦</span>
            <h3>About EduGuide AI</h3>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ lineHeight: '1.6', fontSize: '0.88rem' }}>
          <p style={{ marginBottom: '14px', color: 'var(--text-primary)' }}>
            <strong>EduGuide AI</strong> is a full-stack, production-ready Global Education & Career AI Assistant engineered for B.Tech AI & Data Science.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Sparkles size={16} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Intent Classification & NLP:</strong> Automatically parses user queries into 13 educational domains (Scholarships, Admissions, Placements, Visas, Exams) with entity extraction.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Award size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>100-Point Recommendation Engine:</strong> Scores and ranks global scholarships against individual student profiles (CGPA, degree, nationality, IELTS/GRE scores).
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <ShieldCheck size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Verified Source Citations:</strong> Prioritizes official government portals (DAAD, Chevening, Fulbright, EduCanada) and institutional admission offices.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Database size={16} color="#06b6d4" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Structured Education Database:</strong> Global universities, verified placement statistics, and standardized entrance exam guides.
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            EduGuide AI v2.0 • Powered by Node.js, Express, React, Vite, MongoDB & OpenAI
          </div>
        </div>
      </div>
    </div>
  );
}
