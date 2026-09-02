import { readJson, writeJson } from '../utils/storage.js';
import { getSupabaseClient } from '../config/supabase.js';

const USERS_FILE = 'users.json';

// Helper to safely get all users (from Supabase if configured, or local storage)
async function getUsers() {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (!error && Array.isArray(data)) return data;
    } catch (e) {
      console.warn('[Supabase] Error reading users from Supabase:', e.message);
    }
  }
  return await readJson(USERS_FILE, []);
}

// Helper to save users (to Supabase if configured, and local storage backup)
async function saveUsers(users) {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const sanitizedUsers = users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name || null,
        avatar: u.avatar || null,
        provider: u.provider || 'email',
        created_at: u.created_at || u.createdAt || new Date().toISOString()
      }));
      const { error } = await supabase.from('users').upsert(sanitizedUsers, { onConflict: 'id' });
      if (error) console.warn('[Supabase] Error upserting users:', error.message);
    } catch (e) {
      console.warn('[Supabase] Error syncing user to Supabase:', e.message);
    }
  }
  await writeJson(USERS_FILE, users);
}

/**
 * Handle Email/Password Login
 */
export async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const users = await getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = `token_${user.id}_${Date.now()}`;
    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
      provider: user.provider || 'email',
      token
    };

    return res.json({ success: true, user: userProfile, token });
  } catch (err) {
    console.error('[AuthController] Login Error:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
}

/**
 * Handle Email/Password Sign Up
 */
export async function handleSignup(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const users = await getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      avatar: null,
      provider: 'email',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await saveUsers(users);

    const token = `token_${newUser.id}_${Date.now()}`;
    const userProfile = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: null,
      provider: 'email',
      token
    };

    return res.status(201).json({ success: true, user: userProfile, token });
  } catch (err) {
    console.error('[AuthController] Signup Error:', err);
    return res.status(500).json({ error: 'Internal server error during signup.' });
  }
}

/**
 * Handle Google (Gmail) Sign-In via Supabase or Direct OAuth
 */
export async function handleGoogleAuth(req, res) {
  try {
    const { email, name, avatar, googleId, accessToken, code } = req.body;
    const supabase = getSupabaseClient();

    let userEmail = email;
    let userName = name;
    let userAvatar = avatar;
    let userId = googleId;

    // Verify token with Supabase if access_token provided from Supabase OAuth redirect
    if (supabase && accessToken) {
      try {
        const { data: { user: sbUser }, error } = await supabase.auth.getUser(accessToken);
        if (!error && sbUser) {
          userEmail = sbUser.email || userEmail;
          userName = sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || userName;
          userAvatar = sbUser.user_metadata?.avatar_url || userAvatar;
          userId = sbUser.id;
        }
      } catch (e) {
        console.warn('[Supabase Auth] Could not verify access_token via Supabase SDK:', e.message);
      }
    }

    userEmail = userEmail || `user_${Date.now()}@gmail.com`;
    userName = userName || (userEmail.includes('@') ? userEmail.split('@')[0].replace(/[._]/g, ' ') : 'Google User');

    const users = await getUsers();
    let user = users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());

    if (!user) {
      user = {
        id: userId || `usr_g_${Date.now()}`,
        name: userName,
        email: userEmail.toLowerCase(),
        avatar: userAvatar || null,
        provider: 'google',
        createdAt: new Date().toISOString()
      };
      users.push(user);
      await saveUsers(users);
    } else if (userAvatar && !user.avatar) {
      user.avatar = userAvatar;
      await saveUsers(users);
    }

    const token = accessToken || `token_google_${user.id}_${Date.now()}`;
    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || userAvatar || null,
      provider: 'google',
      token
    };

    return res.json({ success: true, user: userProfile, token });
  } catch (err) {
    console.error('[AuthController] Google Auth Error:', err);
    return res.status(500).json({ error: 'Internal server error during Google authentication.' });
  }
}

/**
 * Handle Apple ID Sign-In
 */
export async function handleAppleAuth(req, res) {
  try {
    const { email, name, appleId } = req.body;

    const userEmail = email || `user_${Date.now()}@privaterelay.appleid.com`;
    const userName = name || 'Apple User';

    const users = await getUsers();
    let user = users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());

    if (!user) {
      user = {
        id: `usr_apple_${appleId || Date.now()}`,
        name: userName,
        email: userEmail.toLowerCase(),
        avatar: null,
        provider: 'apple',
        createdAt: new Date().toISOString()
      };
      users.push(user);
      await saveUsers(users);
    }

    const token = `token_apple_${user.id}_${Date.now()}`;
    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: null,
      provider: 'apple',
      token
    };

    return res.json({ success: true, user: userProfile, token });
  } catch (err) {
    console.error('[AuthController] Apple Auth Error:', err);
    return res.status(500).json({ error: 'Internal server error during Apple authentication.' });
  }
}

/**
 * Get Google OAuth Login URL (Supabase Google Auth Endpoint)
 */
export async function getGoogleAuthUrl(req, res) {
  const supabase = getSupabaseClient();
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const redirectUri = req.query.redirect_uri || `${req.protocol}://${req.get('host')}/login`;

  // 1. Try SDK OAuth URL from Supabase if configured
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUri }
      });
      if (!error && data?.url) {
        return res.json({ success: true, url: data.url, provider: 'supabase', clientIdConfigured: true });
      }
    } catch (e) {
      console.warn('[Supabase Auth] signInWithOAuth notice:', e.message);
    }
  }

  // 2. Direct Supabase Google Auth URL
  const supabaseUrl = process.env.SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.includes('your_supabase')) {
    const url = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUri)}`;
    return res.json({ success: true, url, provider: 'supabase', clientIdConfigured: true });
  }

  // 3. Fallback Google Accounts OAuth URL
  let url = '';
  if (clientId) {
    url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&prompt=select_account`;
  } else {
    url = `https://accounts.google.com/ServiceLogin`;
  }

  return res.json({ success: true, url, provider: 'google', clientIdConfigured: !!clientId });
}

/**
 * Get Apple ID OAuth Login URL
 */
export async function getAppleAuthUrl(req, res) {
  const clientId = process.env.APPLE_CLIENT_ID || '';
  const redirectUri = req.query.redirect_uri || `${req.protocol}://${req.get('host')}/login`;

  let url = '';
  if (clientId) {
    url = `https://appleid.apple.com/auth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code%20id_token&scope=name%20email&response_mode=form_post`;
  } else {
    url = `https://appleid.apple.com/sign-in`;
  }

  return res.json({ success: true, url, clientIdConfigured: !!clientId });
}


/**
 * Get current authenticated user profile
 */
export async function handleGetMe(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ authenticated: false, user: null });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    return res.json({ authenticated: true, token });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to verify session' });
  }
}

