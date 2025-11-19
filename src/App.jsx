import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InteractiveMap from './components/map/InteractiveMap';
import AlmanacPage from './components/pages/AlmanacPage';
import CharactersPage from './components/pages/CharactersPage';
import WorldRaces from './components/pages/WorldRaces';
import Header from './components/UI/Header';

function App() {
  return (
    <Router basename='/p15'>
      <Header />
      <Routes>
        <Route path="/" element={<InteractiveMap />} />
        <Route path="/almanac" element={<AlmanacPage />} />
        <Route path="/world" element={<WorldRaces />} />
        <Route path="/characters" element={<CharactersPage />} />
      </Routes>
    </Router>
  );
}
export default App;
