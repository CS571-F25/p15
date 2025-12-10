import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MAGIC_SYSTEMS, getMagicSystem } from '../../data/magicSystems';
import './MagicPage.css';
import { useAuth } from '../../context/AuthContext';
import MagicSparkles from './MagicSparkles';
import ShaderBackground from '../visuals/ShaderBackground';

function InteractiveDukeTree({ god, color }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 900 });
  const [positions, setPositions] = useState({});
  const [expanded, setExpanded] = useState({});
  const positionsRef = useRef({});
  const velocitiesRef = useRef({});
  const [driftSeed] = useState(() => Math.random() * 1000);
  const nodes = useMemo(() => {
    const root = { id: `${god.name}-root`, name: god.name, effect: god.description, isRoot: true };
    const children = (god.entries || []).map((entry, idx) => ({
      id: `${god.name}-${entry.name}-${idx}`,
      name: entry.name,
      effect: entry.effect,
      lockedHint: god.lockedHint,
    }));
    return [root, ...children];
  }, [god]);

  useEffect(() => {
    const updateDims = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height || 520 });
    };
    updateDims();
    window.addEventListener('resize', updateDims);
    return () => window.removeEventListener('resize', updateDims);
  }, []);

  useEffect(() => {
    if (!dimensions.width) return;
    const rootY = 60;
    const rowY = 320;
    const spacing = 220;
    const centerX = dimensions.width / 2;
    const childCount = nodes.length - 1;
    const startX = centerX - ((childCount - 1) * spacing) / 2;
    const nextPositions = {};
    nodes.forEach((node, idx) => {
      if (node.isRoot) {
        nextPositions[node.id] = { x: centerX, y: rootY };
      } else {
        const childIndex = idx - 1;
        nextPositions[node.id] = {
          x: startX + childIndex * spacing,
          y: rowY + (childIndex % 2 === 0 ? -40 : 60),
        };
      }
    });
    setPositions(nextPositions);
    positionsRef.current = nextPositions;
    velocitiesRef.current = nodes.reduce((acc, node) => {
      acc[node.id] = { vx: 0, vy: 0 };
      return acc;
    }, {});
  }, [dimensions.width, nodes]);

  const [dragging, setDragging] = useState(null);

  const onPointerDown = (id) => (event) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pos = positions[id] || { x: 0, y: 0 };
    const offsetX = event.clientX - (rect.left + pos.x);
    const offsetY = event.clientY - (rect.top + pos.y);
    setDragging({ id, offsetX, offsetY });
  };

  const onPointerMove = (event) => {
    if (!dragging || dragging.id.endsWith('-root')) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = event.clientX - rect.left - dragging.offsetX;
    const y = event.clientY - rect.top - dragging.offsetY;
    setPositions((prev) => ({
      ...prev,
      [dragging.id]: {
        x: Math.min(Math.max(x, 20), rect.width - 120),
        y: Math.min(Math.max(y, 80), rect.height - 80),
      },
    }));
  };

  const onPointerUp = () => setDragging(null);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const root = nodes.find((n) => n.isRoot);
  const children = nodes.filter((n) => !n.isRoot);

  const getBoxSize = (node, isExpanded) => {
    if (node.isRoot) return { w: 240, h: isExpanded ? 220 : 120 };
    if (isExpanded) return { w: 280, h: 220 };
    return { w: 180, h: 110 };
  };

  const getCenter = (node, pos) => {
    const size = getBoxSize(node, expanded[node.id]);
    return { x: (pos?.x || 0) + size.w / 2, y: (pos?.y || 0) + size.h / 2 };
  };

  const computeAnchors = () => {
    const anchors = {};
    const rootPos = positions[root.id] || { x: 0, y: 0 };
    const rootSize = getBoxSize(root, false);
    const rootCenter = getCenter(root, rootPos);
    const count = children.length || 1;
    const angleStart = -Math.PI / 2;
    const angleStep = (Math.PI * 2) / count;
    children.forEach((child, idx) => {
      const childPos = positions[child.id] || { x: 0, y: 0 };
      const childSize = getBoxSize(child, expanded[child.id]);
      const angle = angleStart + idx * angleStep;
      const start = {
        x: rootCenter.x + Math.cos(angle) * (Math.min(rootSize.w, rootSize.h) / 2),
        y: rootCenter.y + Math.sin(angle) * (Math.min(rootSize.w, rootSize.h) / 2),
      };
      const childCenter = getCenter(child, childPos);
      // pick anchor on child edge facing start
      const dx = start.x - childCenter.x;
      const dy = start.y - childCenter.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      let end = { x: childCenter.x, y: childCenter.y };
      if (absDx > absDy) {
        end.x = childCenter.x + (dx > 0 ? childSize.w / 2 : -childSize.w / 2);
        end.y = childCenter.y + (dy / (absDx || 1)) * (childSize.h / 2);
      } else {
        end.y = childCenter.y + (dy > 0 ? childSize.h / 2 : -childSize.h / 2);
        end.x = childCenter.x + (dx / (absDy || 1)) * (childSize.w / 2);
      }
      const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
      const ctrl = { x: mid.x - dy * 0.25, y: mid.y + dx * 0.25 };
      anchors[child.id] = { start, end, ctrl };
    });
    return anchors;
  };

  const anchors = computeAnchors();
  const noiseTimeRef = useRef(0);

  useEffect(() => {
    positionsRef.current = positions;
  }, [positions]);

  useEffect(() => {
    let raf;
    const simulate = () => {
      const current = { ...positionsRef.current };
      const velocities = { ...velocitiesRef.current };
      const w = dimensions.width || 1000;
      const h = dimensions.height || 900;
      const margin = 32;

      const ids = Object.keys(current);
      ids.forEach((id) => {
        if (!velocities[id]) velocities[id] = { vx: 0, vy: 0 };
      });

      // Separation + boundary
      ids.forEach((id, i) => {
        const posA = current[id];
        const sizeA = getBoxSize(nodes.find((n) => n.id === id), expanded[id]);
        const radA = Math.max(sizeA.w, sizeA.h) / 2;
        const velA = velocities[id];
        const isRoot = nodes.find((n) => n.id === id)?.isRoot;
        if (isRoot) {
          // gently return to center horizontally
          const centerX = w / 2;
          const centerY = 120;
          velA.vx += (centerX - posA.x) * 0.0025;
          velA.vy += (centerY - posA.y) * 0.0025;
        }

        // Bounds
        const leftOverlap = margin - (posA.x - radA);
        const rightOverlap = (posA.x + radA) - (w - margin);
        const topOverlap = margin - (posA.y - radA);
        const bottomOverlap = (posA.y + radA) - (h - margin);
        const boundaryForce = isRoot ? 0.02 : 0.08;
        if (leftOverlap > 0) velA.vx += boundaryForce * leftOverlap;
        if (rightOverlap > 0) velA.vx -= boundaryForce * rightOverlap;
        if (topOverlap > 0) velA.vy += boundaryForce * topOverlap;
        if (bottomOverlap > 0) velA.vy -= boundaryForce * bottomOverlap;

        for (let j = i + 1; j < ids.length; j += 1) {
          const idB = ids[j];
          const posB = current[idB];
          const sizeB = getBoxSize(nodes.find((n) => n.id === idB), expanded[idB]);
          const radB = Math.max(sizeB.w, sizeB.h) / 2;
          const dx = posB.x - posA.x;
          const dy = posB.y - posA.y;
          const dist = Math.max(Math.hypot(dx, dy), 0.001);
          const minDist = radA + radB + 24;
          if (dist < minDist) {
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;
            const push = overlap * 0.05;
            velocities[id].vx -= nx * push * (isRoot ? 0.35 : 1);
            velocities[id].vy -= ny * push * (isRoot ? 0.35 : 1);
            velocities[idB].vx += nx * push;
            velocities[idB].vy += ny * push;
          }
        }
      });

      // Drift, friction, integrate
      noiseTimeRef.current += 0.016;
      ids.forEach((id, idx) => {
        const v = velocities[id];
        const noise = 0.12;
        const isRoot = nodes.find((n) => n.id === id)?.isRoot;
        const t = noiseTimeRef.current;
        v.vx += Math.sin(driftSeed + t * 0.25 + idx) * noise * (isRoot ? 0.15 : 0.6);
        v.vy += Math.cos(driftSeed + t * 0.28 + idx * 0.4) * noise * (isRoot ? 0.15 : 0.6);
        // viscous damping for "thick liquid"
        const damping = isRoot ? 0.97 : 0.94;
        v.vx *= damping;
        v.vy *= damping;
        const speed = Math.hypot(v.vx, v.vy);
        const maxSpeed = isRoot ? 1.2 : 2.5;
        if (speed > maxSpeed) {
          v.vx = (v.vx / speed) * maxSpeed;
          v.vy = (v.vy / speed) * maxSpeed;
        }
        current[id] = {
          x: current[id].x + v.vx,
          y: current[id].y + v.vy,
        };
      });

      positionsRef.current = current;
      velocitiesRef.current = velocities;
      setPositions(current);
      raf = requestAnimationFrame(simulate);
    };
    raf = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(raf);
  }, [nodes, dimensions.width, dimensions.height, expanded, driftSeed]);

  return (
    <div
      className="magic-tree-playground"
      ref={containerRef}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      style={{ '--branch-accent': color }}
    >
      <div className="magic-tree-bg" />
      <svg className="magic-tree-lines" aria-hidden="true">
        {children.map((child) => {
          const a = anchors[child.id];
          if (!a) return null;
          return (
            <path
              key={child.id}
              d={`M ${a.start.x} ${a.start.y} Q ${a.ctrl.x} ${a.ctrl.y} ${a.end.x} ${a.end.y}`}
              fill="none"
              stroke={color}
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeOpacity="0.75"
              strokeDasharray="2 0"
            />
          );
        })}
      </svg>
      {nodes.map((node) => {
        const pos = positions[node.id] || { x: 0, y: 0 };
        const isExpanded = expanded[node.id];
        const size = getBoxSize(node, isExpanded);
        const labelInitial = node.name?.[0] || '?';
        return (
          <div
            key={node.id}
            className={`magic-draggable ${node.isRoot ? 'magic-draggable--root' : ''} ${isExpanded ? 'magic-draggable--expanded' : ''}`}
            style={{ '--tx': `${pos.x}px`, '--ty': `${pos.y}px`, width: `${size.w}px`, height: `${size.h}px` }}
            onPointerDown={onPointerDown(node.id)}
            onClick={() => !node.isRoot && toggleExpand(node.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => !node.isRoot && e.key === 'Enter' && toggleExpand(node.id)}
          >
            <div className="magic-draggable__handle" />
            <div className="magic-draggable__icon" aria-hidden="true">{labelInitial}</div>
            <div className="magic-draggable__title">{node.name}</div>
            {node.isRoot && <div className="magic-draggable__subtitle">{god.aura}</div>}
            {node.lockedHint && <div className="magic-draggable__hint">{node.lockedHint}</div>}
            {isExpanded && !node.isRoot && (
              <div className="magic-draggable__body">
                <p>{node.effect}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function MagicSystemPage() {
  const { id } = useParams();
  const system = getMagicSystem(id) || MAGIC_SYSTEMS[0];
  const isGods = system.id === 'gods';
  const { isSecretUnlocked } = useAuth();
  const locked = system.secretId && !isSecretUnlocked(system.secretId);
  const [selectedGod, setSelectedGod] = useState('kaya');
  const activeGod = isGods ? system.dukes[selectedGod] : null;

  const godTheme = isGods
    ? selectedGod === 'kaya'
      ? {
          primary: system.dukes.kaya.color,
          accent: '#d97706',
          secondary: '#fef8eb',
          background: 'linear-gradient(135deg, #fff7eb 0%, #ffe9c7 45%, #ffdca3 100%)',
          pageBackground: 'radial-gradient(circle at 18% 22%, rgba(255, 205, 120, 0.25) 0, transparent 35%), radial-gradient(circle at 82% 10%, rgba(255, 163, 64, 0.25) 0, transparent 40%), linear-gradient(140deg, #fff7eb 0%, #ffefd5 50%, #ffe3b8 100%)',
          card: 'rgba(255, 255, 255, 0.82)',
          text: '#1f1305',
          muted: '#3b2410',
          playground: 'linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.55))',
          heroTitle: '#8b4000',
        }
      : {
          primary: system.dukes.krovi.color,
          accent: '#c7e0ff',
          secondary: '#050914',
          background: 'linear-gradient(135deg, #050914 0%, #0a1020 45%, #02060f 100%)',
          pageBackground: undefined,
          card: 'rgba(255, 255, 255, 0.06)',
          text: '#f5e5c9',
          muted: 'rgba(245, 229, 201, 0.78)',
          playground: undefined,
          heroTitle: '#dbeafe',
        }
    : null;

  const themeStyle = useMemo(
    () => ({
      '--magic-primary': isGods ? godTheme.primary : system.colors.primary,
      '--magic-secondary': isGods ? godTheme.secondary : system.colors.secondary,
      '--magic-accent': isGods ? godTheme.accent : system.colors.accent,
      '--magic-card': isGods ? (godTheme.card || system.colors.card) : system.colors.card,
      '--magic-bg': isGods ? (godTheme.pageBackground || godTheme.background) : system.colors.background,
      '--magic-bg-color': isGods ? (godTheme.backgroundColor || (selectedGod === 'kaya' ? '#fff7eb' : '#050914')) : (system.colors.secondary || '#0c0b0f'),
      '--magic-text': isGods ? godTheme.text : undefined,
      '--magic-muted': isGods ? godTheme.muted : undefined,
      '--magic-playground-bg': isGods ? godTheme.playground : undefined,
      '--magic-hero-title': isGods ? godTheme.heroTitle : undefined,
    }),
    [system, isGods, godTheme, selectedGod]
  );

  return (
    <div className={`magic-page custom-scrollbar ${isGods ? `magic-page--${selectedGod}` : ''}`} style={themeStyle}>
      <MagicSparkles
        className="magic-sparkles--ambient"
        variant={isGods && selectedGod === 'krovi' ? 'stars' : 'twinkle'}
        count={isGods && selectedGod === 'krovi' ? 30 : 28}
        color={isGods && selectedGod === 'krovi' ? '#c7e0ff' : undefined}
        accent={isGods && selectedGod === 'krovi' ? '#7dd3fc' : undefined}
      />
      {isGods && selectedGod === 'kaya' && (
        <div className="magic-feature magic-feature--sun">
          <div className="magic-feature__sun-glow" />
          <div className="magic-feature__sun-rays" />
          <ShaderBackground modA={[1.8, 1.2, 0.6, 0.9]} />
          <div className="magic-feature__label">Kaya’s Radiance</div>
        </div>
      )}
      <div className="magic-hero" style={{ background: isGods ? godTheme.background : system.colors.background }}>
        <div className="magic-hero__eyebrow">Magic System</div>
        <h1 className="magic-hero__title">{system.name}</h1>
        <p className="magic-hero__lead">{locked ? 'Glyphs shimmer, but the page will not open.' : (isGods ? activeGod?.aura || system.tagline : system.tagline)}</p>
        {isGods && !locked && (
          <div className="magic-god-toggle" role="tablist" aria-label="Select god">
            <button
              type="button"
              className={`magic-god-toggle__half ${selectedGod === 'kaya' ? 'is-active' : ''}`}
              onClick={() => setSelectedGod('kaya')}
              role="tab"
              aria-selected={selectedGod === 'kaya'}
            >
              Kaya
            </button>
            <button
              type="button"
              className={`magic-god-toggle__half magic-god-toggle__half--right ${selectedGod === 'krovi' ? 'is-active' : ''}`}
              onClick={() => setSelectedGod('krovi')}
              role="tab"
              aria-selected={selectedGod === 'krovi'}
            >
              Krovi
            </button>
            <div className={`magic-god-toggle__indicator magic-god-toggle__indicator--${selectedGod}`} aria-hidden="true" />
          </div>
        )}
        <div className="magic-hero__meta">
          <span className="magic-pill" style={{ borderColor: `${system.colors.accent}80` }}>
            {isGods ? system.focus : system.focus}
          </span>
          <Link to="/magic" className="magic-pill magic-pill--ghost">
            Back to all systems
          </Link>
        </div>
      </div>

      <section className="magic-section">
        <div className="magic-section__header">
          <p className="magic-eyebrow">Summary</p>
          <h2 className="magic-title">{system.name}</h2>
          <p className="magic-subtitle">{locked ? 'ᚱᚨᛉᛟᚾ ᚦᚺᛖ ᛋᛖᚨᛚ ᛁᛋ ᛋᛁᛚᛖᚾᚲᛖᛞ ᛒᛖᚾᛖᚨᛏᚺ ᛋᛖᚨᛚᛋ' : system.summary}</p>
        </div>
        {system.highlights && !locked && (
          <div className="magic-grid magic-grid--highlights">
            {system.highlights.map((item) => (
              <div className="magic-card magic-card--inline" key={item} style={{ background: system.colors.card }}>
                <div className="magic-card__dot" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {locked ? (
        <section className="magic-section">
          <div className="magic-section__header">
            <p className="magic-eyebrow">Locked</p>
            <h2 className="magic-title">Sealed entry</h2>
            <p className="magic-subtitle">ᛞᚱᚨᚲᛟᚾᛁᚲ ᛒᛚᛟᛟᛞᛋ ᚨᚱᛖ ᛋᛏᛟᚾᛖᛞ; ᛁᚾᚲᚱᛁᛈᛏᛖᛞ ᛏᛖᛆᛉᛏ ᛋᛁᚷᛖᛚᛋ ᛋᛚᛟᚹᛚᚣ.</p>
          </div>
          <div className="magic-steps">
            <div className="magic-step" style={{ background: system.colors.card }}>
              <h3>Locked</h3>
              <p>ᚠᚢᛏᚢᚱᛖ ᚲᛚᚢᛖᛋ ᚱᛖᚻᛖᚪᚱᛋᛖ ᛏᚺᛁᛋ ᛋᛟᚾᚷ.</p>
            </div>
          </div>
        </section>
      ) : isGods ? (
        <section className="magic-section">
          <div className="magic-section__header">
            <p className="magic-eyebrow">Gods & Dukes</p>
            <h2 className="magic-title">Trees of Kaya and Krovi</h2>
            <p className="magic-subtitle">
              Twin dragon gods shattered at Year 0, leaving dukes who channel their domains. Kaya rules light and control;
              Krovi guards darkness and freedom. Each duke offers a feat-like boon to those who swear a pact.
            </p>
          </div>
          <div className="magic-god-panel">
            <div className="magic-section__header magic-section__header--tight">
              <p className="magic-eyebrow">{selectedGod === 'kaya' ? 'Kaya' : 'Krovi'}</p>
              <h3 className="magic-title">{activeGod?.name}</h3>
              <p className="magic-subtitle">{activeGod?.description}</p>
            </div>
            <InteractiveDukeTree god={activeGod} color={activeGod?.color || system.colors.primary} />
          </div>
        </section>
      ) : (
        <section className="magic-section">
          <div className="magic-section__header">
            <p className="magic-eyebrow">Depth</p>
            <h2 className="magic-title">How it works</h2>
            <p className="magic-subtitle">{system.focus}</p>
          </div>
          <div className="magic-steps">
            {system.sections?.map((section) => (
              <div key={section.id} className="magic-step" style={{ background: system.colors.card }}>
                <h3>{section.label}</h3>
                <p>
                  {section.id === 'concept' && system.summary}
                  {section.id === 'practice' && system.tagline}
                  {section.id === 'risk' &&
                    'Use with care: power shapes the land, and the land shapes back. Each current comes with consequences when pushed.'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
