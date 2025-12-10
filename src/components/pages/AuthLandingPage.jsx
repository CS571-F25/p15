import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AuthLandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/campaign', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="page-container">
      <h1>Completing login…</h1>
      <p>Hang tight while we finish signing you in.</p>
    </div>
  );
}

export default AuthLandingPage;
