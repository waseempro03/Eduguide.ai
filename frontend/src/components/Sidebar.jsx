import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  SquarePen,
  Search,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
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
  Sparkles,
  MoreHorizontal,
  Pin,
  Share,
  Archive,
  ChevronDown
} from 'lucide-react';

export default function Sidebar({
  isOpen = true,
  onClose,
  currentRoute = 'chat',
  chats = [],
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onPinChat,
  onShareChat,
  onArchiveChat,
  onClearAllChats,
  currentUser,
  onNavigate,
  onOpenLogin,
  onLogout,
  onOpenAdmin,
  onOpenSettings,
  onOpenAbout
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showMoreTools, setShowMoreTools] = useState(false);
  const [menuChatId, setMenuChatId] = useState(null);

  const menuContainerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target)) {
        setMenuChatId(null);
      }
    }
    if (menuChatId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuChatId]);

  const safeChats = Array.isArray(chats) ? chats : [];
  const activeChats = safeChats.filter(c => c && !c.archived);
  const filteredChats = activeChats.filter(chat =>
    chat && typeof chat.title === 'string' && chat.title.toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const pinnedChats = filteredChats.filter(c => c.pinned);
  const recentChats = filteredChats.filter(c => !c.pinned);

  const handleStartRename = (e, chat) => {
    e.stopPropagation();
    setMenuChatId(null);
    setEditingChatId(chat.id);
    setEditingTitle(chat.title || '');
  };

  const handleSaveRename = (e, chatId) => {
    e.stopPropagation();
    if (onRenameChat && editingTitle.trim()) {
      onRenameChat(chatId, editingTitle.trim());
    }
    setEditingChatId(null);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingChatId(null);
  };

  const renderChatItem = (chat) => {
    const isEditing = editingChatId === chat.id;
    const isActive = currentRoute === 'chat' && chat.id === activeChatId;
    const isMenuOpen = menuChatId === chat.id;

    return (
      <div
        key={chat.id}
        className={`chatgpt-chat-item ${isActive ? 'active' : ''}`}
        onClick={() => {
          if (onNavigate) onNavigate('chat');
          if (onSelectChat) onSelectChat(chat.id);
        }}
        title={chat.title}
        style={{ position: 'relative' }}
      >
        {isEditing ? (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRename(e, chat.id);
                if (e.key === 'Escape') handleCancelRename(e);
              }}
              autoFocus
              style={{
                flex: 1,
                background: 'var(--bg-input)',
                border: '1px solid var(--accent-primary)',
                borderRadius: '4px',
                color: '#ffffff',
                padding: '3px 8px',
                fontSize: '0.84rem',
                outline: 'none'
              }}
            />
            <button
              className="history-action-btn"
              onClick={(e) => handleSaveRename(e, chat.id)}
              title="Save"
            >
              <Check size={13} color="#10b981" />
            </button>
            <button
              className="history-action-btn"
              onClick={handleCancelRename}
              title="Cancel"
            >
              <X size={13} color="#ef4444" />
            </button>
          </div>
        ) : (
          <>
            <span className="chatgpt-chat-title">
              {chat.title}
            </span>

            {/* Hover Actions: Pin Icon + Options Menu (...) */}
            <div className={`history-actions ${isMenuOpen ? 'visible' : ''}`} onClick={(e) => e.stopPropagation()}>
              <button
                className="history-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPinChat) onPinChat(chat.id);
                }}
                title={chat.pinned ? 'Unpin chat' : 'Pin chat'}
              >
                <Pin size={13} style={{ opacity: chat.pinned ? 1 : 0.6, transform: chat.pinned ? 'rotate(45deg)' : 'none' }} />
              </button>

              <button
                className="history-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuChatId(menuChatId === chat.id ? null : chat.id);
                }}
                title="Options"
              >
                <MoreHorizontal size={14} />
              </button>
            </div>

            {/* ChatGPT Exact Context Menu Dropdown */}
            {isMenuOpen && (
              <div
                className="chatgpt-context-menu"
                ref={menuContainerRef}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="chatgpt-menu-item"
                  onClick={() => {
                    setMenuChatId(null);
                    if (onShareChat) onShareChat(chat);
                  }}
                >
                  <Share size={14} />
                  <span>Share</span>
                </button>

                <button
                  className="chatgpt-menu-item"
                  onClick={(e) => handleStartRename(e, chat)}
                >
                  <Edit2 size={14} />
                  <span>Rename</span>
                </button>

                <button
                  className="chatgpt-menu-item"
                  onClick={() => {
                    setMenuChatId(null);
                    if (onPinChat) onPinChat(chat.id);
                  }}
                >
                  <Pin size={14} />
                  <span>{chat.pinned ? 'Unpin chat' : 'Pin chat'}</span>
                </button>

                <button
                  className="chatgpt-menu-item"
                  onClick={() => {
                    setMenuChatId(null);
                    if (onArchiveChat) onArchiveChat(chat.id);
                  }}
                >
                  <Archive size={14} />
                  <span>Archive</span>
                </button>

                <div className="chatgpt-menu-divider" />

                <button
                  className="chatgpt-menu-item danger"
                  onClick={() => {
                    setMenuChatId(null);
                    if (onDeleteChat) onDeleteChat(chat.id);
                  }}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* ChatGPT Top Header */}
      <div className="sidebar-header">
        <div className="brand-title" onClick={() => onNavigate && onNavigate('chat')} title="EduGuide AI Home">
          <span>EduGuide AI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            className="icon-btn"
            onClick={() => setShowSearch(!showSearch)}
            title="Search chats"
          >
            <Search size={16} />
          </button>
          <button
            className="icon-btn"
            onClick={onClose}
            title="Close sidebar"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>
      </div>

      {/* Main Scrollable Body */}
      <div className="sidebar-scroll-container">
        {/* Search Bar if toggled or query typed */}
        {(showSearch || searchQuery) && (
          <div className="sidebar-search" style={{ margin: '8px 12px' }}>
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        )}

        {/* ChatGPT Style Top Navigation Links */}
        <div className="chatgpt-nav-list">
          <button className="chatgpt-nav-item" onClick={onNewChat}>
            <SquarePen size={18} />
            <span>New chat</span>
          </button>

          <button
            className={`chatgpt-nav-item ${currentRoute === 'sop-reviewer' ? 'active' : ''}`}
            onClick={() => onNavigate && onNavigate('sop-reviewer')}
          >
            <FileText size={18} color="#818cf8" />
            <span>SOP Reviewer</span>
          </button>

          <button
            className={`chatgpt-nav-item ${currentRoute === 'scholarships' ? 'active' : ''}`}
            onClick={() => onNavigate && onNavigate('scholarships')}
          >
            <Award size={18} color="#f59e0b" />
            <span>Scholarships (100-pt)</span>
          </button>

          <button
            className={`chatgpt-nav-item ${currentRoute === 'universities' ? 'active' : ''}`}
            onClick={() => onNavigate && onNavigate('universities')}
          >
            <GraduationCap size={18} color="#10b981" />
            <span>Universities</span>
          </button>

          {showMoreTools ? (
            <>
              <button
                className={`chatgpt-nav-item ${currentRoute === 'deadlines' ? 'active' : ''}`}
                onClick={() => onNavigate && onNavigate('deadlines')}
              >
                <Calendar size={18} color="#fbbf24" />
                <span>Deadlines Planner</span>
              </button>
              <button
                className={`chatgpt-nav-item ${currentRoute === 'cost-calculator' ? 'active' : ''}`}
                onClick={() => onNavigate && onNavigate('cost-calculator')}
              >
                <DollarSign size={18} color="#34d399" />
                <span>Living Cost Calc</span>
              </button>
              <button
                className={`chatgpt-nav-item ${currentRoute === 'comparator' ? 'active' : ''}`}
                onClick={() => onNavigate && onNavigate('comparator')}
              >
                <Scale size={18} color="#38bdf8" />
                <span>Uni Comparator</span>
              </button>
              <button
                className={`chatgpt-nav-item ${currentRoute === 'exam-practice' ? 'active' : ''}`}
                onClick={() => onNavigate && onNavigate('exam-practice')}
              >
                <BookOpen size={18} color="#ec4899" />
                <span>Mock Quizzes</span>
              </button>
              <button
                className={`chatgpt-nav-item ${currentRoute === 'placements' ? 'active' : ''}`}
                onClick={() => onNavigate && onNavigate('placements')}
              >
                <Briefcase size={18} color="#6366f1" />
                <span>Placements & ROI</span>
              </button>
              <button
                className={`chatgpt-nav-item ${currentRoute === 'study-abroad' ? 'active' : ''}`}
                onClick={() => onNavigate && onNavigate('study-abroad')}
              >
                <Globe size={18} color="#06b6d4" />
                <span>Study Abroad Hub</span>
              </button>
            </>
          ) : (
            <button className="chatgpt-nav-item" onClick={() => setShowMoreTools(!showMoreTools)}>
              <MoreHorizontal size={18} />
              <span>More AI Tools</span>
            </button>
          )}
        </div>

        {/* ChatGPT Style "Pinned" Header & List */}
        {pinnedChats.length > 0 && (
          <>
            <div className="chatgpt-section-header">Pinned</div>
            <div className="chatgpt-recents-list">
              {pinnedChats.map(chat => renderChatItem(chat))}
            </div>
          </>
        )}

        {/* ChatGPT Style "Recents" Header with Chevron & Clear All Option */}
        <div className="chatgpt-section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Recents</span>
            <ChevronDown size={12} style={{ opacity: 0.6 }} />
          </div>

          {filteredChats.length > 0 && onClearAllChats && (
            <button
              onClick={onClearAllChats}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.72rem',
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: '4px',
                transition: 'color 0.15s ease'
              }}
              className="clear-all-btn"
              title="Clear all recent chats"
            >
              Clear all
            </button>
          )}
        </div>

        {/* ChatGPT Style Recent Chats List */}
        <div className="chatgpt-recents-list">
          {recentChats.length === 0 ? (
            <div style={{ padding: '8px 12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              No recent chats
            </div>
          ) : (
            recentChats.map(chat => renderChatItem(chat))
          )}
        </div>
      </div>

      {/* ChatGPT Style Bottom User Profile Card */}
      <div className="sidebar-footer">
        {currentUser ? (
          <div className="chatgpt-user-row" onClick={() => onNavigate && onNavigate('profile')}>
            <div className="chatgpt-avatar-circle">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} />
              ) : (
                <span>{(currentUser.name || currentUser.email || 'U').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="chatgpt-user-meta">
              <span className="chatgpt-user-name">{currentUser.name || 'Student'}</span>
              <span className="chatgpt-user-sub">Free Plan</span>
            </div>
            <button
              className="chatgpt-upgrade-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenSettings) onOpenSettings();
              }}
            >
              Settings
            </button>
          </div>
        ) : (
          <div className="chatgpt-user-row" onClick={onOpenLogin}>
            <div className="chatgpt-avatar-circle" style={{ background: '#818cf8', color: '#ffffff' }}>
              <span>U</span>
            </div>
            <div className="chatgpt-user-meta">
              <span className="chatgpt-user-name">Guest User</span>
              <span className="chatgpt-user-sub">Free Plan</span>
            </div>
            <button className="chatgpt-upgrade-btn">
              Sign In
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
