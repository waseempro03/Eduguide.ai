import React, { useState, useEffect, Component } from 'react';
import ChatPage from './pages/ChatPage';
import ScholarshipsPage from './pages/ScholarshipsPage';
import UniversitiesPage from './pages/UniversitiesPage';
import SopReviewerPage from './pages/SopReviewerPage';
import DeadlinesPlannerPage from './pages/DeadlinesPlannerPage';
import LivingCostCalculatorPage from './pages/LivingCostCalculatorPage';
import UniversityComparatorPage from './pages/UniversityComparatorPage';
import ExamPracticePage from './pages/ExamPracticePage';
import PlacementsPage from './pages/PlacementsPage';
import StudyAbroadPage from './pages/StudyAbroadPage';
import ExamsPage from './pages/ExamsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';
import TopNavbar from './components/TopNavbar';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import AboutModal from './components/AboutModal';

const AUTH_STORAGE_KEY = 'eduguide_user_auth';
const THEME_STORAGE_KEY = 'eduguide_theme';
const SESSIONS_STORAGE_KEY = 'eduguide_chat_sessions';
const ACTIVE_SESSION_KEY = 'eduguide_active_session_id';

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[AppErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    this.setState({ hasError: false, error: null });
    window.location.href = window.location.origin;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#171717',
          color: '#f3f4f6',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'Inter, -apple-system, sans-serif'
        }}>
          <div style={{ fontSize: '2.2rem', marginBottom: '12px' }}>✦</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '8px' }}>EduGuide AI — Session Restored</h2>
          <p style={{ color: '#a3a3a3', maxWidth: '460px', fontSize: '0.88rem', marginBottom: '16px', lineHeight: 1.5 }}>
            A temporary display issue occurred. Click the button below to resume chatting immediately.
          </p>

          {this.state.error && (
            <pre style={{
              background: '#242424',
              color: '#ef4444',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              maxWidth: '600px',
              width: '100%',
              textAlign: 'left',
              overflowX: 'auto',
              marginBottom: '20px',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              {this.state.error.toString()}
              {'\n'}
              {this.state.error.stack}
            </pre>
          )}

          <button
            onClick={this.handleReset}
            style={{
              padding: '10px 24px',
              backgroundColor: '#818cf8',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Reset & Return to Assistant
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored) return stored;
    } catch (e) {}
    return 'dark';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          const userObj = parsed.user || parsed;
          if (userObj && (userObj.name || userObj.email || userObj.id)) {
            return {
              id: userObj.id || `usr_${Date.now()}`,
              name: userObj.name || (userObj.email ? userObj.email.split('@')[0] : 'User'),
              email: userObj.email || '',
              avatar: userObj.avatar || null,
              provider: userObj.provider || 'email',
              token: userObj.token || null
            };
          }
        }
      }
    } catch (e) {
      console.error('Failed to load user auth:', e);
    }
    return null;
  });

  const [sessions, setSessions] = useState(() => {
    try {
      const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(s => ({
            id: s.id || `session_${Date.now()}`,
            title: s.title || 'New chat',
            messages: Array.isArray(s.messages) ? s.messages : []
          }));
        }
      }
    } catch (e) {}
    const initialId = `session_${Date.now()}`;
    return [{ id: initialId, title: 'New chat', messages: [] }];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (stored) return stored;
    } catch (e) {}
    return (Array.isArray(sessions) && sessions[0]?.id) || `session_${Date.now()}`;
  });

  const [currentRoute, setCurrentRoute] = useState(() => {
    const path = window.location.pathname.replace(/^\//, '');
    const knownRoutes = [
      'chat', 'scholarships', 'universities', 'sop-reviewer', 'deadlines',
      'cost-calculator', 'comparator', 'exam-practice', 'placements',
      'study-abroad', 'exams', 'profile', 'admin', 'login', 'auth'
    ];
    if (path === 'login' || path === 'auth') return 'login';
    if (knownRoutes.includes(path)) return path;
    return 'chat';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // Apply theme to document body & html
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {}

    if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, [theme]);

  // Persist sessions
  useEffect(() => {
    try {
      if (Array.isArray(sessions)) {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
        localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
      }
    } catch (e) {}
  }, [sessions, activeSessionId]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const navigateTo = (route) => {
    setCurrentRoute(route);
    const newPath = route === 'chat' ? '/' : `/${route}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '');
      const knownRoutes = [
        'chat', 'scholarships', 'universities', 'sop-reviewer', 'deadlines',
        'cost-calculator', 'comparator', 'exam-practice', 'placements',
        'study-abroad', 'exams', 'profile', 'admin', 'login', 'auth'
      ];
      if (path === 'login' || path === 'auth') setCurrentRoute('login');
      else if (knownRoutes.includes(path)) setCurrentRoute(path);
      else setCurrentRoute('chat');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNewChat = () => {
    const newId = `session_${Date.now()}`;
    const newSession = { id: newId, title: 'New chat', messages: [] };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    navigateTo('chat');
  };

  const handleDeleteChat = (sessionId) => {
    const remaining = sessions.filter(s => s.id !== sessionId);
    if (remaining.length === 0) {
      const freshId = `session_${Date.now()}`;
      setSessions([{ id: freshId, title: 'New chat', messages: [] }]);
      setActiveSessionId(freshId);
    } else {
      setSessions(remaining);
      if (activeSessionId === sessionId) {
        setActiveSessionId(remaining[0].id);
      }
    }
  };

  const handleLoginSuccess = (user, selectedTheme = null) => {
    if (selectedTheme) {
      handleThemeChange(selectedTheme);
    }
    const safeUser = {
      id: user.id || `usr_${Date.now()}`,
      name: user.name || (user.email ? user.email.split('@')[0] : 'User'),
      email: user.email || '',
      avatar: user.avatar || null,
      provider: user.provider || 'email',
      token: user.token || null
    };
    setCurrentUser(safeUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(safeUser));
    } catch (e) {}
    navigateTo('chat');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {}
  };

  const isMainApp = currentRoute !== 'admin' && currentRoute !== 'login';
  const isHubView = currentRoute !== 'chat' && isMainApp;

  return (
    <AppErrorBoundary>
      <div className="app-container">
        {/* Persistent Collapsible Sidebar for Main Application Views */}
        {isMainApp && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            chats={sessions}
            activeChatId={activeSessionId}
            onSelectChat={(id) => {
              setActiveSessionId(id);
              navigateTo('chat');
            }}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            currentUser={currentUser}
            onNavigate={navigateTo}
            onOpenLogin={() => navigateTo('login')}
            onLogout={handleLogout}
            onOpenAdmin={() => navigateTo('admin')}
            onOpenSettings={() => setShowSettings(true)}
            onOpenAbout={() => setShowAbout(true)}
          />
        )}

        {/* Main Content Area */}
        <div className="app-content-wrapper">
          {/* Top Navbar when navigating Hub & Tool Views */}
          {isHubView && (
            <TopNavbar
              currentRoute={currentRoute}
              onNavigate={navigateTo}
              currentUser={currentUser}
              onLogout={handleLogout}
              theme={theme}
              onThemeChange={handleThemeChange}
            />
          )}

          <main className={`app-main-content ${isHubView ? 'with-top-nav' : ''}`}>
            {currentRoute === 'chat' && (
              <ChatPage
                onNavigate={navigateTo}
                currentUser={currentUser}
                onLogout={handleLogout}
                theme={theme}
                onThemeChange={handleThemeChange}
                sessions={sessions}
                setSessions={setSessions}
                activeSessionId={activeSessionId}
                setActiveSessionId={setActiveSessionId}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
              />
            )}

            {currentRoute === 'scholarships' && (
              <ScholarshipsPage onNavigate={navigateTo} />
            )}

            {currentRoute === 'universities' && (
              <UniversitiesPage onNavigate={navigateTo} />
            )}

            {currentRoute === 'sop-reviewer' && (
              <SopReviewerPage onNavigate={navigateTo} />
            )}

            {currentRoute === 'deadlines' && (
              <DeadlinesPlannerPage onNavigate={navigateTo} />
            )}

            {currentRoute === 'cost-calculator' && (
              <LivingCostCalculatorPage onNavigate={navigateTo} />
            )}

            {currentRoute === 'comparator' && (
              <UniversityComparatorPage onNavigate={navigateTo} />
            )}

            {currentRoute === 'exam-practice' && (
              <ExamPracticePage onNavigate={navigateTo} />
            )}

            {currentRoute === 'placements' && (
              <PlacementsPage onNavigate={navigateTo} />
            )}

            {currentRoute === 'study-abroad' && (
              <StudyAbroadPage onNavigate={navigateTo} />
            )}

            {currentRoute === 'exams' && (
              <ExamsPage onNavigate={navigateTo} />
            )}

            {currentRoute === 'profile' && (
              <ProfilePage onNavigate={navigateTo} />
            )}

            {currentRoute === 'admin' && (
              <AdminPage
                onBackToChat={() => navigateTo('chat')}
                currentUser={currentUser}
                theme={theme}
                onThemeChange={handleThemeChange}
              />
            )}

            {currentRoute === 'login' && (
              <AuthPage
                theme={theme}
                onThemeChange={handleThemeChange}
                onLoginSuccess={handleLoginSuccess}
                onBackToChat={() => navigateTo('chat')}
              />
            )}
          </main>
        </div>

        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          theme={theme}
          onThemeChange={handleThemeChange}
        />
        <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      </div>
    </AppErrorBoundary>
  );
}
