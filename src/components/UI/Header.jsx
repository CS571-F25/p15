import React, { useEffect, useState } from 'react';
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
  )
};

const baseNavLinks = [
  { to: "/azterra", label: "Azterra", icon: NAV_ICONS.azterra },
  { to: "/", label: "Map", icon: NAV_ICONS.map },
  { to: "/locations", label: "Locations", icon: NAV_ICONS.locations },
  { to: "/people", label: "People", icon: NAV_ICONS.people },
  { to: "/magic", label: "Magic & Lore", icon: NAV_ICONS.magic },
  { to: "/campaign", label: "Campaign", icon: NAV_ICONS.campaign },
];

export default function Header() {
  const location = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user, role, login, logout } = useAuth();

  const navLinks = role === 'admin'
    ? [...baseNavLinks, { to: '/admin', label: 'Admin', icon: NAV_ICONS.admin }]
    : baseNavLinks;

  useEffect(() => {
    document.body.classList.add('has-azterra-sidebar');
    return () => document.body.classList.remove('has-azterra-sidebar');
  }, []);

  const handleLogin = (formData) => login(formData);

  return (
    <>
      <aside
        className="group fixed top-0 left-0 h-screen w-[60px] hover:w-[200px] bg-gradient-to-b from-[#18120cfa] to-[#221a15f2] text-[#f7ecda] flex flex-col shadow-[4px_0_20px_rgba(0,0,0,0.55)] z-[1500] border-r border-[#ffd6af33] transition-all duration-300 overflow-visible"
        aria-label="Azterra navigation"
      >
        {/* Brand / Logo Area */}
        <div className="flex items-center h-[70px] px-[10px] shrink-0 whitespace-nowrap relative group">
          <div className="w-[40px] h-[40px] rounded-[10px] border border-[#ffdc9673] flex items-center justify-center font-serif text-[1.2rem] bg-[radial-gradient(circle_at_30%_30%,rgba(255,226,185,0.3),rgba(27,20,15,0.8))] font-[Cinzel] shrink-0 text-[#ffd700] relative z-20">
            A
          </div>
          <div className="flex flex-col ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 relative z-50">
            <span className="font-[Cinzel] text-[1.2rem] tracking-[0.2rem] uppercase text-[#ffd700]">Azterra</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2 mt-4 px-2">
          {navLinks.map(({ to, label, icon }) => {
            const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`group flex items-center h-[44px] rounded-lg px-[10px] text-[#faeacd] no-underline tracking-[0.04rem] font-semibold transition-all duration-200 hover:bg-[#ffd7001f] hover:text-[#ffe5ba] whitespace-nowrap relative ${isActive ? 'bg-[#ffd70040] text-[#ffe5ba] shadow-[inset_0_0_0_1px_rgba(255,215,0,0.4)]' : ''
                  }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Icon */}
                <span className="w-6 h-6 shrink-0 flex items-center justify-center relative z-20" aria-hidden="true">
                  {icon}
                </span>
                {/* Text Label (Opacity transition) */}
                <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 relative z-50">
                  {label}
                </span>
                {/* Active Indicator (Accent Line) */}
                {isActive && (
                  <div className="absolute left-0 w-[3px] h-full bg-[#ffd700] rounded-r-sm" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Account Area */}
        <div className="mt-auto p-2 border-t border-[#ffd7aa33]">
          {!user && (
            <button
              type="button"
              className="group flex items-center w-full h-[44px] rounded-lg px-[10px] text-[#fff4dc] bg-transparent hover:bg-[#ffffff15] transition-all duration-200 whitespace-nowrap"
              onClick={() => setIsLoginOpen(true)}
              title="Login"
            >
              {/* Login Icon */}
              <span className="w-6 h-6 shrink-0 flex items-center justify-center text-[#ffd700]">
                {NAV_ICONS.login}
              </span>
              {/* Login Label */}
              <span className="ml-4 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 relative z-50">
                Login
              </span>
            </button>
          )}

          {user && (
            <div className="flex flex-col gap-1">
              {/* User Info Display */}
              <div className="flex items-center h-[44px] px-[10px] whitespace-nowrap group">
                <span className="w-6 h-6 shrink-0 flex items-center justify-center text-[#ffd700]">
                  {NAV_ICONS.login}
                </span>
                {/* User details (Name and Role) */}
                <div className="ml-4 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 relative z-50">
                  <span className="text-sm font-semibold text-[#ffe5ba]">{user.name || 'User'}</span>
                  <span className="text-xs text-[#ffffff80] capitalize">{role}</span>
                </div>
              </div>
              {/* Logout Button */}
              <button
                type="button"
                className="group flex items-center w-full h-[36px] rounded-lg px-[10px] text-[#ffa38c] hover:bg-[#ffa38c1a] transition-all duration-200 whitespace-nowrap"
                onClick={logout}
                title="Logout"
              >
                <span className="w-6 h-6 shrink-0 flex items-center justify-center">
                  {NAV_ICONS.logout}
                </span>
                <span className="ml-4 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 relative z-50">
                  Logout
                </span>
              </button>
            </div>
          )}
        </div>
      </aside>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSubmit={handleLogin} />
    </>
  );
}