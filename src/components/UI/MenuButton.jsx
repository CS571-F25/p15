import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './UI.css';

function MenuButton({ isOpen, onToggle }) {
  const [showMenu, setShowMenu] = useState(false);

  const handleToggle = () => {
    setShowMenu(!showMenu);
    onToggle();
  };

  return (
    <div className="menu-container">
      <button className="menu-button" onClick={handleToggle}>
        <span className="menu-icon">☰</span>
      </button>
      {showMenu && (
        <div className="menu-dropdown">
          <ul className="menu-list">
            <li className="menu-item">
              <Link to="/" onClick={() => setShowMenu(false)}>Map</Link>
            </li>
            <li className="menu-item">
              <Link to="/almanac" onClick={() => setShowMenu(false)}>Almanac</Link>
            </li>
            <li className="menu-item">
              <Link to="/characters" onClick={() => setShowMenu(false)}>Characters</Link>
            </li>
            {/* Add more menu items / navigation links here */}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MenuButton;
