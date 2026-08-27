import React, { useState, useRef, useEffect } from 'react';
import { PanelLeftOpen, MoreHorizontal, Trash2, Plus, Settings, Info, LogIn, LogOut, Download, Sparkles, Sun, Moon } from 'lucide-react';
import ModelSelector from './ModelSelector';

export default function ChatHeader({
  isSidebarOpen,
  onToggleSidebar,
  onNewChat,
  onClearChat,
  onExportChat,
  selectedModel,
  onSelectModel,
  currentUser,
  theme = 'dark',
  onThemeChange,
  onOpenLogin,
  onLogout,
  onOpenSettings,
  onOpenAbout
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="chat-header">
      <div className="chat-header-left">
        {!isSidebarOpen && (
          <button
            className="icon-btn"
            onClick={onToggleSidebar}
            title="Open sidebar"
            aria-label="Open sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}

        {/* Multi-Model Switcher Dropdown */}
        <ModelSelector
          selectedModel={selectedModel}
          onSelectModel={onSelectModel}
        />
      </div>

      <div className="chat-header-right" ref={menuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Quick Sign In button in header when logged out */}
        {!currentUser && (
          <button
            className="btn btn-primary"
            style={{ padding: '5px 12px', fontSize: '0.8rem', borderRadius: 'var(--radius-pill)' }}
            onClick={onOpenLogin}
          >
            <LogIn size={13} />
            <span>Sign In</span>
          </button>
        )}

        {currentUser && (
          <div
            className="user-avatar-badge"
            style={{ width: '28px', height: '28px', fontSize: '0.75rem', cursor: 'pointer' }}
            onClick={() => setMenuOpen(!menuOpen)}
            title={(currentUser && currentUser.name) || 'User'}
          >
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={(currentUser && currentUser.name) || 'User'} className="user-avatar-img" />
            ) : (
              <span>{((currentUser && currentUser.name) || 'U').charAt(0).toUpperCase()}</span>
            )}
          </div>
        )}

        {/* Quick Theme Switcher Button */}
        <button
          className="icon-btn"
          onClick={() => onThemeChange && onThemeChange(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button
          className="icon-btn"
          onClick={onNewChat}
          title="New chat"
          aria-label="New chat"
        >
          <Plus size={18} />
        </button>

        <button
          className="icon-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          title="More options"
          aria-label="More options"
        >
          <MoreHorizontal size={18} />
        </button>

        {/* Action Dropdown Menu */}
        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '36px',
              width: '190px',
              background: 'var(--bg-sidebar)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
              padding: '6px',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}
          >
            {currentUser ? (
              <button
                className="sidebar-footer-btn"
                onClick={() => {
                  setMenuOpen(false);
                  if (onLogout) onLogout();
                }}
                style={{ color: 'var(--danger)' }}
              >
                <LogOut size={14} />
                <span>Sign Out ({((currentUser && currentUser.name) || 'User').split(' ')[0]})</span>
              </button>
            ) : (
              <button
                className="sidebar-footer-btn"
                onClick={() => {
                  setMenuOpen(false);
                  if (onOpenLogin) onOpenLogin();
                }}
                style={{ color: 'var(--accent-primary)' }}
              >
                <LogIn size={14} />
                <span>Sign In / Register</span>
              </button>
            )}

            <button
              className="sidebar-footer-btn"
              onClick={() => {
                setMenuOpen(false);
                if (onExportChat) onExportChat();
              }}
            >
              <Download size={14} />
              <span>Export Chat (.md)</span>
            </button>

            <button
              className="sidebar-footer-btn"
              onClick={() => {
                setMenuOpen(false);
                if (onClearChat) onClearChat();
              }}
            >
              <Trash2 size={14} />
              <span>Clear conversation</span>
            </button>

            <button
              className="sidebar-footer-btn"
              onClick={() => {
                setMenuOpen(false);
                if (onOpenSettings) onOpenSettings();
              }}
            >
              <Settings size={14} />
              <span>Settings</span>
            </button>

            <button
              className="sidebar-footer-btn"
              onClick={() => {
                setMenuOpen(false);
                if (onOpenAbout) onOpenAbout();
              }}
            >
              <Info size={14} />
              <span>About EduGuide AI</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
