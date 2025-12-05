import React, { useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

function AuthCallback() {
  const { user, loading } = useAuth();

  useEffect(() => {
    supabase?.auth.getSession();
  }, []);

  useEffect(() => {
    if (!loading && user) {
      const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
      const target = `${base || ''}/#/auth/callback`;
      window.location.replace(target);
    }
  }, [user, loading]);

  return (
    <div className="page-container">
      <h1>Completing login…</h1>
      <p>Finishing Supabase sign-in…</p>
    </div>
  );
}

export default AuthCallback;
