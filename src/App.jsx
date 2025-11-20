import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapPage from './components/pages/MapPage';
import AlmanacPage from './components/pages/AlmanacPage';
import CharactersPage from './components/pages/CharactersPage';
import WorldRaces from './components/pages/WorldRaces';
import AdminDashboard from './components/pages/AdminDashboard';
import Header from './components/UI/Header';

function App() {
  return (
    <Router basename='/p15/'>
      <Header />
      <Routes>
        <Route path="" element={<MapPage />} />
        <Route path="almanac" element={<AlmanacPage />} />
        <Route path="world-races" element={<WorldRaces />} />
        <Route path="characters" element={<CharactersPage />} />
        <Route path="admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
export default App;
