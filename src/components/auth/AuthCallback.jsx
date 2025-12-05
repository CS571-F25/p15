import React, { useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

function AuthCallback() {
  const fallbackUrl = () => {
    if (typeof window === 'undefined') return '/';
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
    return `${window.location.origin}${base}/#/`;
  };

  useEffect(() => {
    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.postMessage({ type: 'supabase-auth-complete' }, window.location.origin);
        } catch {
          /* ignore cross-origin failures */
        }
        window.close();
      } else {
        window.location.replace(fallbackUrl());
      }
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
