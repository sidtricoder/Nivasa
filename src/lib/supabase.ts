import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fwdkzknfetdvmsawqaom.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_tKiN7FwOCZMqwFw9_P9cqw_OFcySrwJ';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper function to get session
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Generate a unique session ID for anonymous users
export const getOrCreateSessionId = (): string => {
  const key = 'roomgi_session_id';
  let sessionId = localStorage.getItem(key);
  if (!sessionId) {
    sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(key, sessionId);
  }
  return sessionId;
};
