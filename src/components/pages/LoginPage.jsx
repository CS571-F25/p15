import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { user, loginWithGoogle, loginWithEmail } = useAuth();
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [email, setEmail] = useState('');
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [oauthSubmitting, setOauthSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleEmailSignIn = async () => {
    setError('');
    setInfo('');
    if (emailSubmitting) return;
    setEmailSubmitting(true);
    try {
      await loginWithEmail({ email });
      setInfo('Magic link sent. Check your email to finish signing in.');
    } catch (err) {
      setError(err?.message || 'Unable to start email login.');
    } finally {
      setEmailSubmitting(false);
    }
  };

  const handleOAuthSignIn = async () => {
    setError('');
    setInfo('');
    if (oauthSubmitting) return;
    setOauthSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err?.message || 'Unable to start login.');
      setOauthSubmitting(false);
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
            Sign in with a magic link sent to your email or use Google OAuth.
          </p>
          <label htmlFor="login-email">
            Email
            <input
              id="login-email"
              type="email"
              placeholder="adventurer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={emailSubmitting || oauthSubmitting}
              required
            />
          </label>
          <button
            type="button"
            className="auth-modal__submit"
            onClick={handleEmailSignIn}
            disabled={emailSubmitting || oauthSubmitting || !email.trim()}
          >
            {emailSubmitting ? 'Sending magic link...' : 'Send magic link'}
          </button>
          <div className="auth-modal__divider">or</div>
          <button
            type="button"
            className="auth-modal__google"
            onClick={handleOAuthSignIn}
            disabled={oauthSubmitting}
          >
            {oauthSubmitting ? 'Opening Google...' : 'Continue with Google'}
          </button>
          {info && <p className="auth-modal__note">{info}</p>}
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
