import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

const supabaseClient =
  supabaseUrl && supabaseServiceRole
    ? createClient(supabaseUrl, supabaseServiceRole, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

export async function requireSupabaseAuth(req, res, next) {
  if (!supabaseClient) {
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
  } = await supabaseClient.auth.getUser(token);

  if (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = user;
  return next();
}
