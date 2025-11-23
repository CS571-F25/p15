import React, { useCallback, useEffect, useRef, useState } from 'react';

function LoginModal({ isOpen, onClose, onSubmit, onOpenSignup, onGoogleLogin }) {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const googleInitializedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setError('');
      setSubmitting(false);
      setGoogleSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    let isMounted = true;
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');

    if (existingScript) {
      if (existingScript.dataset.loaded === 'true' || existingScript.readyState === 'complete') {
        setGoogleReady(true);
      } else {
        const handleLoad = () => isMounted && setGoogleReady(true);
        existingScript.addEventListener('load', handleLoad);
        return () => {
          isMounted = false;
          existingScript.removeEventListener('load', handleLoad);
        };
      }
      return undefined;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      if (isMounted) setGoogleReady(true);
    };
    document.head.appendChild(script);

    return () => {
      isMounted = false;
      script.onload = null;
    };
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ email, password });
      onClose();
    } catch (err) {
      setError(err.message || 'Unable to login.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenSignup = () => {
    if (onOpenSignup) {
      onClose?.();
      onOpenSignup();
    }
  };

  const handleGoogleCredential = useCallback(
    async (response) => {
      if (!response?.credential) {
        setError('Google sign-in did not return a credential.');
        setGoogleSubmitting(false);
        return;
      }
      try {
        if (!onGoogleLogin) {
          setError('Google Sign-In is not available right now.');
          setGoogleSubmitting(false);
          return;
        }
        await onGoogleLogin(response.credential);
        onClose();
      } catch (err) {
        setError(err.message || 'Unable to login with Google.');
      } finally {
        setGoogleSubmitting(false);
      }
    },
    [onClose, onGoogleLogin]
  );

  const handleGoogleSignIn = () => {
    setError('');
    if (!onGoogleLogin) {
      setError('Google Sign-In is not available right now.');
      return;
    }
    if (!GOOGLE_CLIENT_ID) {
      setError('Google Sign-In is not configured.');
      return;
    }
    if (googleSubmitting) return;
    if (!window.google || !window.google.accounts?.id || (!googleReady && !googleInitializedRef.current)) {
      setError('Google Sign-In is still loading. Please try again.');
      return;
    }

    setGoogleSubmitting(true);

    if (!googleInitializedRef.current) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
        ux_mode: 'popup',
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      googleInitializedRef.current = true;
    }

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setGoogleSubmitting(false);
        setError('Google Sign-In was dismissed or could not start.');
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal" role="dialog" aria-modal="true">
      <div className="auth-modal__content">
        <header className="auth-modal__header">
          <h2>Login</h2>
          <button type="button" className="auth-modal__close" onClick={onClose} aria-label="Close login form">
            ×
          </button>
        </header>
        <form className="auth-modal__form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button type="submit" className="auth-modal__submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Login'}
          </button>
          <div className="auth-modal__divider" aria-hidden="true">
            <span>or</span>
          </div>
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
          {error && <p className="auth-modal__error">{error}</p>}
        </form>
        <p className="auth-modal__note">Note: Editors must be approved by an admin before autosave is enabled.</p>
        <div className="auth-modal__switch">
          <span>New here?</span>
          <button type="button" className="auth-modal__link" onClick={handleOpenSignup}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
