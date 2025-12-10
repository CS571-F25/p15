const commonLayout = {
  sections: [
    { id: 'concept', label: 'Concept' },
    { id: 'practice', label: 'How it manifests' },
    { id: 'risk', label: 'Risks & limits' },
  ],
};

export const MAGIC_SYSTEMS = [
  {
    id: 'gods',
    name: 'Magic of the Gods',
    tagline: 'Twin draconic gods, sunset and midnight, with dukes who trade boons for allegiance.',
    colors: {
      primary: '#f97316',
      secondary: '#0f172a',
      accent: '#fde68a',
      background: 'linear-gradient(135deg, #1c0f0b 0%, #0f172a 40%, #1f2937 100%)',
      card: 'rgba(255, 237, 213, 0.04)',
    },
    summary: 'Kaya (light, control) and Krovi (darkness, freedom) lend power through dukes, gifting feats that bend battles and choices.',
    focus: 'Oaths to dukes; control vs freedom; draconic resonance after Year 0.',
    highlights: [
      'Dukes act as pact anchors, granting feats that reshape action economy and morale.',
      'Kaya’s boons spike when you dominate; Krovi’s when you refuse restraint.',
      'Sunset (amber) and midnight (deep blue) auras mark empowered magic.',
    ],
    sections: commonLayout.sections,
    dukes: {
      kaya: {
        name: 'Kaya, God of Light and Control',
        color: '#f59e0b',
        aura: 'burning sunset (amber to crimson)',
        description:
          'Her dukes reward discipline, hierarchy, and decisive order. Power intensifies against weakened foes or when maintaining formation.',
        entries: [
          { name: 'Restraint', effect: 'Reduce damage taken while you hold position; allies in your zone gain steadiness.' },
          { name: 'Obedience', effect: 'Issue a command that compels brief compliance; strengthened when your authority is recognized.' },
          { name: 'Judgment', effect: 'Mark a target; if they falter or are bloodied, your strikes grow exponentially stronger.' },
          { name: 'Silence', effect: 'Dampen hostile magic and speech in a warded radius; perfect for ending chaos.' },
          { name: 'Command', effect: 'Rally allies to act on your beat; trade your action to coordinate theirs.' },
          { name: 'Authority', effect: 'Project an aura of order; frightened or disorganized foes suffer penalties inside it.' },
          { name: 'Dominion', effect: 'You weaken overall, but against any clearly weaker or injured foe you surge in strength.' },
        ],
      },
      krovi: {
        name: 'Krovi, God of Darkness and Freedom',
        color: '#0ea5e9',
        aura: 'midnight with prismatic edges',
        lockedHint: 'Unlockable by invoking Krovi — often whispered as “Krovi” in notes.',
        description:
          'His dukes reward rebellion, expression, and the refusal to be caged. Power spikes when you break lines or overturn control.',
        entries: [
          { name: 'Rebellion', effect: 'Gain bursts of strength after resisting control or breaking restraints.' },
          { name: 'Expression', effect: 'Improvise reality-bending flourishes; spells and skills gain unexpected color and reach.' },
          { name: 'Independence', effect: 'Resist charms and commands; allies nearby gain advantage to shrug off domination.' },
          { name: 'Momentum', effect: 'Each movement through enemy zones charges a kinetic lash unleashed at will.' },
        ],
      },
    },
  },
  {
    id: 'azterra',
    name: 'Magic of Azterra',
    tagline: 'Green lifeblood of the land—tides, roots, beasts, and sky-whales.',
    colors: {
      primary: '#34d399',
      secondary: '#14532d',
      accent: '#a7f3d0',
      background: 'linear-gradient(135deg, #06260f 0%, #0c3b1a 45%, #082b12 100%)',
      card: 'rgba(52, 211, 153, 0.08)',
    },
    summary: 'Ambient verdant magic saturates Azterra; when condensed it births colossal fauna and verdant titans.',
    focus: 'Druids, beasts, leviathans, sky-whales; nature rituals that shape storms and growth.',
    highlights: [
      'Condensed currents birth magical monsters and giant beasts.',
      'Flows through oceans, roots, and mist—druids weave it without runes.',
      'Almost every classic creature drinks from this current.',
    ],
    sections: commonLayout.sections,
  },
  {
    id: 'math',
    name: 'Magic of Math',
    tagline: 'Cyan equations that refine raw power into precise outcomes.',
    colors: {
      primary: '#22d3ee',
      secondary: '#0f172a',
      accent: '#7dd3fc',
      background: 'linear-gradient(135deg, #04121f 0%, #0b1d2d 45%, #0a1a25 100%)',
      card: 'rgba(34, 211, 238, 0.08)',
    },
    summary:
      'Math Magic is the cyan art of understanding magic as equations. Anyone can study it, but humans excel, and only wizards truly master it—rewriting reality through calculation.',
    focus: 'Formulae, sigils, frames, timed incantations; intellect as conduit.',
    highlights: [
      'Casting is real-time problem solving—speed and clarity matter more than raw power.',
      'Frames let mages read, rewrite, stabilize, and counter spells.',
      'Humans excel at pattern intuition; wizards are the only class that reaches true mastery.',
    ],
    sections: commonLayout.sections,
    concept: [
      'Magic is patterns, forces, and structures; most beings wield it instinctively.',
      'Math Mages break magic into equations, turning ambient mana into precise, repeatable spells.',
      'Their magic shines cyan—the color of clarity and logic.',
    ],
    how: [
      'Every spell is a math problem solved in real time; stronger spells demand deeper comprehension.',
      'Casting blends visualization, calculation speed, and exact knowledge of mana behavior.',
      'Masters compress vast formulas into a single gesture, casting near-instantly.',
    ],
    frames: [
      'Geometric overlays and vectors to map flows.',
      'Heat maps and motion lines to read turbulence.',
      'Structural diagrams to rewrite or stabilize spells.',
      'Counter-frames to invert hostile magic mid-flight.',
    ],
    humans: [
      'Humans intuit patterns in mana better than any other race.',
      'Other races can learn, but progress is slow and true mastery is rare.',
      'Humans routinely produce archmages who push the theory forward.',
    ],
    wizards: [
      'Wizards devote entire lives to mana constants, elemental equations, frames, and structural theory.',
      'Only wizards create new spells, re-derive lost ones, or multi-solve (cast multiple spells at once).',
      'With enough insight, wizardry rivals divine magic through pure understanding.',
    ],
    aesthetic: 'Cyan lines, glowing diagrams, rotating symbols, and clean mechanical circles flash briefly when spells resolve.',
  },
  {
    id: 'spirits',
    name: 'Magic of Spirits',
    tagline: 'Golden mysteries—rare beings born with impossible quirks.',
    colors: {
      primary: '#fbbf24',
      secondary: '#2b210f',
      accent: '#fef3c7',
      background: 'linear-gradient(135deg, #1b1208 0%, #2b1b0c 45%, #1c140a 100%)',
      card: 'rgba(251, 191, 36, 0.08)',
    },
    summary: 'Spirits arrive with inherent gifts—teleporting foxes, gravity-twisting turtles, form-shifting wraiths.',
    focus: 'Innate anomalies, not druidic or mathematical; origin unknown and elusive to study.',
    highlights: [
      'Born with power or arriving from elsewhere; not fueled by Azterra’s green current.',
      'Each spirit has at least one unique, story-bending effect.',
      'Scholars have failed for decades to formalize their rules.',
    ],
    sections: commonLayout.sections,
  },
  {
    id: 'wild',
    name: 'Wild Magic',
    tagline: 'Purple, unstable, rare—feylike chaos without a feywild.',
    colors: {
      primary: '#a855f7',
      secondary: '#201036',
      accent: '#e9d5ff',
      background: 'linear-gradient(135deg, #180927 0%, #201036 45%, #1b0f2b 100%)',
      card: 'rgba(168, 85, 247, 0.1)',
    },
    summary: 'Unstable and seldom seen; echoes of what outsiders might call “wild surges.”',
    focus: 'Volatility, story-driving coincidences, reality slips.',
    highlights: [
      'Rare currents create unpredictable surges.',
      'Behaves like a feywild echo despite no feywild here.',
      'Best treated as a narrative spice—potent but fleeting.',
    ],
    sections: commonLayout.sections,
  },
  {
    id: 'veiled',
    secretId: 'elkin-etheria',
    name: 'Magic of ᚨᛚᚲᛁᚾ · ᛖᛏᚺᛖᚱᛁᚨ',
    tagline: 'Locked entry — whispered only in forgotten vaults.',
    colors: {
      primary: '#9ca3af',
      secondary: '#1f2937',
      accent: '#e5e7eb',
      background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #0b1020 100%)',
      card: 'rgba(255, 255, 255, 0.04)',
    },
    summary: 'An unreadable script traces across stone tablets. The page remains sealed until the right phrase is spoken.',
    focus: '???',
    highlights: ['Entry requires an unlocked secret.', 'Its glyphs shimmer when spoken aloud.', 'Awaiting discovery.'],
    sections: commonLayout.sections,
  },
];

export const getMagicSystem = (id) => MAGIC_SYSTEMS.find((sys) => sys.id === id);
