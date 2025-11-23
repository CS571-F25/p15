import React, { useMemo, useState } from 'react';
import { useLocationData } from '../../context/LocationDataContext';
import { useRegions } from '../../context/RegionDataContext';
import './LocationsAtlasPage.css';

const SECTION_CONFIG = [
  {
    id: 'kingdoms',
    title: 'Kingdoms & Capitals',
    subtitle: 'Seat of power, trade, and intrigue.',
    accent: '#facc15',
    keywords: ['city', 'capital', 'citadel', 'kingdom', 'harbor', 'port', 'town'],
    icon: 'K',
  },
  {
    id: 'dungeons',
    title: 'Dungeons & Vaults',
    subtitle: 'Forgotten halls that hoard danger and treasure alike.',
    accent: '#f472b6',
    keywords: ['dungeon', 'ruins', 'vault', 'crypt', 'catacomb', 'cavern', 'lair', 'temple'],
    icon: 'D',
  },
  {
    id: 'regions',
    title: 'Regions & Landmarks',
    subtitle: 'Defining features that shape the realm.',
    accent: '#60a5fa',
    keywords: ['region', 'landmark', 'forest', 'grove', 'mountain', 'library', 'tower', 'harbor'],
    icon: 'R',
  },
  {
    id: 'wilds',
    title: 'Monsters & Wilds',
    subtitle: 'Unruly frontiers and creatures that haunt them.',
    accent: '#34d399',
    keywords: ['monster', 'beast', 'dragon', 'wyrm', 'den', 'nest', 'jungle', 'wild'],
    icon: 'W',
  },
];

const normalize = (value = '') => value.toLowerCase();

const buildSearchHaystack = (location) => {
  const base = [
    location.type,
    location.category,
    location.subtype,
    location.name,
    location.description,
    location.lore,
  ];
  if (Array.isArray(location.tags)) {
    base.push(location.tags.join(' '));
  }
  return base
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
};

const pickDisplayImage = (location) => {
  const candidates = [location.heroImage, location.imageUrl, location.cover, location.banner];
  const found = candidates.find(Boolean);
  if (found) {
    const base = import.meta.env.BASE_URL || '/';
    return found.startsWith('http') ? found : `${base}${found.replace(/^\//, '')}`;
  }
  return null;
};

export default function LocationsAtlasPage() {
  const { locations } = useLocationData();
  const { regions = [] } = useRegions();
  const [openSection, setOpenSection] = useState(() => SECTION_CONFIG[0].id);
  const [expandedLocationId, setExpandedLocationId] = useState(null);

  const regionLookup = useMemo(() => {
    const map = new Map();
    regions.forEach((region) => {
      map.set(String(region.id), region.name);
    });
    return map;
  }, [regions]);

  const sections = useMemo(() => {
    const haystacks = new Map();
    return SECTION_CONFIG.map((section) => {
      const sectionLocations = locations.filter((location) => {
        if (!location) return false;
        const typeMatch = normalize(location.type);
        if (section.keywords.some((keyword) => typeMatch.includes(keyword))) {
          return true;
        }
        let haystack = haystacks.get(location.id);
        if (!haystack) {
          haystack = buildSearchHaystack(location);
          haystacks.set(location.id, haystack);
        }
        return section.keywords.some((keyword) => haystack.includes(keyword));
      });
      return {
        ...section,
        locations: sectionLocations,
      };
    });
  }, [locations]);

  const toggleSection = (id) => {
    setOpenSection((current) => {
      const next = current === id ? null : id;
      if (next !== current) {
        setExpandedLocationId(null);
      }
      return next;
    });
  };

  const toggleLocation = (id) => {
    setExpandedLocationId((current) => (current === id ? null : id));
  };

  return (
    <div className="locations-atlas">
      <header className="locations-atlas__hero">
        <p className="eyebrow">World Atlas</p>
        <h1>A curated look at Azterra&apos;s most storied places.</h1>
        <p className="lede">
          Tap a realm to unfurl its tales. Every card draws directly from the interactive map but
          presents it in a gallery meant for readers, not cartographers.
        </p>
      </header>

      <div className="locations-atlas__sections">
        {sections.map((section) => (
          <article key={section.id} className="atlas-section">
            <button
              type="button"
              className={`atlas-section__header ${
                openSection === section.id ? 'atlas-section__header--open' : ''
              }`}
              onClick={() => toggleSection(section.id)}
              style={{ borderColor: section.accent }}
            >
              <span className="atlas-section__icon" aria-hidden="true">
                {section.icon}
              </span>
              <div>
                <h2>{section.title}</h2>
                <p>{section.subtitle}</p>
              </div>
              <span className="atlas-section__badge">{section.locations.length}</span>
            </button>
            {openSection === section.id && (
              <div className="atlas-section__body">
                {section.locations.length ? (
                  <div className="atlas-gallery">
                    {section.locations.map((location) => {
                      const isExpanded = expandedLocationId === location.id;
                      const img = pickDisplayImage(location);
                      const regionName =
                        regionLookup.get(String(location.regionId)) || 'Uncharted Region';
                      return (
                        <div
                          key={location.id}
                          className={`atlas-card ${isExpanded ? 'atlas-card--expanded' : ''}`}
                        >
                          <button
                            type="button"
                            className="atlas-card__trigger"
                            onClick={() => toggleLocation(location.id)}
                            aria-expanded={isExpanded}
                          >
                            <div
                              className="atlas-card__media"
                              style={
                                img
                                  ? { backgroundImage: `url(${img})` }
                                  : undefined
                              }
                              data-placeholder={!img}
                            >
                              {!img && <span>{section.icon}</span>}
                            </div>
                            <div className="atlas-card__meta">
                              <p className="atlas-card__eyebrow">{regionName}</p>
                              <h3>{location.name}</h3>
                              <p className="atlas-card__type">{location.type || 'Unknown type'}</p>
                            </div>
                            <span className="atlas-card__chevron" aria-hidden="true">
                              v
                            </span>
                          </button>
                          {isExpanded && (
                            <div className="atlas-card__details">
                              <p>{location.description || location.lore || 'No description yet.'}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="atlas-section__empty">No entries yet. Check back soon!</p>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
