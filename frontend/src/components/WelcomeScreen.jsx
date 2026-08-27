import React from 'react';

const SUGGESTION_CARDS = [
  {
    icon: '💰',
    title: 'Find Scholarships',
    subtitle: 'Fully funded DAAD, Chevening, Fulbright & Erasmus+',
    query: 'Find fully funded scholarships for computer science in Germany.'
  },
  {
    icon: '🎓',
    title: 'Top Universities',
    subtitle: 'Admission requirements, rankings & global tuition',
    query: 'What are the admission requirements for MIT?'
  },
  {
    icon: '💼',
    title: 'Placement Packages',
    subtitle: 'Average salaries, highest packages & top recruiters',
    query: 'What is the average placement package at IIT Madras?'
  },
  {
    icon: '🌍',
    title: 'Study Abroad & Visas',
    subtitle: 'Costs, blocked accounts, and visa guidance',
    query: 'What are the cost of living and study abroad steps for Germany?'
  }
];

export default function WelcomeScreen({ onSelectQuery }) {
  return (
    <div className="welcome-container">
      <div className="welcome-sparkle">✦</div>
      <h1 className="welcome-title">EduGuide AI</h1>
      <p className="welcome-tagline">Your Global Education & Career Assistant</p>
      <p className="welcome-subtext">How can I help you today?</p>

      <div className="suggestions-grid">
        {SUGGESTION_CARDS.map((card, idx) => (
          <div
            key={idx}
            className="suggestion-card"
            onClick={() => onSelectQuery(card.query)}
            role="button"
            tabIndex={0}
          >
            <div className="suggestion-card-header">
              <span>{card.icon}</span>
              <span>{card.title}</span>
            </div>
            <div className="suggestion-card-sub">{card.subtitle}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
