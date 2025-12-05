import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        autoRefreshToken: true,
      },
    })
  : null;

export function getSupabaseRedirectUrl() {
  if (import.meta.env.VITE_SUPABASE_REDIRECT_URL) {
    return import.meta.env.VITE_SUPABASE_REDIRECT_URL;
  }
  if (typeof window === 'undefined') return '';
  // Default to hash-based routing so the callback works in dev and static hosting.
  const origin = window.location.origin;
  return `${origin}/#/auth/callback`;
}
