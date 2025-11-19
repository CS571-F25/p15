import React from 'react';
import '../UI/CharactersPage.css';
import ShaderBackground from '../visuals/ShaderBackground';

const featuredLocations = [
  {
    name: 'Silverwake Citadel',
    type: 'Capital Stronghold',
    blurb:
      'A gleaming fortress where Azterra’s council gathers. The marble courtyards shimmer beneath the astral veil.',
  },
  {
    name: 'Evershade Wilds',
    type: 'Primordial Forest',
    blurb:
      'Ancient trees whisper rites of the First Druids. Spirits guide travelers who respect the woodland accord.',
  },
  {
    name: 'Starforged Observatory',
    type: 'Arcane Watchtower',
    blurb:
      'A lone spire that tracks the movements of twin moons. Seers interpret omens for guilds across the realm.',
  },
];

export default function AlmanacPage() {
  return (
    <div className="characters-page almanac-layout">
      <ShaderBackground />
      <div className="sun-overlay" aria-hidden="true" />
      <h1 className="page-title">Almanac of Azterra</h1>
      <section className="almanac-content">
        {featuredLocations.map((location) => (
          <article key={location.name} className="almanac-card">
            <header>
              <p className="almanac-type">{location.type}</p>
              <h2>{location.name}</h2>
            </header>
            <p>{location.blurb}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
