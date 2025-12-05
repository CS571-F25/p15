import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function SignupPage() {
  const navigate = useNavigate();
  const { user, signup, googleLogin } = useAuth();
  const [username, setUsername] = useState('');
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

  const handleEmailSignup = async (event) => {
    event.preventDefault();
    setError('');
    const trimmedName = username.trim();
    if (!trimmedName || !email.trim() || !password) {
      setError('Please enter a display username, email, and password.');
      return;
    }
    if (submitting || googleSubmitting) return;
    setSubmitting(true);
    try {
      await signup({ displayName: trimmedName, email: email.trim(), password });
    } catch (err) {
      setError(err.message || 'Unable to sign up with email.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    const trimmedName = username.trim();
    if (!trimmedName) {
      setError('Please choose a display username before continuing.');
      return;
    }
    if (googleSubmitting || submitting) return;
    setGoogleSubmitting(true);
    try {
      await googleLogin({ displayName: trimmedName });
    } catch (err) {
      setError(err.message || 'Unable to start Supabase signup.');
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-modal__content auth-page__content">
        <header className="auth-modal__header">
          <h2>Sign Up</h2>
        </header>
        <form className="auth-modal__form" onSubmit={handleEmailSignup}>
          <label>
            <span>Username (for display)</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Choose a display name"
            />
          </label>
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
              placeholder="Create a password"
            />
          </label>
          <button
            type="submit"
            className="auth-modal__google auth-modal__google--alt"
            disabled={submitting || googleSubmitting}
          >
            {submitting ? 'Creating account...' : 'Sign up with Email'}
          </button>
          <p className="auth-modal__note">
            Accounts are secured with Supabase. Use email + password or continue with Google to finish signup.
          </p>
          <button
            type="button"
            className="auth-modal__google"
            onClick={handleGoogleSignUp}
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
            {googleSubmitting ? 'Opening Google...' : 'Continue with Google'}
          </button>
          {error && <p className="auth-modal__error">{error}</p>}
        </form>
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
