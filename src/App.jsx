import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MapPage from './components/pages/MapPage';
import AlmanacPage from './components/pages/AlmanacPage';
import CharactersPage from './components/pages/CharactersPage';
import WorldRaces from './components/pages/WorldRaces';
import AdminDashboard from './components/pages/AdminDashboard';
import LocationsAtlasPage from './components/pages/LocationsAtlasPage';
import LocationsEditorPage from './components/pages/LocationsEditorPage';
import AccountSettingsPage from './components/pages/AccountSettingsPage';
import ProgressionPage from './components/pages/ProgressionPage';
import LorePlaceholderPage from './components/pages/lore/LorePlaceholderPage';
import PlayersPage from './components/pages/PlayersPage';
import PlayerPublicPage from './components/pages/PlayerPublicPage';
import DashboardPage from './components/pages/DashboardPage';
import AboutPage from './components/pages/AboutPage';
import PeoplePage from './components/pages/ViewingPage';
import AdminEntitiesPage from './components/pages/AdminEntitiesPage';
import RegionDetailPage from './components/pages/RegionDetailPage';
import LocationDetailPage from './components/pages/LocationDetailPage';
import LoginPage from './components/pages/LoginPage';
import SignupPage from './components/pages/SignupPage';
import Header from './components/UI/Header';
import PageLayout from './components/UI/PageLayout';
import './components/UI/PageUI.css';
import AuthCallback from './components/auth/AuthCallback';
import AuthLandingPage from './components/pages/AuthLandingPage';

// Placeholder components for missing tabs
const Placeholder = ({ title }) => (
  <div className="text-center p-10 text-2xl text-[#f5e5c980] italic border border-[#d4af3733] rounded-xl bg-[#00000033]">
    {title} Content Coming Soon
  </div>
);

function HashApp() {
  return (
    <HashRouter>
      <div className="app-shell">
        <Header />
        <main className="app-content">
          <Routes>
            {/* 1. Map (Default Home) */}
            <Route path="/" element={<MapPage />} />
            <Route path="/map" element={<Navigate to="/" replace />} />

            {/* About */}
            <Route path="/about" element={<AboutPage />} />

            {/* 2. CAMPAIGN (Simplified) */}
            <Route path="/campaign" element={<CharactersPage />} />

            {/* 3. ATLAS (Promoted to its own top-level view) */}
            <Route path="/atlas" element={<PageLayout title="World Atlas" tabs={[
                { to: "", label: "View Map", end: true },
                { to: "editor", label: "Map Editor" },
            ]} />}>
                <Route index element={<LocationsAtlasPage />} />
                <Route path="editor" element={<LocationsEditorPage />} />
            </Route>

            {/* 4. COMPENDIUM (The Big Merge) */}
            {/* We merge People, Magic, and Almanac here to clean up the Sidebar */}
            <Route path="/compendium" element={<PageLayout title="Azterra Compendium" tabs={[
                { to: "", label: "Almanac", end: true }, // General History
                { to: "societies", label: "Societies" }, // Races, Factions, Cultures
                { to: "cosmos", label: "Cosmos" },       // Magic, Deities
            ]} />}>
                <Route index element={<AlmanacPage />} />
                <Route path="societies" element={<WorldRaces />} /> {/* Merge Factions here too? */}
                <Route path="cosmos" element={<Placeholder title="Magic System" />} />
            </Route>

            {/* Progression */}
            <Route path="/progress" element={<ProgressionPage />} />

            {/* Hidden Lore (PLACEHOLDER) */}
            <Route path="/lore/aurora-ember" element={<LorePlaceholderPage secretId="aurora-ember" />} />
            <Route path="/lore/silent-archive" element={<LorePlaceholderPage secretId="silent-archive" />} />
            <Route path="/lore/gilded-horizon" element={<LorePlaceholderPage secretId="gilded-horizon" />} />

            {/* Account & Auth */}
            <Route path="/account" element={<AccountSettingsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auth/callback" element={<AuthLandingPage />} />

            {/* Players */}
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/players/:id" element={<PlayerPublicPage />} />

            {/* People (formerly Viewing) */}
            <Route path="/people" element={<PeoplePage />} />
            <Route path="/viewing" element={<Navigate to="/people" replace />} />

            {/* Admin Entities */}
            <Route path="/admin/entities" element={<AdminEntitiesPage />} />

            {/* Detail pages */}
            <Route path="/region/:id" element={<RegionDetailPage />} />
            <Route path="/location/:id" element={<LocationDetailPage />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

function App() {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const isAuthCallback =
    typeof window !== 'undefined' && window.location.pathname === `${base}/auth/callback`;

  if (isAuthCallback) {
    return (
      <BrowserRouter basename={base || '/'}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return <HashApp />;
}
export default App;
