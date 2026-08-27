import React from 'react';
import { X, Moon, Sun, Check, Sparkles } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  enterToSend,
  onEnterToSendChange
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Settings</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close settings">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Appearance */}
          <div className="setting-row">
            <div>
              <div className="setting-label">Appearance</div>
              <div className="setting-sub">Customize the interface visual theme</div>
            </div>

            <div className="theme-options">
              <button
                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => onThemeChange('dark')}
              >
                Dark
              </button>
              <button
                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => onThemeChange('light')}
              >
                Light
              </button>
            </div>
          </div>

          {/* Chat Behavior */}
          <div className="setting-row">
            <div>
              <div className="setting-label">Enter to send</div>
              <div className="setting-sub">Press Enter to send message, Shift+Enter for new line</div>
            </div>

            <input
              type="checkbox"
              checked={Boolean(enterToSend)}
              onChange={(e) => onEnterToSendChange && onEnterToSendChange(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
            />
          </div>

          {/* System Info */}
          <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              EduGuide AI Engine
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Version 2.0.0 • 13-Domain Intent Classifier, 100-Point Scholarship Recommendation Engine & OpenAI Synthesis
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
