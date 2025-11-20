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
        className="fixed top-4 left-4 w-[46px] h-[46px] rounded-xl border border-[#fae4be66] bg-[#19120dbf] flex flex-col justify-center gap-1 z-[1500] cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-[0_12px_26px_rgba(0,0,0,0.45)] min-[900px]:hidden"
        onClick={toggleSidebar}
        aria-controls="azterra-sidebar"
        aria-expanded={sidebarOpen}
      >
        <span className="sr-only">Toggle Azterra navigation</span>
        <span className="block w-[60%] h-[3px] rounded-sm bg-[#ffe7c7] mx-auto" />
        <span className="block w-[60%] h-[3px] rounded-sm bg-[#ffe7c7] mx-auto" />
        <span className="block w-[60%] h-[3px] rounded-sm bg-[#ffe7c7] mx-auto" />
      </button>

      <aside
        id="azterra-sidebar"
        className={`fixed top-0 left-0 h-screen w-[clamp(240px,18vw,300px)] bg-gradient-to-b from-[#18120cfa] to-[#221a15f2] text-[#f7ecda] flex flex-col p-6 gap-6 shadow-[18px_0_40px_rgba(0,0,0,0.55)] z-[1400] border-r border-[#ffd6af33] transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } min-[900px]:translate-x-0`}
        aria-label="Azterra navigation"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[14px] border border-[#ffdc9673] flex items-center justify-center font-serif text-[1.4rem] tracking-[0.12rem] bg-[radial-gradient(circle_at_30%_30%,rgba(255,226,185,0.3),rgba(27,20,15,0.8))] font-[Cinzel]">
            A
          </div>
          <div className="flex flex-col gap-[0.15rem]">
            <span className="font-[Cinzel] text-[1.4rem] tracking-[0.2rem] uppercase">Azterra</span>
            <span className="text-[0.95rem] tracking-[0.08rem] text-[#ffe9c8bf]">{title}</span>
          </div>
          <button
            type="button"
            className="ml-auto border-none bg-transparent text-[#fff7eacc] text-2xl cursor-pointer inline-flex min-[900px]:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            &times;
          </button>
        </div>

        <nav className="flex flex-col gap-[0.35rem]">
          {navLinks.map(({ to, label, icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-[0.8rem] rounded-xl px-[0.85rem] py-[0.65rem] text-[#faeacd] no-underline tracking-[0.04rem] font-semibold transition-all duration-200 hover:bg-[#ffd7001f] hover:text-[#ffe5ba] hover:translate-x-1 ${isActive ? 'bg-[#ffd70040] text-[#ffe5ba] shadow-[inset_0_0_0_1px_rgba(255,215,0,0.4)]' : ''
                  }`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="w-6 h-6" aria-hidden="true">
                  {icon}
                </span>
                <span className="flex-1">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-[#ffd7aa33]">
          {!user && (
            <div className="flex flex-col gap-[0.6rem]">
              <button
                type="button"
                className="w-full text-center no-underline text-[#fff4dc] bg-transparent border border-[#f7e0bb73] rounded-full py-[0.45rem] px-6 font-semibold cursor-pointer tracking-[0.04rem] transition-all duration-200 shadow-[0_6px_18px_rgba(0,0,0,0.35)] hover:bg-[#ffswcf1f] hover:-translate-y-px hover:shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
                onClick={() => setIsLoginOpen(true)}
              >
                Login
              </button>
              <button
                type="button"
                className="w-full text-center no-underline text-[#fff4dc] bg-transparent border border-[#afd994b3] rounded-full py-[0.45rem] px-6 font-semibold cursor-pointer tracking-[0.04rem] transition-all duration-200 shadow-[0_6px_18px_rgba(0,0,0,0.35)] hover:bg-[#bbe6a41f] hover:-translate-y-px hover:shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
                onClick={() => setIsSignupOpen(true)}
              >
                Sign Up
              </button>
            </div>
          )}
          {user && (
            <div className="flex flex-col items-start gap-2 text-[#ffe9c9] text-sm">
              <div>
                <span className="text-[0.78rem] uppercase tracking-[0.2rem] text-[#ffe9c999]">Signed in</span>
                <span className="block">
                  {user.name} <span className="font-semibold capitalize">({role})</span>
                </span>
              </div>
              <button
                type="button"
                className="no-underline text-[#fff4dc] bg-transparent border border-[#ffa38cb3] rounded-full py-[0.45rem] px-6 font-semibold cursor-pointer tracking-[0.04rem] transition-all duration-200 shadow-[0_6px_18px_rgba(0,0,0,0.35)] hover:bg-[#ffa38c26] hover:-translate-y-px hover:shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/55 backdrop-blur-[2px] z-[1300]"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSubmit={handleLogin} />
      <SignupModal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} onSubmit={handleSignup} />
    </>
  );
}
