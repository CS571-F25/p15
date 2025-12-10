import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleOAuthSignIn = async () => {
    setError('');
    if (submitting) return;
    setSubmitting(true);
    try {
      await login();
    } catch (err) {
      setError(err?.message || 'Unable to start login.');
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-modal__content auth-page__content">
        <header className="auth-modal__header">
          <h2>Login</h2>
        </header>
        <div className="auth-modal__form">
          <p className="auth-modal__note">
            You&apos;ll be redirected to Supabase OAuth (e.g. GitHub) to sign in securely.
          </p>
          <button
            type="button"
            className="auth-modal__google"
            onClick={handleOAuthSignIn}
            disabled={submitting}
          >
            {submitting ? 'Opening sign-in...' : 'Continue with OAuth'}
          </button>
          {error && <p className="auth-modal__error">{error}</p>}
        </div>
        <p className="auth-modal__note">
          Note: Editors must be approved by an admin before autosave is enabled.
        </p>
        <div className="auth-modal__switch">
          <span>New here?</span>
          <Link to="/signup" className="auth-modal__link">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
