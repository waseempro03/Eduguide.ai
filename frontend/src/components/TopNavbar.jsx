import React from 'react';
import { Sun, Moon, LogIn } from 'lucide-react';

export default function TopNavbar({
  currentRoute,
  onNavigate,
  currentUser,
  onLogout,
  theme,
  onThemeChange
}) {

  return (
    <header className="top-navbar-container">
      {/* Brand / Logo */}
      <div className="top-nav-brand" onClick={() => onNavigate('chat')} title="EduGuide AI Home">
        <span className="brand-star">✦</span>
        <span className="brand-text">EduGuide AI</span>
      </div>



      {/* Right User & Utility Controls */}
      <div className="top-nav-actions">
        {/* Theme Toggle */}
        <button
          className="top-nav-icon-btn"
          onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* User Account / Auth */}
        {currentUser ? (
          <div className="top-nav-user-pill" onClick={() => onNavigate('profile')} title="View Profile">
            <div className="top-user-avatar">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} />
              ) : (
                <span>{(currentUser.name || currentUser.email || 'U').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span className="top-user-name">{currentUser.name || 'Student'}</span>
          </div>
        ) : (
          <button className="top-nav-login-btn" onClick={() => onNavigate('login')}>
            <LogIn size={14} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
