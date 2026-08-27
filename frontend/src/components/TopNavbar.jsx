import React from 'react';
import {
  MessageSquare,
  Award,
  GraduationCap,
  FileText,
  Calendar,
  DollarSign,
  Scale,
  BookOpen,
  Briefcase,
  Globe,
  User,
  ShieldAlert,
  Moon,
  Sun,
  LogIn,
  LogOut,
  Sparkles
} from 'lucide-react';

export default function TopNavbar({
  currentRoute,
  onNavigate,
  currentUser,
  onLogout,
  theme,
  onThemeChange
}) {
  const navItems = [
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
    { id: 'scholarships', label: 'Scholarships', icon: Award },
    { id: 'universities', label: 'Universities', icon: GraduationCap },
    { id: 'sop-reviewer', label: 'SOP Reviewer', icon: FileText, isNew: true },
    { id: 'deadlines', label: 'Deadlines', icon: Calendar, isNew: true },
    { id: 'cost-calculator', label: 'Cost Calculator', icon: DollarSign, isNew: true },
    { id: 'comparator', label: 'Comparator', icon: Scale, isNew: true },
    { id: 'exam-practice', label: 'Mock Quizzes', icon: BookOpen, isNew: true },
    { id: 'placements', label: 'Placements', icon: Briefcase },
    { id: 'study-abroad', label: 'Study Abroad', icon: Globe },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <header className="top-navbar-container">
      {/* Brand / Logo */}
      <div className="top-nav-brand" onClick={() => onNavigate('chat')} title="EduGuide AI Home">
        <span className="brand-star">✦</span>
        <span className="brand-text">EduGuide AI</span>
      </div>

      {/* Center Scrollable Nav Tabs */}
      <nav className="top-nav-tabs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;

          return (
            <button
              key={item.id}
              className={`top-nav-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={14} />
              <span>{item.label}</span>
              {item.isNew && <span className="nav-new-badge">NEW</span>}
            </button>
          );
        })}
      </nav>

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
