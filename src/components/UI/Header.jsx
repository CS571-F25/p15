import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './UI.css';
import LoginModal from '../auth/LoginModal';
import SignupModal from '../auth/SignupModal';
import { useAuth } from '../../context/AuthContext';

// Icons for the new top-level categories
const NAV_ICONS = {
  // Using a stylized globe/cosmology icon for Azterra (The World)
  azterra: (
    <svg viewBox="0 0 24 24" role="presentation">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  // Map/Scroll icon
  map: (
    <svg viewBox="0 0 24 24" role="presentation">
      <path d="M9 4 3.5 6.5v13L9 17l6 2.5 5.5-2.5v-13L15 6.5 9 4z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 4v13M15 6.5V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  // Locations icon
  locations: (
    <svg viewBox="0 0 24 24" role="presentation">
      <path d="M12 21s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 7.2c0 7.3-8 11.8-8 11.8z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  // Group of Figures icon for People (Races, Factions, etc.)
  people: (
    <svg viewBox="0 0 24 24" role="presentation">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  // Star/Magic icon for Magic & Lore
  magic: (
    <svg viewBox="0 0 24 24" role="presentation">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  // Document/Scroll icon for Campaign (Log, PCs, Inventory)
  campaign: (
    <svg viewBox="0 0 24 24" role="presentation">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="10" y1="9" x2="8" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  viewing: (
    <svg viewBox="0 0 24 24" role="presentation">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  // Admin (Shield/Security)
  admin: (
    <svg viewBox="0 0 24 24" role="presentation">
      <path d="M12 3 6 5.8v6.4c0 4 2.8 7.9 6 8.8 3.2-.9 6-4.8 6-8.8V5.8L12 3z" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 11.5 12 13l3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  // User/Account icon for Login
  login: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  // Logout icon
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  account: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
      <path d="M16 5.5a4 4 0 0 1 0 7" />
    </svg>
  ),
  players: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="7" r="3" />
      <circle cx="17" cy="7" r="3" />
      <path d="M2 21a6 6 0 0 1 12 0" />
      <path d="M12 21a6 6 0 0 1 10 0" />
    </svg>
  ),
  progress: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M10 14 14 10" />
      <path d="m12.5 7.5-1 5-5 1 10-3.5z" />
    </svg>
  )
};

const baseNavLinks = [
  { to: "/azterra", label: "Azterra", icon: NAV_ICONS.azterra },
  { to: "/", label: "Map", icon: NAV_ICONS.map },
  { to: "/locations", label: "Locations", icon: NAV_ICONS.locations },
  { to: "/people", label: "People", icon: NAV_ICONS.people },
  { to: "/magic", label: "Magic & Lore", icon: NAV_ICONS.magic },
  { to: "/campaign", label: "Campaign", icon: NAV_ICONS.campaign },
  { to: "/viewing", label: "Viewing", icon: NAV_ICONS.viewing },
  { to: "/players", label: "Players", icon: NAV_ICONS.players },
  { to: "/progress", label: "Progress", icon: NAV_ICONS.progress },
];

export default function Header() {
  const location = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const { user, role, login, googleLogin, logout } = useAuth();

  const navLinks = role === 'admin'
    ? [...baseNavLinks, { to: '/admin', label: 'Admin', icon: NAV_ICONS.admin }]
    : baseNavLinks;

  const handleLogin = (formData) => login(formData);
  const handleSignupOpen = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };
  const handleSignupClose = () => setIsSignupOpen(false);
  const handleLoginOpen = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };

  const handleGoogleLogin = (credential) => googleLogin(credential);

  return (
    <>
      <aside className="azterra-sidebar" aria-label="Azterra navigation">
        <div className="azterra-sidebar__brand">
          <div className="azterra-sidebar__brand-mark">A</div>
          <div className="azterra-sidebar__brand-text">
            <span>Azterra</span>
          </div>
        </div>

        <nav className="azterra-nav">
          {navLinks.map(({ to, label, icon }) => {
            const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`azterra-nav__link ${isActive ? 'azterra-nav__link--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="azterra-nav__icon" aria-hidden="true">
                  {icon}
                </span>
                <span className="azterra-nav__label">{label}</span>
                {isActive && <div className="azterra-nav__indicator" />}
              </Link>
            );
          })}
        </nav>

        <div className="azterra-sidebar__footer">
          {!user && (
            <button
              type="button"
              className="azterra-nav__link"
              onClick={() => setIsLoginOpen(true)}
              title="Login"
            >
              <span className="azterra-nav__icon text-[#ffd700]">
                {NAV_ICONS.login}
              </span>
              <span className="azterra-nav__label">Login</span>
            </button>
          )}

          {user && (
            <div className="azterra-sidebar__account">
              <div className="azterra-sidebar__account-row">
                <span className="azterra-nav__icon text-[#ffd700]">
                  {NAV_ICONS.login}
                </span>
                <div className="azterra-sidebar__account-text">
                  <span className="azterra-sidebar__account-name">{user.name || 'User'}</span>
                  <span className="azterra-sidebar__account-role">{role}</span>
                </div>
              </div>
              <Link
                to="/account"
                className="azterra-nav__link"
                title="Account settings"
                data-label="Account"
              >
                <span className="azterra-nav__icon text-[#ffd700]">
                  {NAV_ICONS.account}
                </span>
                <span className="azterra-nav__label">Account</span>
              </Link>
              <button
                type="button"
                className="azterra-nav__link azterra-nav__link--muted"
                onClick={logout}
                data-label="Logout"
                title="Logout"
              >
                <span className="azterra-nav__icon">
                  {NAV_ICONS.logout}
                </span>
                <span className="azterra-nav__label">Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSubmit={handleLogin}
        onOpenSignup={handleSignupOpen}
        onGoogleLogin={handleGoogleLogin}
      />
      <SignupModal
        isOpen={isSignupOpen}
        onClose={handleSignupClose}
        onOpenLogin={handleLoginOpen}
        onGoogleLogin={handleGoogleLogin}
      />
    </>
  );
}
