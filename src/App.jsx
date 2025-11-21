import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MapPage from './components/pages/MapPage';
import AlmanacPage from './components/pages/AlmanacPage';
import CharactersPage from './components/pages/CharactersPage';
import WorldRaces from './components/pages/WorldRaces';
import AdminDashboard from './components/pages/AdminDashboard';
import LocationsAtlasPage from './components/pages/LocationsAtlasPage';
import LocationsEditorPage from './components/pages/LocationsEditorPage';
import Header from './components/UI/Header';
import PageLayout from './components/UI/PageLayout';
import './components/UI/PageUI.css';

// Placeholder components for missing tabs
const Placeholder = ({ title }) => (
  <div className="text-center p-10 text-2xl text-[#f5e5c980] italic border border-[#d4af3733] rounded-xl bg-[#00000033]">
    {title} Content Coming Soon
  </div>
);

function App() {
  return (
    <Router basename='/p15/'>
      <Header />
      <Routes>
        {/* 1. Map (Default Home) */}
        <Route path="/" element={<MapPage />} />
        <Route path="/map" element={<Navigate to="/" replace />} />

        {/* 2. Azterra (Almanac) */}
        <Route path="/azterra" element={<PageLayout title="Azterra" tabs={[
          { to: "", label: "Almanac", end: true },
          { to: "geography", label: "Geography" },
        ]} />}>
          <Route index element={<AlmanacPage />} />
          <Route path="geography" element={<Placeholder title="Geography" />} />
        </Route>

        {/* 3. Locations */}
        <Route path="/locations" element={<PageLayout title="Locations" tabs={[
          { to: "", label: "Atlas", end: true },
          { to: "editor", label: "Editor" },
        ]} />}>
          <Route index element={<LocationsAtlasPage />} />
          <Route path="editor" element={<LocationsEditorPage />} />
        </Route>

        {/* 4. People */}
        <Route path="/people" element={<PageLayout title="People of Azterra" tabs={[
          { to: "", label: "Races", end: true },
          { to: "factions", label: "Factions" },
          { to: "cultures", label: "Cultures" },
        ]} />}>
          <Route index element={<WorldRaces />} />
          <Route path="factions" element={<Placeholder title="Factions" />} />
          <Route path="cultures" element={<Placeholder title="Cultures" />} />
        </Route>

        {/* 5. Magic & Lore */}
        <Route path="/magic" element={<PageLayout title="Magic & Lore" tabs={[
          { to: "", label: "Magic System", end: true },
          { to: "deities", label: "Deities" },
          { to: "monsters", label: "Monsters" },
        ]} />}>
          <Route index element={<Placeholder title="Magic System" />} />
          <Route path="deities" element={<Placeholder title="Deities" />} />
          <Route path="monsters" element={<Placeholder title="Monsters" />} />
        </Route>

        {/* 6. Campaign */}
        <Route path="/campaign" element={<PageLayout title="Campaign" tabs={[
          { to: "", label: "Characters", end: true },
          { to: "logbook", label: "Logbook" },
          { to: "inventory", label: "Inventory" },
        ]} />}>
          <Route index element={<CharactersPage />} />
          <Route path="logbook" element={<Placeholder title="Logbook" />} />
          <Route path="inventory" element={<Placeholder title="Inventory" />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
export default App;
