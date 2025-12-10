import { createClient } from '@supabase/supabase-js';

let supabaseClient;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;
  if (!supabaseUrl || !supabaseServiceRole) return null;
  supabaseClient = createClient(supabaseUrl, supabaseServiceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return supabaseClient;
}

export async function requireSupabaseAuth(req, res, next) {
  const client = getSupabaseClient();
  if (!client) {
    return res
      .status(500)
      .json({ error: 'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE.' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '') || '';
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  const {
    data: { user },
    error,
  } = await client.auth.getUser(token);

  if (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = user;
  return next();
}
