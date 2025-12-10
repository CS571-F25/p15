import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

function AuthCallback() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      window.location.replace('/');
    }
  }, [user, loading]);

  return (
    <div className="page-container">
      <h1>Completing login…</h1>
      <p>Finishing OAuth sign-in…</p>
    </div>
  );
}

export default AuthCallback;
