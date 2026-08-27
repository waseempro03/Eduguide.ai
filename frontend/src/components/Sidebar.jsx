import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  Settings,
  ShieldAlert,
  Info,
  PanelLeftClose,
  LogIn,
  LogOut,
  User as UserIcon,
  Award,
  GraduationCap,
  FileText,
  Calendar,
  DollarSign,
  Scale,
  BookOpen,
  Briefcase,
  Globe,
  Sparkles
} from 'lucide-react';

export default function Sidebar({
  isOpen = true,
  onClose,
  chats = [],
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  currentUser,
  onNavigate,
  onOpenLogin,
  onLogout,
  onOpenAdmin,
  onOpenSettings,
  onOpenAbout
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const safeChats = Array.isArray(chats) ? chats : [];
  const filteredChats = safeChats.filter(chat =>
    chat && typeof chat.title === 'string' && chat.title.toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* Top Header */}
      <div className="sidebar-header">
        <div className="brand-title" onClick={() => onNavigate && onNavigate('chat')} title="EduGuide AI Home">
          <span className="sparkle-icon">✦</span>
          <span>EduGuide AI</span>
        </div>
        <button
          className="icon-btn"
          onClick={onClose}
          title="Close sidebar"
          aria-label="Close sidebar"
        >
          <PanelLeftClose size={18} />
        </button>
      </div>

      {/* New Chat Action */}
      <button className="new-chat-btn" onClick={onNewChat}>
        <div className="new-chat-left">
          <Plus size={16} />
          <span>New chat</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⌘K</span>
      </button>

      {/* Search Recent Chats */}
      {chats.length > 2 && (
        <div className="sidebar-search">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* AI Tools Suite Navigation Shortcuts */}
      <div className="sidebar-section-label">AI Tools & Planners</div>
      <div className="sidebar-tools-nav">
        <button className="sidebar-tool-link" onClick={() => onNavigate && onNavigate('sop-reviewer')}>
          <FileText size={14} color="#818cf8" />
          <span>SOP Reviewer</span>
          <span className="sidebar-new-tag">AI</span>
        </button>
        <button className="sidebar-tool-link" onClick={() => onNavigate && onNavigate('deadlines')}>
          <Calendar size={14} color="#f59e0b" />
          <span>Deadlines Planner</span>
        </button>
        <button className="sidebar-tool-link" onClick={() => onNavigate && onNavigate('cost-calculator')}>
          <DollarSign size={14} color="#10b981" />
          <span>Living Cost Calc</span>
        </button>
        <button className="sidebar-tool-link" onClick={() => onNavigate && onNavigate('comparator')}>
          <Scale size={14} color="#38bdf8" />
          <span>Uni Comparator</span>
        </button>
        <button className="sidebar-tool-link" onClick={() => onNavigate && onNavigate('exam-practice')}>
          <BookOpen size={14} color="#ec4899" />
          <span>Mock Quizzes</span>
        </button>
      </div>

      {/* Exploration Hubs Shortcuts */}
      <div className="sidebar-section-label">Exploration Hubs</div>
      <div className="sidebar-tools-nav">
        <button className="sidebar-tool-link" onClick={() => onNavigate && onNavigate('scholarships')}>
          <Award size={14} color="#f59e0b" />
          <span>Scholarships (100-pt)</span>
        </button>
        <button className="sidebar-tool-link" onClick={() => onNavigate && onNavigate('universities')}>
          <GraduationCap size={14} color="#10b981" />
          <span>Universities</span>
        </button>
        <button className="sidebar-tool-link" onClick={() => onNavigate && onNavigate('placements')}>
          <Briefcase size={14} color="#6366f1" />
          <span>Placements & ROI</span>
        </button>
        <button className="sidebar-tool-link" onClick={() => onNavigate && onNavigate('study-abroad')}>
          <Globe size={14} color="#06b6d4" />
          <span>Study Abroad Hub</span>
        </button>
      </div>

      {/* Recent Chats Section Label */}
      <div className="sidebar-section-label">Recent Chats</div>

      {/* Scrollable Conversation List */}
      <div className="sidebar-history">
        {filteredChats.length === 0 ? (
          <div style={{ padding: '12px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            No conversations found
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`history-item ${chat.id === activeChatId ? 'active' : ''}`}
              onClick={() => {
                if (onNavigate) onNavigate('chat');
                onSelectChat(chat.id);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
                <MessageSquare size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
                <span className="history-title" title={chat.title}>
                  {chat.title}
                </span>
              </div>

              <div className="history-actions">
                <button
                  className="history-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  title="Delete chat"
                  aria-label="Delete chat"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Navigation */}
      <div className="sidebar-footer">
        {/* User Account / Sign In Widget */}
        {currentUser ? (
          <div className="sidebar-user-card" onClick={() => onNavigate && onNavigate('profile')} title="View Profile">
            <div className="user-avatar-badge">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name || 'User'} className="user-avatar-img" />
              ) : (
                <span>{((currentUser.name || currentUser.email || 'U').charAt(0)).toUpperCase()}</span>
              )}
            </div>
            <div className="user-info-col">
              <span className="user-name" title={currentUser.name || 'User'}>{currentUser.name || 'User'}</span>
              <span className="user-email" title={currentUser.email || ''}>{currentUser.email || ''}</span>
            </div>
            <button
              className="user-logout-btn"
              onClick={(e) => {
                e.stopPropagation();
                onLogout();
              }}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button className="sidebar-footer-btn login-highlight-btn" onClick={onOpenLogin}>
            <LogIn size={15} />
            <span>Sign In / Register</span>
          </button>
        )}

        <button className="sidebar-footer-btn" onClick={onOpenAdmin}>
          <ShieldAlert size={15} />
          <span>Admin Portal</span>
        </button>

        <button className="sidebar-footer-btn" onClick={onOpenSettings}>
          <Settings size={15} />
          <span>Settings</span>
        </button>

        <button className="sidebar-footer-btn" onClick={onOpenAbout}>
          <Info size={15} />
          <span>About EduGuide AI</span>
        </button>
      </div>
    </aside>
  );
}
