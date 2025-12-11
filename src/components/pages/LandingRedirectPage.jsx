import React from 'react';

function LandingRedirectPage() {
  return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div
        style={{
          background: 'linear-gradient(145deg, rgba(17,24,39,0.9), rgba(12,19,33,0.95))',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 16,
          padding: '28px 24px',
          maxWidth: 520,
          textAlign: 'center',
          color: '#e5e7eb',
          boxShadow: '0 15px 40px rgba(0,0,0,0.35)',
        }}
      >
        <h1 style={{ margin: '0 0 12px', fontSize: 26 }}>Azterra has moved</h1>
        <p style={{ margin: '0 0 18px', color: '#9ca3af', lineHeight: 1.5 }}>
          We now host the live experience on Netlify. Continue to the new home below.
        </p>
        <a
          href="https://azterra.netlify.app"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 18px',
            borderRadius: 12,
            background: '#f59e0b',
            color: '#0b0b0b',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 12px 28px rgba(245,158,11,0.28)',
          }}
        >
          Go to azterra.netlify.app
        </a>
      </div>
    </div>
  );
}

export default LandingRedirectPage;
