import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function SignupPage() {
  const navigate = useNavigate();
  const { user, signup } = useAuth();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSignUp = async () => {
    setError('');
    if (submitting) return;
    setSubmitting(true);
    try {
      await signup();
    } catch (err) {
      setError(err?.message || 'Unable to start signup.');
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-modal__content auth-page__content">
        <header className="auth-modal__header">
          <h2>Sign Up</h2>
        </header>
        <div className="auth-modal__form">
          <p className="auth-modal__note">
            You&apos;ll be redirected to Supabase OAuth (e.g. GitHub) to create your account.
          </p>
          <button
            type="button"
            className="auth-modal__google"
            onClick={handleSignUp}
            disabled={submitting}
          >
            {submitting ? 'Opening sign-up...' : 'Continue with OAuth'}
          </button>
          {error && <p className="auth-modal__error">{error}</p>}
        </div>
        <p className="auth-modal__note">New accounts start as pending until an admin approves them.</p>
        <div className="auth-modal__switch">
          <span>Already have an account?</span>
          <Link to="/login" className="auth-modal__link">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
