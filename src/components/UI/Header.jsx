import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './UI.css';
import { useAuth } from '../../context/AuthContext';

// Icons for the new top-level categories
const NAV_ICONS = {
  // Compendium (Merged Azterra/People/Magic) - Using Globe
  compendium: (
    <svg viewBox="0 0 24 24" role="presentation">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  // Atlas - Using Map Pin
  atlas: (
    <svg viewBox="0 0 24 24" role="presentation">
      <path d="M12 21s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 7.2c0 7.3-8 11.8-8 11.8z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  // Map/Scroll icon
  map: (
    <svg viewBox="0 0 24 24" role="presentation">
      <path d="M9 4 3.5 6.5v13L9 17l6 2.5 5.5-2.5v-13L15 6.5 9 4z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 4v13M15 6.5V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
  ),
  about: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <circle cx="12" cy="8" r="0.8" />
    </svg>
  )
};

const baseNavLinks = [
  { to: "/", label: "Map", icon: NAV_ICONS.map },
  { to: "/campaign", label: "Campaign", icon: NAV_ICONS.campaign },
  { to: "/atlas", label: "Atlas", icon: NAV_ICONS.atlas },
  { 
    to: "/compendium",
    label: "Compendium",
    icon: NAV_ICONS.compendium,
    children: [
      { to: "/compendium", label: "Almanac" },
      { to: "/compendium/societies", label: "Societies" },
      { to: "/compendium/cosmos", label: "Cosmos" },
      { to: "/compendium/heroes", label: "Heroes" },
    ]
  },
  { to: "/people", label: "People", icon: NAV_ICONS.viewing },
  { to: "/players", label: "Players", icon: NAV_ICONS.players },
  { to: "/progress", label: "Progress", icon: NAV_ICONS.progress },
  { to: "/about", label: "About", icon: NAV_ICONS.about },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const [compendiumOpen, setCompendiumOpen] = useState(false);

  const toggleCompendium = (event) => {
    event.preventDefault();
    setCompendiumOpen((prev) => !prev);
  };

  const closeCompendium = () => setCompendiumOpen(false);

  useEffect(() => {
    if (!location.pathname.startsWith('/compendium')) {
      setCompendiumOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = role === 'admin'
    ? [...baseNavLinks, { to: '/admin', label: 'Admin', icon: NAV_ICONS.admin }]
    : baseNavLinks;

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
      {navLinks.map(({ to, label, icon, children, isDisabled }) => {
            const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
            const isCompendium = label === 'Compendium';
            const linkIsActive = isCompendium ? (compendiumOpen || isActive) : isActive;
            const itemClass = `azterra-nav__item ${children ? 'azterra-nav__item--parent' : ''} ${isCompendium ? 'azterra-nav__item--compendium' : ''} ${isCompendium && compendiumOpen ? 'azterra-nav__item--open' : ''}`;
            return (
              <div
                key={to}
                className={itemClass}
              >
                <Link
                  to={to}
                  className={`azterra-nav__link ${linkIsActive ? 'azterra-nav__link--active' : ''} ${isDisabled ? 'azterra-nav__link--disabled' : ''}`}
                  aria-current={linkIsActive ? 'page' : undefined}
                  aria-haspopup={children ? 'true' : undefined}
                  aria-expanded={isCompendium ? compendiumOpen : undefined}
                  aria-disabled={isDisabled ? 'true' : undefined}
                  onClick={isCompendium ? toggleCompendium : (isDisabled ? (e) => e.preventDefault() : undefined)}
                >
                  <span className="azterra-nav__icon" aria-hidden="true">
                    {icon}
                  </span>
                  <span className="azterra-nav__label">{label}</span>
                  {isCompendium && (
                    <span className={`azterra-nav__chevron ${compendiumOpen ? 'azterra-nav__chevron--open' : ''}`} aria-hidden="true">
                      <svg viewBox="0 0 24 24" role="presentation">
                        <polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                  {linkIsActive && <div className="azterra-nav__indicator" />}
                </Link>

                {children && (
                  <div className="azterra-nav__submenu" role="menu" aria-label={`${label} shortcuts`}>
                    {children.map((child) => {
                      const isChildActive = location.pathname === child.to;
                      return (
                        <Link
                          key={child.to}
                          to={child.to}
                          className={`azterra-nav__sublink ${isChildActive ? 'azterra-nav__sublink--active' : ''}`}
                          role="menuitem"
                          onClick={isCompendium ? closeCompendium : undefined}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="azterra-sidebar__footer">
          {!user && (
            <div className="azterra-sidebar__guest">
              <Link
                to="/login"
                className="azterra-nav__link"
                title="Login"
              >
                <span className="azterra-nav__icon text-[#ffd700]">
                  {NAV_ICONS.login}
                </span>
                <span className="azterra-nav__label">Login</span>
              </Link>
              <Link
                to="/signup"
                className="azterra-nav__link"
                title="Sign Up"
              >
                <span className="azterra-nav__icon text-[#ffd700]">
                  {NAV_ICONS.account}
                </span>
                <span className="azterra-nav__label">Sign Up</span>
              </Link>
            </div>
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
                onClick={handleLogout}
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

    </>
  );
}
