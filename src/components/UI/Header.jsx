import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './UI.css';
import LoginModal from '../auth/LoginModal';
import SignupModal from '../auth/SignupModal';
import { useAuth } from '../../context/AuthContext';

const NAV_ICONS = {
  map: (
    <svg viewBox="0 0 24 24" role="presentation">
      <path
        d="M9 4 3.5 6.5v13L9 17l6 2.5 5.5-2.5v-13L15 6.5 9 4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M9 4v13" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 6.5V20" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  almanac: (
    <svg viewBox="0 0 24 24" role="presentation">
      <path
        d="M6 4h11a2 2 0 0 1 2 2v14H8a2 2 0 0 0-2-2H4V6a2 2 0 0 1 2-2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M8 8h9M8 12h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  world: (
    <svg viewBox="0 0 24 24" role="presentation">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 12h18M12 3a12 12 0 0 0 0 18M12 3a12 12 0 0 1 0 18" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  characters: (
    <svg viewBox="0 0 24 24" role="presentation">
      <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M6.5 20c.4-3.1 2.8-5.5 5.5-5.5s5.1 2.4 5.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
  admin: (
    <svg viewBox="0 0 24 24" role="presentation">
      <path
        d="M12 3 6 5.8v6.4c0 4 2.8 7.9 6 8.8 3.2-.9 6-4.8 6-8.8V5.8L12 3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M10 11.5 12 13l3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const baseNavLinks = [
  { to: "/", label: "Map", icon: NAV_ICONS.map },
  { to: "/almanac", label: "Almanac", icon: NAV_ICONS.almanac },
  { to: "/world-races", label: "Azterra Races", icon: NAV_ICONS.world },
  { to: "/characters", label: "Characters", icon: NAV_ICONS.characters },
];

const pageTitles = {
  "/": "Map",
  "/almanac": "Almanac",
  "/world-races": "Azterra's Races",
  "/characters": "Characters",
  "/admin": "Admin",
};

const getTitle = (pathname) =>
  pageTitles[pathname] ||
  pathname.replace("/", "").charAt(0).toUpperCase() + pathname.slice(2);

export default function Header() {
  const location = useLocation();
  const title = getTitle(location.pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const { user, role, login, signup, logout } = useAuth();
  const navLinks =
    role === 'admin'
      ? [...baseNavLinks, { to: '/admin', label: 'Admin', icon: NAV_ICONS.admin }]
      : baseNavLinks;

  useEffect(() => {
    document.body.classList.add('has-azterra-sidebar');
    return () => document.body.classList.remove('has-azterra-sidebar');
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogin = (formData) => login(formData);
  const handleSignup = (formData) => signup(formData);

  const toggleSidebar = () => setSidebarOpen((open) => !open);

  return (
    <>
      <button
        type="button"
        className="sidebar-mobile-toggle"
        onClick={toggleSidebar}
        aria-controls="azterra-sidebar"
        aria-expanded={sidebarOpen}
      >
        <span className="sr-only">Toggle Azterra navigation</span>
        <span />
        <span />
        <span />
      </button>

      <aside
        id="azterra-sidebar"
        className={`azterra-sidebar ${sidebarOpen ? 'is-open' : ''}`}
        aria-label="Azterra navigation"
      >
        <div className="sidebar-brand">
          <div className="brand-mark">A</div>
          <div className="brand-copy">
            <span className="brand-label">Azterra</span>
            <span className="brand-subtitle">{title}</span>
          </div>
          <button type="button" className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close navigation">
            &times;
          </button>
        </div>

        <nav className="sidebar-nav">
          {navLinks.map(({ to, label, icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`sidebar-link ${isActive ? 'is-active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar-icon" aria-hidden="true">
                  {icon}
                </span>
                <span className="sidebar-label">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {!user && (
            <div className="sidebar-auth">
              <button type="button" className="auth-btn login-btn" onClick={() => setIsLoginOpen(true)}>
                Login
              </button>
              <button type="button" className="auth-btn signup-btn" onClick={() => setIsSignupOpen(true)}>
                Sign Up
              </button>
            </div>
          )}
          {user && (
            <div className="auth-status">
              <div>
                <span className="auth-status__label">Signed in</span>
                <span>
                  {user.name} <span className="auth-status__role">({role})</span>
                </span>
              </div>
              <button type="button" className="auth-btn logout-btn" onClick={logout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSubmit={handleLogin} />
      <SignupModal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} onSubmit={handleSignup} />
    </>
  );
}
