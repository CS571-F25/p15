import React, { useEffect, useState } from 'react';

function LoginModal({ isOpen, onClose, onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setError('');
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
          {error && <p className="auth-modal__error">{error}</p>}
        </form>
        <p className="auth-modal__note">Editors must be approved by an admin before autosave is enabled.</p>
      </div>
    </div>
  );
}

export default LoginModal;
