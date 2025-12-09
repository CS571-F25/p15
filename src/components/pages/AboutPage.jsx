import React from 'react';
import './AboutPage.css';

const originStoryParagraphs = [
  'Azterra did not begin as a grand project. It started with a group of freshmen at UW-Madison, escaping the cold Wisconsin winter in the 3rd-floor lounge of Dejope Residence Hall. What began as late-night hangouts slowly evolved into something much bigger.',
  'As the days shortened and the wind dragged people indoors, we filled the whiteboards with doodles - maps, ideas, small made-up games to pass the time. Those drawings became stories. The stories became heroes. And before long, someone said: "What if we actually tried Dungeons & Dragons?" So we did. Badly at first.',
  'None of us really followed the rulebook. We made characters that did not make sense, created spells that absolutely should not exist, and invented mechanics that would make a real DM cry. But it did not matter. We played, we laughed, and slowly a world began to form. That world was Azterra.',
  'What started as a few whiteboard sketches turned into weekly sessions. Then twice a week. Then - during the last stretch of spring semester - three times a week. By the end, it felt like the entire floor knew about our game. Friends stopped by to watch. People took on NPC roles. Some sessions ran from 6 or 7 PM until 4 in the morning, long after the dorm had fallen silent.',
  'Our final session of the year was unforgettable. A moral dilemma split the party. Allies turned on each other. And one of our own became a villain - because the player had to leave for military service in Korea, and we needed a farewell written in story. It was chaotic, emotional, and perfect.',
  'When the school year ended, Azterra did not. The world stayed alive through summer campaigns, new characters, and new stories. And when we returned in the fall, many of us were now CS majors - including the ones who could not stop imagining how this could become something more.',
  'In CS 571, we were given a golden opportunity to expand Azterra. We built tools for worldbuilding. We built a map system we had dreamed about since those whiteboard days. We built a place where our stories, characters, and campaigns could actually live.',
  'Azterra is still growing. It started with nine friends around a table, and now it is turning into a home for anyone who loves storytelling, adventure, and building worlds together. And we are just getting started.',
];

export default function AboutPage() {
  return (
    <div className="about-page custom-scrollbar">
      <div className="about-sheen" aria-hidden="true" />
      <section className="about-hero">
        <div className="about-hero__eyebrow">About</div>
        <h1 className="about-hero__title">THE STORY BEHIND AZTERRA</h1>
        <p className="about-hero__lead">
          A world born in a lounge on the third floor of Dejope.
        </p>
        <div className="about-hero__cta-row">
          <div className="about-badge">Handcrafted campaign setting</div>
          <div className="about-badge about-badge--ghost">Updated as the story evolves</div>
        </div>
      </section>

      <section className="about-section about-section--soft about-story" id="story">
        <div className="about-story__narrative">
          {originStoryParagraphs.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="about-section">
        <div className="about-section__header">
          <p className="about-eyebrow">Credits</p>
          <h2 className="about-title">Made by friends at the table</h2>
          <p className="about-subtitle">
            Co-created by a DM and a fellow player, both builders of the site that keeps Azterra alive.
          </p>
        </div>
        <div className="about-grid">
          <article className="about-card">
            <div className="about-card__shine" aria-hidden="true" />
            <h3>Nick Galles</h3>
            <p>Dungeon Master, worldbuilder, and co-builder of the Azterra site.</p>
            <p>Email: <a href="mailto:nicholasmgalles@gmail.com">nicholasmgalles@gmail.com</a></p>
            <p>Discord: Nickflix</p>
          </article>
          <article className="about-card">
            <div className="about-card__shine" aria-hidden="true" />
            <h3>Ryan Pratt</h3>
            <p>Player, developer, and co-builder keeping Azterra running online.</p>
            <p>Email: <a href="mailto:ryanpratt16@outlook.com">ryanpratt16@outlook.com</a></p>
            <p>Discord: velere.</p>
          </article>
        </div>
      </section>

      <section className="about-section about-section--soft">
        <div className="about-section__header">
          <p className="about-eyebrow">Join in</p>
          <h2 className="about-title">We save a seat for every explorer</h2>
          <p className="about-subtitle">
            Whether you are a Dungeon Master planning the next arc or a player dreaming up a hero, Azterra gives you a place to store, share, and grow your stories together.
          </p>
        </div>
        <div className="about-highlight">
          <div>
            <h3>Bring your own legend</h3>
            <p>
              Sketch a map, drop landmarks, write lore, or track characters - everything stays connected so your table can keep playing even when schedules or cities change.
            </p>
          </div>
          <div className="about-highlight__cta">Start your next session here</div>
        </div>
      </section>

      <section className="about-section" id="map">
        <div className="about-section__header">
          <p className="about-eyebrow">Cartography</p>
          <h2 className="about-title">How the map and editor work</h2>
          <p className="about-subtitle">
            The Map tab opens directly to the canvas: drag to explore, hold Shift while scrolling to zoom, and click pins to read lore. Switch the Editor toggle to drop regions, rename landmarks, and sync them to your Atlas entries.
          </p>
        </div>
        <div className="about-grid">
          <article className="about-card">
            <div className="about-card__shine" aria-hidden="true" />
            <h3>Player-safe view</h3>
            <p>Keep spoilers hidden while players browse. Editor off means only public notes show.</p>
          </article>
          <article className="about-card">
            <div className="about-card__shine" aria-hidden="true" />
            <h3>Live region overlays</h3>
            <p>Regions you add on the map populate the Atlas so you can reference them in character sheets or sessions.</p>
          </article>
          <article className="about-card">
            <div className="about-card__shine" aria-hidden="true" />
            <h3>Session flow</h3>
            <p>Prep ahead by bookmarking coordinates and moving between hotspots as the party travels.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
