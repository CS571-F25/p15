// src/data/characters.js
// Sample character data for D&D 5e party
function randomColor() {
  // Returns [r, g, b, a] 
  const n = 10;
  const r = Math.floor(Math.random()*n);
  const g = Math.floor(Math.random()*n);
  const b = Math.floor(Math.random()*n);
  const a = Math.floor(Math.random()*n);
  return [r, g, b, a];
}

const characters = [
  {
    id: 1,
    name: "Aelar",
    title: "The Arcane Sage",
    race: "Elf",
    class: "Wizard",
    level: 5,
    alignment: "Chaotic Good",
    background: "Sage of the Spire of Echoes, former Arcanum archivist who charts celestial anomalies",
    hp: 31,
    ac: 13,
    speed: 30,
    stats: {
      str: 8, dex: 14, con: 12, int: 18, wis: 15, cha: 10
    },
    passivePerception: 12,
    inspiration: false,
    profBonus: 3,
    skills: ["Arcana", "History", "Investigation"],
    abilities: ["Arcane Recovery", "Spellcasting"],
    spells: ["Magic Missile", "Shield", "Fireball"],
    equipment: [
      "Amber-tipped staff etched with constellations",
      "Spellbook bound in dragonhide, pages rimed with stasis-ink",
      "Rope",
      "Crystal lens for reading the weave",
      "Starlit chalk for tracing warding circles"
    ],
    notes: "Wears a blue cloak. Keeps a notebook of dream-fragments and sketched glyphs; refuses to travel without it.",
    lore: "Aelar spent decades within the Spire of Echoes, studying ancient scrolls that predate the Sundering. His fascination with the arcane is not merely academic; he seeks to understand the very fabric of reality to prevent a catastrophe he saw in a vision. Though often lost in thought, his mastery of the weave is undeniable, capable of bending the elements to his will with a mere whisper. He once froze an avalanche in place to evacuate a mountain pass caravan, then rewove the falling snow into shimmering sigils that guided the travelers to safety. Aelar now wanders Azterra to confirm whether the symbols from his vision match those appearing in ruins across the continent."
  },
  {
    id: 2,
    name: "Brog",
    title: "The Ironbreaker",
    race: "Half-Orc",
    class: "Barbarian",
    level: 4,
    alignment: "Neutral",
    background: "Outlander",
    hp: 44,
    ac: 15,
    speed: 40,
    stats: {
      str: 17, dex: 13, con: 16, int: 8, wis: 12, cha: 9
    },
    passivePerception: 10,
    inspiration: true,
    profBonus: 2,
    skills: ["Athletics", "Survival"],
    abilities: ["Rage", "Unarmored Defense"],
    spells: [],
    equipment: ["Greataxe", "Javelin (4)", "Explorer's Pack"],
    notes: "Has a scar over left eye.",
    lore: "Born in the harsh badlands of Karkoth, Brog learned early that strength was the only law that mattered. He earned the name 'Ironbreaker' after shattering a warlord's shield with a single blow. Despite his fearsome reputation, Brog possesses a quiet wisdom about the natural world, respecting the spirits of the land as much as the steel in his hand."
  },
  {
    id: 3,
    name: "Celeste",
    title: "Lightbringer",
    race: "Human",
    class: "Cleric",
    level: 5,
    alignment: "Lawful Good",
    background: "Acolyte",
    hp: 38,
    ac: 18,
    speed: 30,
    stats: {
      str: 12, dex: 11, con: 14, int: 12, wis: 18, cha: 15
    },
    passivePerception: 15,
    inspiration: true,
    profBonus: 3,
    skills: ["Insight", "Medicine", "Religion"],
    abilities: ["Channel Divinity", "Divine Domain"],
    spells: ["Guiding Bolt", "Spiritual Weapon", "Mass Healing Word"],
    equipment: ["Mace", "Shield", "Holy Symbol", "Chain Mail"],
    notes: "Carries a small silver bell blessed by her temple.",
    lore: "Celeste was found on the steps of the Temple of Solara as an infant, bathed in the morning light. Raised by the priesthood, she has dedicated her life to bringing hope to the darkest corners of Azterra. Her faith is unwavering, a beacon that rallies her allies even in the direst of circumstances. It is said that her prayers can turn the tide of battle, calling down the very wrath of the sun."
  },
  {
    id: 4,
    name: "Drusk",
    title: "Dragon's Shield",
    race: "Dragonborn",
    class: "Paladin",
    level: 6,
    alignment: "Lawful Neutral",
    background: "Soldier",
    hp: 54,
    ac: 19,
    speed: 30,
    stats: {
      str: 18, dex: 10, con: 16, int: 10, wis: 12, cha: 14
    },
    passivePerception: 12,
    inspiration: false,
    profBonus: 3,
    skills: ["Athletics", "Intimidation", "Persuasion"],
    abilities: ["Lay on Hands", "Divine Smite"],
    spells: ["Bless", "Shield of Faith"],
    equipment: ["Greatsword", "Plate Armor", "Insignia of rank"],
    notes: "Armor is etched with bronze dragon motifs.",
    lore: "A veteran of the Scale Wars, Drusk swore an oath of vengeance against those who would threaten the innocent. His bronze scales are scarred from countless battles, each a testament to his resilience. He views himself as a living shield, placing himself between danger and his companions without hesitation. His code is strict, but his heart burns with the fire of his ancestors."
  },
  {
    id: 5,
    name: "Elyra",
    title: "Songweaver",
    race: "Half-Elf",
    class: "Bard",
    level: 5,
    alignment: "Chaotic Neutral",
    background: "Entertainer",
    hp: 32,
    ac: 15,
    speed: 30,
    stats: {
      str: 10, dex: 14, con: 12, int: 13, wis: 11, cha: 18
    },
    passivePerception: 13,
    inspiration: true,
    profBonus: 3,
    skills: ["Performance", "Deception", "Persuasion", "Stealth"],
    abilities: ["Bardic Inspiration", "Jack of All Trades"],
    spells: ["Dissonant Whispers", "Hypnotic Pattern", "Cure Wounds"],
    equipment: ["Rapier", "Lute", "Pan flute", "Leather Armor"],
    notes: "Collects stories from every tavern she visits.",
    lore: "Elyra believes that the world is made of stories, and she intends to learn them all. A wanderer by nature, she weaves magic into her music, charming kings and calming beasts alike. Her laughter is infectious, but beneath her playful exterior lies a sharp wit and a keen observer. She chronicles the party's deeds, ensuring their legend will be sung for generations to come."
  },
  {
    id: 6,
    name: "Flint",
    title: "The Tinkerer",
    race: "Dwarf",
    class: "Artificer",
    level: 4,
    alignment: "Neutral Good",
    background: "Guild Artisan",
    hp: 34,
    ac: 16,
    speed: 25,
    stats: {
      str: 11, dex: 12, con: 15, int: 17, wis: 10, cha: 9
    },
    passivePerception: 11,
    inspiration: false,
    profBonus: 2,
    skills: ["Arcana", "Investigation", "Tinker's Tools"],
    abilities: ["Infuse Item", "Magical Tinkering"],
    spells: ["Faerie Fire", "Cure Wounds"],
    equipment: ["Handaxe", "Light Crossbow", "Tinker satchel"],
    notes: "Has a mechanical raven familiar named Cog.",
    lore: "Flint sees magic not as a mystical force, but as a puzzle to be solved. Exiled from his clan for his unorthodox experiments, he travels the world seeking rare materials for his inventions. His mechanical companion, Cog, is his masterpiece, a testament to his genius. Flint is always tinkering, improving, and optimizing, believing that with enough gears and mana, anything is possible."
  },
  {
    id: 7,
    name: "Ghita",
    title: "Shadowbound",
    race: "Tiefling",
    class: "Warlock",
    level: 5,
    alignment: "Neutral Evil",
    background: "Charlatan",
    hp: 30,
    ac: 14,
    speed: 30,
    stats: {
      str: 8, dex: 14, con: 13, int: 11, wis: 12, cha: 18
    },
    passivePerception: 13,
    inspiration: false,
    profBonus: 3,
    skills: ["Arcana", "Deception", "Sleight of Hand"],
    abilities: ["Eldritch Invocations", "Pact of the Tome"],
    spells: ["Eldritch Blast", "Hex", "Shadow of Moil"],
    equipment: ["Dagger", "Component pouch", "Silken robes"],
    notes: "Eyes glow faint purple when channeling her patron.",
    lore: "Ghita struck a bargain with a shadowy entity to save her own life, a debt she is now forever paying. She walks the line between light and dark, using her deceptive charm to manipulate those around her. While her methods are questionable, her power is undeniable. She seeks a way to break her pact, but the whispers in the dark are growing louder every day."
  },
  {
    id: 8,
    name: "Harran",
    title: "Stonefist",
    race: "Goliath",
    class: "Fighter",
    level: 5,
    alignment: "Chaotic Neutral",
    background: "Mercenary",
    hp: 52,
    ac: 17,
    speed: 30,
    stats: {
      str: 18, dex: 12, con: 16, int: 9, wis: 13, cha: 10
    },
    passivePerception: 12,
    inspiration: true,
    profBonus: 3,
    skills: ["Athletics", "Survival", "Perception"],
    abilities: ["Second Wind", "Action Surge", "Battlemaster Maneuvers"],
    spells: [],
    equipment: ["Maul", "Heavy Crossbow", "Chain Mail"],
    notes: "Keeps tally marks engraved on his maul's haft.",
    lore: "Harran descends from a tribe of mountain dwellers who value strength above all else. He left his home to test his might against the strongest champions of the lowlands. His maul, 'Earthshaker', has felled giants and beasts alike. Though he speaks little, his actions speak volumes. He fights not for gold or glory, but for the thrill of the challenge and the honor of his ancestors."
  }
];

export default characters.map((char) => ({
  ...char,
  color: randomColor(),
}));
