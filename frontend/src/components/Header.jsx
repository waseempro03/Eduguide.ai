import React from 'react';
import { Bot, Sparkles, Moon, Sun, Trash2, BookOpen, BarChart3, ShieldCheck } from 'lucide-react';

export default function Header({
  theme,
  toggleTheme,
  onClearChat,
  onOpenFaqDirectory,
  onOpenAdmin,
  isOnline = true
}) {
  return (
    <header className="header-container">
      <div className="brand-section">
        <div className="brand-logo">
          <Bot size={24} />
        </div>
        <div className="brand-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1>CampusConnect</h1>
            <span className="pill pill-category" style={{ fontSize: '0.65rem' }}>AI Assistant</span>
          </div>
          <div className="status-badge">
            <span className="status-dot"></span>
            <span>{isOnline ? 'NLP Engine Active' : 'Connecting...'}</span>
          </div>
        </div>
      </div>

      <div className="header-actions">
        <button
          className="btn"
          onClick={onOpenFaqDirectory}
          title="Browse FAQ Knowledge Base"
        >
          <BookOpen size={16} />
          <span>Knowledge Base</span>
        </button>

        <button
          className="btn"
          onClick={onOpenAdmin}
          title="Admin & Analytics Dashboard"
        >
          <BarChart3 size={16} />
          <span>Admin & Analytics</span>
        </button>

        <button
          className="btn"
          onClick={onClearChat}
          title="Clear Conversation History"
        >
          <Trash2 size={16} />
          <span>Clear</span>
        </button>

        <button
          className="btn btn-icon"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
