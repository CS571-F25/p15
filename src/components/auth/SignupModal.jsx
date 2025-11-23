import React, { useEffect, useState } from 'react';

function SignupModal({ isOpen, onClose, onSubmit, onOpenLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setName('');
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
      await onSubmit({ name, email, password });
      onClose();
    } catch (err) {
      setError(err.message || 'Unable to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    if (onOpenLogin) {
      onClose?.();
      onOpenLogin();
    }
  };

  return (
    <div className="auth-modal" role="dialog" aria-modal="true">
      <div className="auth-modal__content">
        <header className="auth-modal__header">
          <h2>Sign Up</h2>
          <button type="button" className="auth-modal__close" onClick={onClose} aria-label="Close sign up form">
            ×
          </button>
        </header>
        <form className="auth-modal__form" onSubmit={handleSubmit}>
          <label>
            <span>Name</span>
            <input type="text" value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
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
              minLength={8}
              required
            />
          </label>
          <button type="submit" className="auth-modal__submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Account'}
          </button>
          {error && <p className="auth-modal__error">{error}</p>}
        </form>
        <p className="auth-modal__note">New accounts start as pending until an admin approves them.</p>
        <div className="auth-modal__switch">
          <span>Already have an account?</span>
          <button type="button" className="auth-modal__link" onClick={handleBackToLogin}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignupModal;
