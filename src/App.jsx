import React, { useState } from 'react';
import InteractiveMap from './components/Map/InteractiveMap';
import MenuButton from './components/UI/MenuButton';
import SidePanel from './components/UI/SidePanel';
import locationsData from './data/locations.json';
import './App.css';

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
  };

  const handleClosePanel = () => {
    setSelectedLocation(null);
  };

  return (
    <div className="app-container">
      <MenuButton 
        isOpen={menuOpen} 
        onToggle={() => setMenuOpen(!menuOpen)} 
      />
      
      <InteractiveMap 
        locations={locationsData}
        onLocationClick={handleLocationClick}
        selectedLocation={selectedLocation}
      />
      
      {selectedLocation && (
        <SidePanel 
          location={selectedLocation}
          onClose={handleClosePanel}
        />
      )}
    </div>
  );
}

export default App;
