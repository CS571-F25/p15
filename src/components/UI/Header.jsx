import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './UI.css';
import LoginModal from '../auth/LoginModal';
import SignupModal from '../auth/SignupModal';
import { useAuth } from '../../context/AuthContext';

const baseNavLinks = [
  { to: "/", label: "Map" },
  { to: "/almanac", label: "Almanac" },
  { to: "/world", label: "Azterra Races" },
  { to: "/characters", label: "Characters" },
];

const pageTitles = {
  "/": "Map",
  "/almanac": "Almanac",
  "/world": "Azterra Races",
  "/characters": "Characters",
};

const getTitle = (pathname) =>
  pageTitles[pathname] ||
  pathname.replace("/", "").charAt(0).toUpperCase() + pathname.slice(2);

export default function Header() {
  const location = useLocation();
  const title = getTitle(location.pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const { user, role, login, signup, logout } = useAuth();
  const navLinks = role === 'admin' ? [...baseNavLinks, { to: '/admin', label: 'Admin' }] : baseNavLinks;

  const handleToggleMenu = () => setMenuOpen((open) => !open);
  const handleCloseMenu = () => setMenuOpen(false);

  const handleLogin = (formData) => {
    return login(formData);
  };

  const handleSignup = (formData) => {
    return signup(formData);
  };

  return (
    <>
      <header className="azterra-header">
        <div className="header-left">
          <button className="hamburger" onClick={handleToggleMenu} aria-label="Open navigation">
            <span />
            <span />
            <span />
          </button>
          <span className="azterra-brand">Azterra</span>
          <span className="header-title">{title}</span>
        </div>
        <div className="header-right">
          {!user && (
            <>
              <button type="button" className="auth-btn login-btn" onClick={() => setIsLoginOpen(true)}>
                Login
              </button>
              <button type="button" className="auth-btn signup-btn" onClick={() => setIsSignupOpen(true)}>
                Sign Up
              </button>
            </>
          )}
          {user && (
            <div className="auth-status">
              <span>
                Logged in as <strong>{user.name}</strong>{' '}
                <span className="auth-status__role">({role})</span>
              </span>
              <button type="button" className="auth-btn logout-btn" onClick={logout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      {menuOpen && (
        <nav className="header-dropdown">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="dropdown-link"
              onClick={handleCloseMenu}
              style={{
                fontWeight: location.pathname === to ? 'bold' : 'normal',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSubmit={handleLogin} />
      <SignupModal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} onSubmit={handleSignup} />
    </>
  );
}
