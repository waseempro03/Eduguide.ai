import React, { useState } from 'react';
import { X, Moon, Sun, Monitor, Check, Sparkles, Zap, MessageSquare, Globe, ShieldCheck } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  enterToSend,
  onEnterToSendChange
}) {
  const [activeTab, setActiveTab] = useState('general');

  if (!isOpen) return null;

  return (
    <div className="chatgpt-modal-backdrop" onClick={onClose}>
      <div className="chatgpt-settings-dialog" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="chatgpt-settings-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>Settings</span>
          </div>
          <button className="chatgpt-modal-close-btn" onClick={onClose} aria-label="Close settings">
            <X size={18} />
          </button>
        </div>

        {/* Modal Main Body (Tabbed Layout like ChatGPT) */}
        <div className="chatgpt-settings-body">
          {/* Left Navigation Sidebar */}
          <div className="chatgpt-settings-tabs">
            <button
              className={`chatgpt-tab-nav-btn ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <Monitor size={16} />
              <span>General</span>
            </button>

            <button
              className={`chatgpt-tab-nav-btn ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              <MessageSquare size={16} />
              <span>Chat Controls</span>
            </button>

            <button
              className={`chatgpt-tab-nav-btn ${activeTab === 'engine' ? 'active' : ''}`}
              onClick={() => setActiveTab('engine')}
            >
              <Zap size={16} color="#10b981" />
              <span>AI & Grounding</span>
            </button>
          </div>

          {/* Right Content View */}
          <div className="chatgpt-settings-content">
            {activeTab === 'general' && (
              <div className="chatgpt-settings-section">
                <div className="chatgpt-setting-group">
                  <div className="chatgpt-setting-info">
                    <div className="chatgpt-setting-title">Theme Appearance</div>
                    <div className="chatgpt-setting-desc">Customize the interface color scheme and visual theme</div>
                  </div>

                  <div className="chatgpt-theme-pill-group">
                    <button
                      className={`chatgpt-theme-pill ${theme === 'dark' ? 'active' : ''}`}
                      onClick={() => onThemeChange('dark')}
                    >
                      <Moon size={14} />
                      <span>Dark</span>
                      {theme === 'dark' && <Check size={14} className="check-mark" />}
                    </button>

                    <button
                      className={`chatgpt-theme-pill ${theme === 'light' ? 'active' : ''}`}
                      onClick={() => onThemeChange('light')}
                    >
                      <Sun size={14} />
                      <span>Light</span>
                      {theme === 'light' && <Check size={14} className="check-mark" />}
                    </button>
                  </div>
                </div>

                <div className="chatgpt-setting-group" style={{ marginTop: '16px' }}>
                  <div className="chatgpt-setting-info">
                    <div className="chatgpt-setting-title">System Interface</div>
                    <div className="chatgpt-setting-desc">ChatGPT-inspired minimalist layout with compact sidebar</div>
                  </div>
                  <span className="chatgpt-badge-active">Standard</span>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="chatgpt-settings-section">
                <div className="chatgpt-setting-group">
                  <div className="chatgpt-setting-info">
                    <div className="chatgpt-setting-title">Enter to Send</div>
                    <div className="chatgpt-setting-desc">Press Enter to dispatch messages instantly. Use Shift+Enter for new line breaks.</div>
                  </div>

                  {/* Modern Sleek Toggle Switch */}
                  <label className="chatgpt-toggle-switch">
                    <input
                      type="checkbox"
                      checked={Boolean(enterToSend)}
                      onChange={(e) => onEnterToSendChange && onEnterToSendChange(e.target.checked)}
                    />
                    <span className="chatgpt-toggle-slider"></span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'engine' && (
              <div className="chatgpt-settings-section">
                <div className="chatgpt-engine-card">
                  <div className="chatgpt-engine-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={18} color="#818cf8" />
                      <span style={{ fontWeight: 600, fontSize: '0.92rem', color: '#ffffff' }}>Google Gemini AI Engine</span>
                    </div>
                    <span className="chatgpt-live-indicator">
                      <span className="live-dot"></span>
                      Real-Time Live
                    </span>
                  </div>

                  <div className="chatgpt-engine-meta-row">
                    <div className="chatgpt-meta-item">
                      <Globe size={14} color="#34d399" />
                      <span>Google Search Grounding: <strong>Active</strong></span>
                    </div>
                    <div className="chatgpt-meta-item">
                      <ShieldCheck size={14} color="#f59e0b" />
                      <span>Recommendation Score: <strong>100-Point Fit</strong></span>
                    </div>
                  </div>

                  <div className="chatgpt-engine-desc">
                    Powered by Google Gemini 3.6 Flash & Real-Time Web Search Grounding for live admissions, scholarships, ranking metrics, and SOP analysis.
                  </div>
                </div>

                <div style={{ marginTop: '16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  EduGuide AI Core System v2.5.0 • 13-Domain Intent Classifier • MongoDB Persistence
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
