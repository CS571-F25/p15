import React, { useMemo } from 'react';
import './MagicPage.css';

const chips = [
  '∫⟮∫ ℳ(x,y,t) · dΣ⟯ / √(Δt)',
  '∂²Ψ/∂t² ⧸⧵ ω²Ψ = Φₘ',
  'lim Δt→0 ⎛Σ mana⃗ · Δr⎞ / ⎝Σ Ω⎠',
  'det⎡Γᵢⱼ + ∇ϕ⎤ = λ₀',
  '∮ₛ (B + ∇Θ) · dl = 4πρₑ',
  '⟨χ|Ĥ|χ⟩ = ℏΩ + Σᵢ ξᵢ',
  '∂μF^{μν} = Jⁿ + κ∇·Ξ',
  'Δ⊥ ψ + k² ψ = 0',
  'Σₙ cₙ e^{i nθ} ↦ Ξ(t)',
  '⎮∫∫∫ ρ(x,y,z) dx dy dz⎮ ÷ √(τ)',
  'rot(Λ⃗) = α ∇×(Ψ⃗)',
  '⟨ϕ|ψ⟩ = δ(ϕ-ψ) + ε(t)',
  '∂/∂t (Π⃗ · A⃗) = -∇·J⃗ + η',
  'λ₁λ₂λ₃ − tr(Γ²) + det(Γ) = 0',
  'Ξ̈ + Ω²Ξ = κ e^{-iωt}',
];

export default function MathEffects() {
  const positions = useMemo(
    () =>
      chips.map(() => ({
        x: 5 + Math.random() * 90,
        y: 5 + Math.random() * 90,
        delay: Math.random() * 6,
        rot: (Math.random() - 0.5) * 8, // slight rotation
        scale: 1.3 + Math.random() * 0.6,
      })),
    []
  );

  return (
    <div className="math-effects" aria-hidden="true">
      <div className="math-effects__grid" />
      <div className="math-effects__rings" />
      <div className="math-effects__chips">
        {chips.map((text, idx) => {
          const pos = positions[idx];
          return (
            <span
              key={text + idx}
              className="math-effects__chip"
              style={{
                '--mx': `${pos.x}%`,
                '--my': `${pos.y}%`,
                '--mdelay': `${pos.delay}s`,
                '--mrot': `${pos.rot}deg`,
                '--mscale': pos.scale,
              }}
            >
              {text}
            </span>
          );
        })}
      </div>
    </div>
  );
}
