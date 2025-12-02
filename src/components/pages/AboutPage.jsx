import React from 'react';
import './AboutPage.css';

const highlights = [
  {
    title: 'Worldbuilding',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor sed dignissim.',
  },
  {
    title: 'Campaign Vision',
    body: 'Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.',
  },
  {
    title: 'Community',
    body: 'In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium.',
  },
];

const timeline = [
  {
    label: 'The Map',
    detail: 'Our Map is the foundation of Azterra. We wanted this to be something you could use for any campaign, but this website also lets you build your own. This main map allows you to create your own campaign map using our prebuilt regions. To do this, simply log in and start editing! If you want to create your own map, you can do so by clicking on the "Create New Map" button in the top right corner. It will be stored and accessible within the Map tab.',
  },
  {
    label: 'The Campaign',
    detail: 'Our Campaign is the heart of Azterra. This is something we are still working on, but we are excited to see where it goes. This is simply our way of showing our inspiration for Azterra. If you want to create your own campaign, you can do so by clicking on the "Create New Campaign" button in the top right corner. It will be stored and accessible within the Campaign tab later on.',
  },
  {
    label: 'The Whole',
    detail: 'The whole of this website is for Dungeons & Dragons. We intended to make this website as a one place for information, campaign creation, and a place for community with our soon to be added features for sharing your campaign for others to see!',
  },
];

export default function AboutPage() {
  return (
    <div className="about-page custom-scrollbar">
      <div className="about-sheen" aria-hidden="true" />
      <section className="about-hero">
        <div className="about-hero__eyebrow">About</div>
        <h1 className="about-hero__title">The Story Behind Azterra</h1>
        <p className="about-hero__lead">
          Welcome to Azterra! A home for Dungeon Masters to create and share their campaigns and maps with their players and the community.
        </p>
        <div className="about-hero__cta-row">
          <div className="about-badge">Handcrafted campaign setting</div>
          <div className="about-badge about-badge--ghost">Updated as the story evolves</div>
        </div>
      </section>

      <section className="about-section">
        <div className="about-section__header">
          <p className="about-eyebrow">What to know</p>
          <h2 className="about-title">Who we are &amp; what we are building</h2>
          <p className="about-subtitle">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae sapien ut libero venenatis faucibus.
            Maecenas nec odio et ante tincidunt tempus.
          </p>
        </div>
        <div className="about-grid">
          {highlights.map((item) => (
            <article key={item.title} className="about-card">
              <div className="about-card__shine" aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section">
        <div className="about-section__header about-section__header--inline">
          <div>
            <p className="about-eyebrow">Creating</p>
            <h2 className="about-title">How to use Azterra</h2>
          </div>
          {/*<]div className="about-badge"></div>*/}
        </div>
        <div className="about-timeline">
          {timeline.map((item) => (
            <div key={item.label} className="about-timeline__item">
              <div className="about-timeline__dot" />
              <div className="about-timeline__content">
                <h3>{item.label}</h3>
                <p>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section about-section--soft">
        <div className="about-section__header">
          <p className="about-eyebrow">Join in</p>
          <h2 className="about-title">We save a seat for every explorer</h2>
          <p className="about-subtitle">
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.
            Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
          </p>
        </div>
        <div className="about-highlight">
          <div>
            <h3>Bring your own legend</h3>
            <p>
              Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.
              Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.
            </p>
          </div>
          <div className="about-highlight__cta">Lorem ipsum sit amet</div>
        </div>
      </section>
    </div>
  );
}
