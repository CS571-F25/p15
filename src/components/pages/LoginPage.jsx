import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { user, login, googleLogin, toggleLocalAdmin, isLocalAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
    } catch (err) {
      setError(err.message || 'Unable to login with email.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    if (googleSubmitting || submitting) return;
    setGoogleSubmitting(true);
    try {
      await googleLogin({});
    } catch (err) {
      setError(err.message || 'Unable to start Supabase login.');
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-modal__content auth-page__content">
        <header className="auth-modal__header">
          <h2>Login</h2>
        </header>
        <form className="auth-modal__form" onSubmit={handleEmailLogin}>
          <label>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
            />
          </label>
          <button
            type="submit"
            className="auth-modal__google auth-modal__google--alt"
            disabled={submitting || googleSubmitting}
          >
            {submitting ? 'Signing in...' : 'Sign in with Email'}
          </button>
          <p className="auth-modal__note">or continue with Google</p>
          <button
            type="button"
            className="auth-modal__google"
            onClick={handleGoogleSignIn}
            disabled={googleSubmitting || submitting}
          >
            <span className="auth-modal__google-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" role="presentation">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.15 0 5.98 1.08 8.2 3.2l6.12-6.12C34.7 3.08 29.87 1 24 1 14.6 1 6.5 6.35 2.7 14l7.68 5.97C12.38 14.02 17.7 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.5 24.5c0-1.57-.15-3.08-.44-4.55H24v9.1h12.7c-.55 2.96-2.2 5.46-4.69 7.13l7.28 5.66C43.9 37.44 46.5 31.42 46.5 24.5z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.38 28.03A14.47 14.47 0 0 1 9.5 24c0-1.4.24-2.75.68-4.03l-7.67-5.97A23.9 23.9 0 0 0 0 24c0 3.9.93 7.58 2.56 10.85l7.82-6.82z"
                />
                <path
                  fill="#34A853"
                  d="M24 47c6.48 0 11.9-2.13 15.86-5.83l-7.28-5.66c-2.03 1.37-4.64 2.19-8.58 2.19-6.3 0-11.62-4.52-13.66-10.47l-7.68 6C6.5 41.65 14.6 47 24 47z"
                />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
            </span>
            {googleSubmitting ? 'Opening Google...' : 'Sign in with Google'}
          </button>
          <button
            type="button"
            className="auth-modal__google auth-modal__google--alt"
            onClick={() => toggleLocalAdmin?.()}
            disabled={googleSubmitting || submitting}
          >
            {isLocalAdmin ? 'Disable Admin Mode' : 'Toggle Admin Mode'}
          </button>
          {error && <p className="auth-modal__error">{error}</p>}
        </form>
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
