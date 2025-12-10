import React from 'react';
import './MagicPage.css';

const chips = [
  '∫∫ ℳ(x,y,t) · dΣ = 0',
  '∂²Ψ/∂t² + ω²Ψ = Φₘ',
  'lim Δt→0 Σ mana⃗ · Δr = ℰ',
  'det|Γᵢⱼ + ∇ϕ| = λ₀',
  '∮ₛ (B + ∇Θ) · dl = 4πρₑ',
  '⟨χ|Ĥ|χ⟩ = ℏΩ + Σᵢ ξᵢ',
  '∂μF^{μν} = Jⁿ + κ∇·Ξ',
  'Δ⊥ ψ + k² ψ = 0',
  'Σₙ cₙ e^{i nθ} ↦ Ξ(t)',
  '∫∫∫ ρ(x,y,z) dx dy dz = 1',
  'rot(Λ⃗) = α ∇×(Ψ⃗)',
  '⟨ϕ|ψ⟩ = δ(ϕ-ψ) + ε(t)',
  '∂/∂t (Π⃗ · A⃗) = -∇·J⃗ + η',
  'λ₁λ₂λ₃ − tr(Γ²) + det(Γ) = 0',
  'Ξ̈ + Ω²Ξ = κ e^{-iωt}',
  '∇·(σ ∇Φ) = −ρ + β sinθ',
  'Σᵢ Σⱼ Tᵢⱼ e^{i(k·r−ωt)} = 0',
  '𝔇(μ,ν,τ) = ∮ e^{iΩt} Ξ·dℓ',
  '⟂(∇×Ψ) + Ϝ(λ) = ζ₀',
  '∫ e^{i(kx+ly+mz−ωt)} f(k,l,m) dk dl dm',
  'det|ℱ̂ + iΞ| = 0',
  'Φ̃(t) = Σₚ αₚ e^{−iωₚt} Λₚ',
  '∇²Ξ + iωΓΞ = S(t)',
  'Σᵣ Σₛ Θᵣₛ e^{i(κᵣ−κₛ)t} = 0',
];

export default function MathEffects() {
  return (
    <div className="math-effects" aria-hidden="true">
      <div className="math-effects__grid" />
      <div className="math-effects__rings" />
      <div className="math-effects__chips">
        {chips.map((text, idx) => (
          <span
            key={text + idx}
            className="math-effects__chip"
            style={{
              '--mx': `${5 + Math.random() * 90}%`,
              '--my': `${5 + Math.random() * 90}%`,
              '--mdelay': `${Math.random() * 4}s`,
            }}
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
