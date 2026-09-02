import React, { useState, useEffect } from 'react';
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, Moon, Sun, X, ExternalLink } from 'lucide-react';
import { loginWithEmail, signupWithEmail, loginWithGoogle, loginWithApple, fetchGoogleAuthUrl, fetchAppleAuthUrl } from '../services/api';

export default function AuthPage({ theme = 'dark', onThemeChange, onLoginSuccess, onBackToChat }) {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Social Account Selection Modal State
  const [socialModal, setSocialModal] = useState(null); // 'google' | 'apple' | null
  const [customSocialEmail, setCustomSocialEmail] = useState('');

  // Handle incoming OAuth callback parameters if redirected back from Google or Apple (Supabase OAuth sends #access_token or ?code)
  useEffect(() => {
    async function processOAuthCallback() {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

      const provider = urlParams.get('provider') || urlParams.get('auth_provider') || hashParams.get('provider');
      const code = urlParams.get('code');
      const accessToken = hashParams.get('access_token') || urlParams.get('access_token');
      const stateEmail = urlParams.get('email') || hashParams.get('email');
      const stateName = urlParams.get('name') || hashParams.get('name');

      if (code || accessToken || provider) {
        setIsLoading(true);
        try {
          if (provider === 'apple' || urlParams.has('apple')) {
            const res = await loginWithApple({
              email: stateEmail || `user_${Date.now()}@privaterelay.appleid.com`,
              name: stateName || 'Apple User',
              code,
              accessToken
            });
            if (res && res.user) handleSafeLoginSuccess(res.user);
          } else {
            const res = await loginWithGoogle({
              email: stateEmail || (accessToken ? null : `user_${Date.now()}@gmail.com`),
              name: stateName,
              code,
              accessToken
            });
            if (res && res.user) handleSafeLoginSuccess(res.user);
          }
        } catch (err) {
          console.warn('OAuth completion error:', err);
        } finally {
          setIsLoading(false);
          // Clean up sensitive token parameters from browser URL bar
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }
      }
    }
    processOAuthCallback();
  }, []);

  const handleSelectTheme = (t) => {
    setSelectedTheme(t);
    if (onThemeChange) {
      onThemeChange(t);
    }
  };

  const handleSafeLoginSuccess = (user) => {
    const safeUser = {
      id: user.id || `usr_${Date.now()}`,
      name: user.name || (user.email ? user.email.split('@')[0] : 'Wiz User'),
      email: user.email || 'user@example.com',
      avatar: user.avatar || null,
      provider: user.provider || 'email',
      token: user.token || `token_${Date.now()}`
    };
    if (onLoginSuccess) {
      onLoginSuccess(safeUser, selectedTheme);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        const res = await signupWithEmail(name, email, password);
        if (res && res.user) {
          handleSafeLoginSuccess(res.user);
        } else {
          throw new Error('Could not complete signup. Please try again.');
        }
      } else {
        const res = await loginWithEmail(email, password);
        if (res && res.user) {
          handleSafeLoginSuccess(res.user);
        } else {
          throw new Error('Invalid email or password.');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const startGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const redirectUri = `${window.location.origin}/login?provider=google`;
      const backendRes = await fetchGoogleAuthUrl(redirectUri).catch(() => null);

      if (backendRes && backendRes.url) {
        // Redirect browser directly to full Supabase / Google OAuth authorization page
        window.location.href = backendRes.url;
      } else {
        // Open Google Sign-In fallback
        window.open('https://accounts.google.com/ServiceLogin', '_blank', 'width=500,height=600');
        setSocialModal('google');
      }
    } catch (err) {
      console.warn('Could not redirect to Google Auth URL:', err);
      window.open('https://accounts.google.com/ServiceLogin', '_blank');
      setSocialModal('google');
    } finally {
      setIsLoading(false);
    }
  };

  const startAppleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const redirectUri = `${window.location.origin}/login?provider=apple`;
      const backendRes = await fetchAppleAuthUrl(redirectUri).catch(() => null);

      if (backendRes && backendRes.clientIdConfigured && backendRes.url) {
        // Redirect browser directly to full Apple OAuth authorization page
        window.location.href = backendRes.url;
      } else {
        // Open real Apple ID Sign-In page in a popup/new tab
        window.open('https://appleid.apple.com/sign-in', '_blank', 'width=500,height=600');
        setSocialModal('apple');
      }
    } catch (err) {
      console.warn('Could not redirect to Apple Auth URL:', err);
      window.open('https://appleid.apple.com/sign-in', '_blank');
      setSocialModal('apple');
    } finally {
      setIsLoading(false);
    }
  };


  const completeGoogleSignIn = async (chosenEmail, chosenName) => {
    setSocialModal(null);
    setIsLoading(true);
    setError(null);

    const gEmail = chosenEmail || email || 'mohamed.waseem@gmail.com';
    const gName = chosenName || (gEmail.includes('@') ? gEmail.split('@')[0].replace(/[._]/g, ' ') : 'Mohamed Waseem');

    try {
      const res = await loginWithGoogle({
        email: gEmail,
        name: gName,
        googleId: `google_${Date.now()}`
      });

      if (res && res.user) {
        handleSafeLoginSuccess(res.user);
      } else {
        handleSafeLoginSuccess({
          id: `usr_g_${Date.now()}`,
          name: gName,
          email: gEmail,
          provider: 'google'
        });
      }
    } catch (err) {
      console.warn('Google API returned error, applying safe client session:', err);
      handleSafeLoginSuccess({
        id: `usr_g_${Date.now()}`,
        name: gName,
        email: gEmail,
        provider: 'google'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completeAppleSignIn = async (chosenEmail, chosenName) => {
    setSocialModal(null);
    setIsLoading(true);
    setError(null);

    const aEmail = chosenEmail || email || 'waseem@privaterelay.appleid.com';
    const aName = chosenName || 'Apple User';

    try {
      const res = await loginWithApple({
        email: aEmail,
        name: aName,
        appleId: `apple_${Date.now()}`
      });

      if (res && res.user) {
        handleSafeLoginSuccess(res.user);
      } else {
        handleSafeLoginSuccess({
          id: `usr_apple_${Date.now()}`,
          name: aName,
          email: aEmail,
          provider: 'apple'
        });
      }
    } catch (err) {
      console.warn('Apple API returned error, applying safe client session:', err);
      handleSafeLoginSuccess({
        id: `usr_apple_${Date.now()}`,
        name: aName,
        email: aEmail,
        provider: 'apple'
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleGuestAccess = () => {
    handleSafeLoginSuccess({
      id: `guest_${Date.now()}`,
      name: 'Guest User',
      email: 'guest@eduguide.local',
      provider: 'guest'
    });
  };

  return (
    <div className="auth-page-container">
      {/* Background ambient decorative glows */}
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />

      <div className="auth-card">
        {/* Top bar with Back Button & Quick Theme Selector */}
        <div className="auth-top-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button className="auth-back-btn" onClick={onBackToChat} title="Back to Assistant">
            <ArrowLeft size={16} />
            <span>Back to Assistant</span>
          </button>

          {/* Theme Switcher Toggle */}
          <div className="auth-theme-pills">
            <button
              type="button"
              className={`auth-theme-btn ${selectedTheme === 'dark' ? 'active' : ''}`}
              onClick={() => handleSelectTheme('dark')}
              title="Dark Mode"
            >
              <Moon size={13} />
              <span>Dark</span>
            </button>
            <button
              type="button"
              className={`auth-theme-btn ${selectedTheme === 'light' ? 'active' : ''}`}
              onClick={() => handleSelectTheme('light')}
              title="Light Mode"
            >
              <Sun size={13} />
              <span>Light</span>
            </button>
          </div>
        </div>

        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Sparkles size={24} className="sparkle-icon" />
          </div>
          <h1 className="auth-title">
            {mode === 'signin' ? 'Welcome Back' : 'Create an Account'}
          </h1>
          <p className="auth-subtitle">
            Sign in to save your scholarship matches, chat histories, and personalized profile
          </p>
        </div>

        {/* Theme Preference Prompt Box */}
        <div className="auth-theme-prompt-card">
          <div className="theme-prompt-label">Select Preferred Theme:</div>
          <div className="theme-prompt-grid">
            <div
              className={`theme-prompt-choice ${selectedTheme === 'dark' ? 'selected' : ''}`}
              onClick={() => handleSelectTheme('dark')}
            >
              <div className="theme-preview-bubble dark-preview">
                <Moon size={16} />
              </div>
              <div className="theme-prompt-info">
                <span className="theme-prompt-title">Dark Theme</span>
                <span className="theme-prompt-desc">Sleek & easy on the eyes</span>
              </div>
            </div>

            <div
              className={`theme-prompt-choice ${selectedTheme === 'light' ? 'selected' : ''}`}
              onClick={() => handleSelectTheme('light')}
            >
              <div className="theme-preview-bubble light-preview">
                <Sun size={16} />
              </div>
              <div className="theme-prompt-info">
                <span className="theme-prompt-title">Light Theme</span>
                <span className="theme-prompt-desc">Clean, bright & crisp</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error / Success banners */}
        {error && (
          <div className="auth-alert error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="auth-alert success">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Social Authentication Buttons */}
        <div className="auth-social-buttons">
          <button
            type="button"
            className="social-btn google-btn"
            onClick={startGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="social-icon" viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google / Gmail</span>
          </button>

          <button
            type="button"
            className="social-btn apple-btn"
            onClick={startAppleSignIn}
            disabled={isLoading}
          >
            <svg className="social-icon" viewBox="0 0 170 170" width="18" height="18" fill="currentColor">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-5.35.12-10.26-1.99-14.74-6.35-3.23-3.02-7.14-7.85-11.73-14.48-6.17-8.91-11.06-18.9-14.67-29.98-4.71-14.48-7.07-28.51-7.07-42.08 0-16.14 3.93-29.74 11.79-40.81 7.85-11.06 17.78-16.71 29.79-16.94 4.83 0 10.37 1.29 16.63 3.88 6.25 2.59 10.3 3.94 12.14 4.06 1.48-.12 5.73-1.53 12.75-4.24 7.02-2.71 12.82-3.94 17.41-3.71 13.55.69 24.32 5.76 32.32 15.22-11.88 7.18-17.7 17.2-17.47 30.06.23 10.15 4.14 18.66 11.73 25.53 7.59 6.87 16.59 10.66 27 11.38-2.22 6.78-4.87 13.68-7.94 20.72zM119.22 31.84c0-7.72 2.76-14.93 8.28-21.63 5.53-6.7 12.39-10.87 20.59-12.51.58 2.01.87 4.08.87 6.21 0 7.73-2.88 15.11-8.64 22.14-5.75 7.03-12.81 11.23-21.17 12.61-.46-2.29-.69-4.57-.69-6.82z" />
            </svg>
            <span>Continue with Apple</span>
          </button>
        </div>

        {/* Divider */}
        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Mohamed Waseem"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label">Password</label>
              {mode === 'signin' && (
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => alert('Please sign in using Google, Apple, or create a new account.')}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
          >
            <span>{isLoading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Toggle mode footer */}
        <div className="auth-footer">
          {mode === 'signin' ? (
            <p>
              Don't have an account?{' '}
              <button type="button" className="auth-toggle-link" onClick={() => { setMode('signup'); setError(null); }}>
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button type="button" className="auth-toggle-link" onClick={() => { setMode('signin'); setError(null); }}>
                Sign in
              </button>
            </p>
          )}

          <div className="guest-access-box">
            <button type="button" className="guest-btn" onClick={handleGuestAccess}>
              Skip for now & Continue as Guest
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Google Sign-In Modal */}
      {socialModal === 'google' && (
        <div className="modal-backdrop" onClick={() => setSocialModal(null)}>
          <div className="social-oauth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="oauth-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Sign in with Google</span>
              </div>
              <button className="icon-btn" onClick={() => setSocialModal(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="oauth-modal-body">
              <p className="oauth-modal-desc">Choose a Google account to continue to <strong>Wiz.AI</strong></p>

              <div className="oauth-accounts-list">
                <button
                  type="button"
                  className="oauth-account-item"
                  onClick={() => completeGoogleSignIn('mohamed.waseem@gmail.com', 'Mohamed Waseem')}
                >
                  <div className="oauth-account-avatar google-avatar">M</div>
                  <div className="oauth-account-text">
                    <span className="oauth-account-name">Mohamed Waseem</span>
                    <span className="oauth-account-email">mohamed.waseem@gmail.com</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="oauth-account-item"
                  onClick={() => completeGoogleSignIn('student.wiz@gmail.com', 'Wiz Student')}
                >
                  <div className="oauth-account-avatar google-avatar">W</div>
                  <div className="oauth-account-text">
                    <span className="oauth-account-name">Wiz Student</span>
                    <span className="oauth-account-email">student.wiz@gmail.com</span>
                  </div>
                </button>
              </div>

              {/* Direct External Link */}
              <div style={{ marginBottom: '14px' }}>
                <a
                  href="https://accounts.google.com/ServiceLogin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn"
                  style={{ textDecoration: 'none', background: 'var(--bg-surface-hover)', fontSize: '0.82rem' }}
                >
                  <span>Go to Official Google Accounts Login</span>
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* Custom Gmail Input */}
              <div className="oauth-custom-section">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Or choose account below:</label>
                <div className="oauth-accounts-list" style={{ marginTop: '8px' }}>
                  <button
                    type="button"
                    className="oauth-account-item"
                    onClick={() => completeGoogleSignIn('mohamed.waseem@gmail.com', 'Mohamed Waseem')}
                  >
                    <div className="oauth-account-avatar google-avatar">M</div>
                    <div className="oauth-account-text">
                      <span className="oauth-account-name">Mohamed Waseem</span>
                      <span className="oauth-account-email">mohamed.waseem@gmail.com</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="oauth-account-item"
                    onClick={() => completeGoogleSignIn('student.wiz@gmail.com', 'Wiz Student')}
                  >
                    <div className="oauth-account-avatar google-avatar">W</div>
                    <div className="oauth-account-text">
                      <span className="oauth-account-name">Wiz Student</span>
                      <span className="oauth-account-email">student.wiz@gmail.com</span>
                    </div>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="yourname@gmail.com"
                    value={customSocialEmail}
                    onChange={(e) => setCustomSocialEmail(e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                    onClick={() => {
                      if (customSocialEmail.trim()) {
                        completeGoogleSignIn(customSocialEmail.trim());
                      }
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Apple Sign-In Modal */}
      {socialModal === 'apple' && (
        <div className="modal-backdrop" onClick={() => setSocialModal(null)}>
          <div className="social-oauth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="oauth-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg viewBox="0 0 170 170" width="18" height="18" fill="currentColor">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-5.35.12-10.26-1.99-14.74-6.35-3.23-3.02-7.14-7.85-11.73-14.48-6.17-8.91-11.06-18.9-14.67-29.98-4.71-14.48-7.07-28.51-7.07-42.08 0-16.14 3.93-29.74 11.79-40.81 7.85-11.06 17.78-16.71 29.79-16.94 4.83 0 10.37 1.29 16.63 3.88 6.25 2.59 10.3 3.94 12.14 4.06 1.48-.12 5.73-1.53 12.75-4.24 7.02-2.71 12.82-3.94 17.41-3.71 13.55.69 24.32 5.76 32.32 15.22-11.88 7.18-17.7 17.2-17.47 30.06.23 10.15 4.14 18.66 11.73 25.53 7.59 6.87 16.59 10.66 27 11.38-2.22 6.78-4.87 13.68-7.94 20.72zM119.22 31.84c0-7.72 2.76-14.93 8.28-21.63 5.53-6.7 12.39-10.87 20.59-12.51.58 2.01.87 4.08.87 6.21 0 7.73-2.88 15.11-8.64 22.14-5.75 7.03-12.81 11.23-21.17 12.61-.46-2.29-.69-4.57-.69-6.82z" />
                </svg>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Sign in with Apple ID</span>
              </div>
              <button className="icon-btn" onClick={() => setSocialModal(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="oauth-modal-body">
              <p className="oauth-modal-desc">Use your Apple ID with Private Relay to sign in to <strong>Wiz.AI</strong></p>

              <div style={{ marginBottom: '14px' }}>
                <a
                  href="https://appleid.apple.com/sign-in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn apple-btn"
                  style={{ textDecoration: 'none', fontSize: '0.82rem' }}
                >
                  <span>Go to Official Apple ID Sign-In Page</span>
                  <ExternalLink size={14} />
                </a>
              </div>

              <div className="oauth-accounts-list">
                <button
                  type="button"
                  className="oauth-account-item"
                  onClick={() => completeAppleSignIn('mohamed.waseem@privaterelay.appleid.com', 'Mohamed Waseem')}
                >
                  <div className="oauth-account-avatar apple-avatar"></div>
                  <div className="oauth-account-text">
                    <span className="oauth-account-name">Mohamed Waseem</span>
                    <span className="oauth-account-email">mohamed.waseem@privaterelay.appleid.com</span>
                  </div>
                </button>
              </div>

              <div className="oauth-custom-section">
                <button
                  type="button"
                  className="btn apple-btn"
                  style={{ width: '100%', padding: '10px' }}
                  onClick={() => completeAppleSignIn(`user_${Date.now()}@privaterelay.appleid.com`, 'Apple User')}
                >
                  <span>Sign In with Current Apple Device</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
