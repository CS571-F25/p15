import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import './UI.css';

const navLinks = [
  { to: "/", label: "Map" },
  { to: "/almanac", label: "Almanac" },
  { to: "/characters", label: "Characters" },
];

const pageTitles = {
  "/": "Map",
  "/almanac": "Almanac",
  "/characters": "Characters",
};

const getTitle = (pathname) =>
  pageTitles[pathname] ||
  pathname.replace("/", "").charAt(0).toUpperCase() + pathname.slice(2);

export default function Header() {
  const location = useLocation();
  const title = getTitle(location.pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleToggleMenu = () => setMenuOpen((open) => !open);
  const handleCloseMenu = () => setMenuOpen(false);

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
          <Link to="/login" className="auth-btn login-btn">
            Login
          </Link>
          <Link to="/signup" className="auth-btn signup-btn">
            Sign Up
          </Link>
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
                fontWeight: location.pathname === to ? "bold" : "normal",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
