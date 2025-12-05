import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      navigate('/campaign', { replace: true });
    };

    const checkSession = async () => {
      if (!supabase) {
        finish();
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        finish();
      }
    };

    const subscription = supabase?.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        finish();
      }
    });

    checkSession();

    return () => {
      cancelled = true;
      subscription?.data?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <div className="page-container">
      <h1>Completing login…</h1>
      <p>
        Returning to Azterra. You can close this tab if it does not close automatically.
      </p>
    </div>
  );
}

export default AuthCallback;
