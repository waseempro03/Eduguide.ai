import React, { useState } from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';

const SUGGESTIONS_BY_CATEGORY = {
  All: [
    "What are the admission requirements?",
    "How much are the hostel fees?",
    "How do I apply for a scholarship?",
    "When are semester exams conducted?",
    "What is the minimum attendance requirement?",
    "What companies recruit from the college?"
  ],
  Admissions: [
    "What are the admission requirements?",
    "How do I apply for admission?",
    "Can international students apply for admission?",
    "How do I request an official transcript?"
  ],
  Hostel: [
    "How much are the hostel fees?",
    "What are the hostel rules and curfew timings?"
  ],
  Fees: [
    "What is the tuition fee structure?",
    "What payment methods are accepted for paying fees?",
    "What is the refund policy if I cancel admission?"
  ],
  Exams: [
    "When are semester exams conducted?",
    "What is the grading system and GPA scale?",
    "What happens if I fail an exam?"
  ],
  Placements: [
    "What companies recruit from the college?",
    "How does the placement cell help with internships?"
  ],
  Transport: [
    "Is campus bus and transport facility available?",
    "What is the policy for student parking?"
  ]
};

export default function SuggestedQuestions({ onSelectQuestion }) {
  const [activeTab, setActiveTab] = useState('All');
  const categories = Object.keys(SUGGESTIONS_BY_CATEGORY);
  const questions = SUGGESTIONS_BY_CATEGORY[activeTab] || [];

  return (
    <div className="suggestions-container">
      <div className="suggestions-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
          <span>Suggested Questions</span>
        </div>

        {/* Mini Category Filter Tabs */}
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', maxWidth: '60%' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              style={{
                background: activeTab === cat ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === cat ? 'white' : 'var(--text-muted)',
                border: 'none',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.7rem',
                cursor: 'pointer',
                fontWeight: activeTab === cat ? '600' : '400',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="chips-wrapper">
        {questions.map((q, idx) => (
          <button
            key={idx}
            className="chip-btn"
            onClick={() => onSelectQuestion(q)}
            title={`Ask: "${q}"`}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
