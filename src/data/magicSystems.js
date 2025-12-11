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
    tagline: 'Twin mountain-sized dragon gods whose death at Year 0 scattered divine power into their dukes.',
    colors: {
      primary: '#f97316',
      secondary: '#0f172a',
      accent: '#fde68a',
      background: 'linear-gradient(135deg, #1c0f0b 0%, #0f172a 40%, #1f2937 100%)',
      card: 'rgba(255, 237, 213, 0.04)',
    },
    summary:
      'Magic in Azterra flows from two ancient dragon gods - Kaya and Krovi - whose death in their final clash marked Year 0. Their mountain-sized bodies fell; their hill-sized dukes carry the last echoes of divine power.',
    focus: 'Oaths to fallen dukes; fragments of draconic power; bones as temples and sanctuaries.',
    highlights: [
      'Year 0: Kaya and Krovi slew each other; calendars reset.',
      'Dukes - hill-sized dragons - serve as lieutenants; some bones now temples or hidden vaults.',
      'Oaths channel fragments of the gods, bending fate, morale, and action economy.',
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
          {
            name: 'Dominion',
            effect:
              'You weaken overall, but against any clearly weaker or injured foe you surge in strength. Noble houses prove devotion by staging grim bouts against shackled, poisoned prisoners to demonstrate overwhelming power.',
          },
        ],
      },
      krovi: {
        name: 'Krovi, God of Darkness and Freedom',
        color: '#0ea5e9',
        aura: 'midnight with prismatic edges',
        lockedHint: 'Unlockable by invoking Krovi - often whispered as "Krovi" in notes.',
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
    tagline: 'The world breathes, and the breath becomes life.',
    colors: {
      primary: '#34d399',
      secondary: '#14532d',
      accent: '#a7f3d0',
      background: 'linear-gradient(135deg, #06260f 0%, #0c3b1a 45%, #082b12 100%)',
      card: 'rgba(52, 211, 153, 0.08)',
    },
    summary:
      'Magic of Azterra is the living green energy of the world-life condensed into power. When concentrated, it transforms animals into magical creatures and causes nature to rise in defense, creating the giant beasts and wild wonders of the world.',
    focus: 'Life condensed into power; balance enforced by instinct; druids listen rather than command.',
    highlights: [
      'Raw life-force flows through every native creature; when it condenses, nature reshapes into sky whales, colossal worms, thinking storms, walking forests.',
      'When balance is threatened, green magic concentrates into guardians and leviathans.',
      'Druids harmonize with the current; they translate rather than control.',
    ],
    concept: [
      'Green magic is life condensed into power-healing, mutating, strengthening, transforming.',
      'It is not "good" or "evil"; it simply preserves the world\'s balance.',
      'Condensation births legendary beasts much like radiation alters anything it touches.',
    ],
    how: [
      'All natural creatures carry a trace of green magic.',
      'Dense concentrations evolve normal animals into magical beings.',
      'The land instinctively pushes back against destruction, corruption, or overuse.',
      'Overgrown zones emerge where the current becomes impossible to tame.',
      'Magical beasts arise from the world itself, not spellcasters.',
    ],
    druids: [
      'Druids do not control green magic; they listen.',
      'Their spells harmonize with the planet\'s flow instead of forcing it.',
      'They serve as translators between civilization and the wild.',
    ],
    defense: [
      'Guardian beasts manifest when civilizations pollute or over-extract.',
      'Forests can turn hostile; storms can think; creatures mutate rapidly.',
      'The response is not wrath-it is balance.',
    ],
    aesthetic: [
      'Glowing spores and drifting pollen-like motes.',
      'Bioluminescent veins in soil, stone, and bark.',
      'Shimmering waves in the air; vines and roots that move with intent.',
      'A low hum or deep rumble where the current gathers.',
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
      'Math Magic is the cyan art of understanding magic as equations. Anyone can study it, but humans excel, and only wizards truly master it-rewriting reality through calculation.',
    focus: 'Formulae, sigils, frames, timed incantations; intellect as conduit.',
    highlights: [
      'Casting is real-time problem solving-speed and clarity matter more than raw power.',
      'Frames let mages read, rewrite, stabilize, and counter spells.',
      'Humans excel at pattern intuition; wizards are the only class that reaches true mastery.',
    ],
    sections: commonLayout.sections,
    concept: [
      'Magic is patterns, forces, and structures; most beings wield it instinctively.',
      'Math Mages break magic into equations, turning ambient mana into precise, repeatable spells.',
      'Their magic shines cyan-the color of clarity and logic.',
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
    tagline: 'Golden, innate power shaped by emotion and story.',
    colors: {
      primary: '#fbbf24',
      secondary: '#2b210f',
      accent: '#fef3c7',
      background: 'linear-gradient(135deg, #1b1208 0%, #2b1b0c 45%, #1c140a 100%)',
      card: 'rgba(251, 191, 36, 0.08)',
    },
    summary:
      'Spirit Magic is the golden, innate power of timeless beings shaped by emotion and story. Their abilities come from hidden circular sigils no mortal has been able to fully perceive or replicate.',
    focus: 'Innate anomalies from beyond the green current; story-bound, emotional, and resistant to study.',
    highlights: [
      'Timeless beings with no biology or lifespan; they exist because of story, emotion, or place.',
      'Every spirit wields a sigil motion - circles, curls, ripples - that trigger innate abilities.',
      'Mortals only mimic weak sigils (tiny flames, breezes, ripples); true spirit magic flashes as golden rings, ripples, chimes, and dreamlike motion.',
    ],
    essence: [
      'Ancient, emotional beings whose magic does not come from Azterra.',
      'No natural lifespan or ecological role - tied to a story, emotion, or purpose.',
      'Exist beyond biology; they are ideas given form.',
    ],
    sigils: [
      'Each spirit has at least one sigil: a circular motion or shape that activates its power.',
      'A fox curls its tail to teleport; a turtle withdraws to alter weight; a river guardian ripples to shift shape.',
      'Spirits do not cast spells - their bodies complete the pattern that is their power.',
    ],
    scholars: [
      'Scholars know sigils must be real but cannot perceive them directly.',
      'Centuries of research have recreated only weak sigils: tiny flames, soft breezes, ripples, light mana absorption.',
      'True spirit magic remains unsolved.',
    ],
    expressions: [
      'A lonely forest births a shy lantern spirit.',
      'A memory-laden river makes a guardian who watches centuries pass.',
      'Spirits manifest as themes or emotions rather than fauna.',
    ],
    aesthetic: [
      'Circles of light and ripples.',
      'Soft chimes and dreamlike motions.',
      'Golden rings that flare when abilities trigger.',
    ],
    sections: commonLayout.sections,
  },
  {
    id: 'wild',
    name: 'Wild Magic',
    tagline: 'Colorful, unstable, rare - chaos without a feywild.',
    colors: {
      primary: '#a855f7',
      secondary: '#201036',
      accent: '#e9d5ff',
      background: 'linear-gradient(135deg, #180927 0%, #201036 45%, #1b0f2b 100%)',
      card: 'rgba(168, 85, 247, 0.1)',
    },
    summary:
      'Wild Magic is the unstable purple energy that appears only when rifts connect Azterra to other realms - magic that breaks every rule, cannot be explained, and behaves differently every time it is observed.',
    focus: 'Rift-born anomalies; volatility that defies study; effects that never repeat.',
    highlights: [
      'Appears only when rifts briefly open to other realms.',
      'Twists mana, space, and time with no consistent pattern; no two surges behave alike.',
      'Cannot be stabilized or contained; best treated as potent, fleeting, and untrusted spice.',
    ],
    sections: commonLayout.sections,
  },
  {
    id: 'veiled',
    secretId: 'elkin-etheria',
    name: 'Magic of ᚨᛚᚲᛁᚾ · ᛖᛏᚺᛖᚱᛁᚨ',
    tagline: 'Locked entry - whispered only in forgotten vaults.',
    colors: {
      primary: '#9ca3af',
      secondary: '#1f2937',
      accent: '#e5e7eb',
      background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #0b1020 100%)',
      card: 'rgba(255, 255, 255, 0.04)',
    },
    summary: 'An unreadable script traces across stone tablets. The page remains sealed until the right phrase is spoken.',
    focus: '---',
    highlights: ['Entry requires an unlocked secret.', 'Its glyphs shimmer when spoken aloud.', 'Awaiting discovery.'],
    sections: commonLayout.sections,
  },
];

export const getMagicSystem = (id) => MAGIC_SYSTEMS.find((sys) => sys.id === id);
