import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { MapEffectsProvider } from './context/MapEffectsContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <MapEffectsProvider>
        <App />
      </MapEffectsProvider>
    </AuthProvider>
  </React.StrictMode>
);
