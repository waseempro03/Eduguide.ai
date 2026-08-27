import { readJson, writeJson } from '../utils/storage.js';

const USERS_FILE = 'users.json';

// Helper to safely get all users
async function getUsers() {
  return await readJson(USERS_FILE, []);
}

// Helper to save users
async function saveUsers(users) {
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
 * Handle Google (Gmail) Sign-In
 */
export async function handleGoogleAuth(req, res) {
  try {
    const { email, name, avatar, googleId } = req.body;

    const userEmail = email || `user_${Date.now()}@gmail.com`;
    const userName = name || 'Google User';

    const users = await getUsers();
    let user = users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());

    if (!user) {
      user = {
        id: `usr_g_${googleId || Date.now()}`,
        name: userName,
        email: userEmail.toLowerCase(),
        avatar: avatar || null,
        provider: 'google',
        createdAt: new Date().toISOString()
      };
      users.push(user);
      await saveUsers(users);
    }

    const token = `token_google_${user.id}_${Date.now()}`;
    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || avatar || null,
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
