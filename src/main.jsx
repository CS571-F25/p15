import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { MapEffectsProvider } from './context/MapEffectsContext';
import { LocationDataProvider } from './context/LocationDataContext';
import { RegionDataProvider } from './context/RegionDataContext';
import { ContentProvider } from './context/ContentContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <MapEffectsProvider>
      <LocationDataProvider>
        <RegionDataProvider>
          <ContentProvider>
            <App />
          </ContentProvider>
        </RegionDataProvider>
      </LocationDataProvider>
    </MapEffectsProvider>
  </AuthProvider>
);
