import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { MapEffectsProvider } from './context/MapEffectsContext';
import { LocationDataProvider } from './context/LocationDataContext';
import { RegionDataProvider } from './context/RegionDataContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <MapEffectsProvider>
      <LocationDataProvider>
        <RegionDataProvider>
          <App />
        </RegionDataProvider>
      </LocationDataProvider>
    </MapEffectsProvider>
  </AuthProvider>
);
