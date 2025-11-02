import React, { useState } from 'react';
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
            <li className="menu-item">📖 Almanac</li>
            <li className="menu-item">🔐 Login</li>
            <li className="menu-item">⚙️ Settings</li>
            {/* Add more menu items as needed */}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MenuButton;
