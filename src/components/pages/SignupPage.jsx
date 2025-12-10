import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function SignupPage() {
  const navigate = useNavigate();
  const { user, signupWithGoogle, signupWithEmail, setPendingUsername } = useAuth();
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [oauthSubmitting, setOauthSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const requireUsername = () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setError('Please choose a username to display in Azterra.');
      return null;
    }
    return trimmed;
  };

  const handleEmailSignUp = async () => {
    setError('');
    setInfo('');
    const chosenUsername = requireUsername();
    if (!chosenUsername || emailSubmitting) return;
    setEmailSubmitting(true);
    try {
      setPendingUsername(chosenUsername);
      await signupWithEmail({ email, username: chosenUsername });
      setInfo('Magic link sent. Check your email to finish creating your account.');
    } catch (err) {
      setError(err?.message || 'Unable to start signup.');
    } finally {
      setEmailSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setInfo('');
    const chosenUsername = requireUsername();
    if (!chosenUsername || oauthSubmitting) return;
    setOauthSubmitting(true);
    try {
      setPendingUsername(chosenUsername);
      await signupWithGoogle();
    } catch (err) {
      setError(err?.message || 'Unable to start signup.');
      setOauthSubmitting(false);
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
            Pick a username, then sign up with a magic link or Google OAuth.
          </p>
          <label htmlFor="signup-username">
            Username
            <input
              id="signup-username"
              type="text"
              placeholder="Guildmaster"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={emailSubmitting || oauthSubmitting}
              required
            />
          </label>
          <label htmlFor="signup-email">
            Email
            <input
              id="signup-email"
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
            onClick={handleEmailSignUp}
            disabled={emailSubmitting || oauthSubmitting || !email.trim()}
          >
            {emailSubmitting ? 'Sending magic link...' : 'Send magic link'}
          </button>
          <div className="auth-modal__divider">or</div>
          <button
            type="button"
            className="auth-modal__google"
            onClick={handleGoogleSignUp}
            disabled={oauthSubmitting}
          >
            {oauthSubmitting ? 'Opening Google...' : 'Continue with Google'}
          </button>
          {info && <p className="auth-modal__note">{info}</p>}
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
