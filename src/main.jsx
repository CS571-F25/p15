import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { MapEffectsProvider } from './context/MapEffectsContext';
import { LocationDataProvider } from './context/LocationDataContext';
import { RegionDataProvider } from './context/RegionDataContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <MapEffectsProvider>
        <LocationDataProvider>
          <RegionDataProvider>
            <App />
          </RegionDataProvider>
        </LocationDataProvider>
      </MapEffectsProvider>
    </AuthProvider>
  </React.StrictMode>
);
