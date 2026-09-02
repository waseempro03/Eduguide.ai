import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import dotenv from 'dotenv';
dotenv.config();

let supabaseInstance = null;

export function isSupabaseConfigured() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    url &&
    key &&
    url.trim().length > 10 &&
    !url.includes('your_supabase') &&
    key.trim().length > 10 &&
    !key.includes('your_supabase')
  );
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    const url = process.env.SUPABASE_URL.trim();
    const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY).trim();
    supabaseInstance = createClient(url, key, {
      auth: { persistSession: false },
      realtime: { transport: ws }
    });
  }
  return supabaseInstance;
}
