// src/data/characters.js
// Sample character data for D&D 5e party
function randomColor() {
  // Returns [r, g, b, a] with values in [0.2, 0.95] for nice vibrance
  const r = Math.floor(Math.random()*5);
  const g = Math.floor(Math.random()*5);
  const b = Math.floor(Math.random()*5);
  const a = Math.floor(Math.random()*5);
  return [r, g, b, a];
}

const characters = [
  {
    id: 1,
    name: "Aelar",
    race: "Elf",
    class: "Wizard",
    level: 5,
    alignment: "Chaotic Good",
    background: "Sage",
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
    equipment: ["Staff", "Spellbook", "Rope"],
    notes: "Wears a blue cloak."
  },
  {
    id: 2,
    name: "Brog",
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
    notes: "Has a scar over left eye."
  },
  {
    id: 3,
    name: "Celeste",
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
    notes: "Carries a small silver bell blessed by her temple."
  },
  {
    id: 4,
    name: "Drusk",
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
    notes: "Armor is etched with bronze dragon motifs."
  },
  {
    id: 5,
    name: "Elyra",
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
    notes: "Collects stories from every tavern she visits."
  },
  {
    id: 6,
    name: "Flint",
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
    notes: "Has a mechanical raven familiar named Cog."
  },
  {
    id: 7,
    name: "Ghita",
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
    notes: "Eyes glow faint purple when channeling her patron."
  },
  {
    id: 8,
    name: "Harran",
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
    notes: "Keeps tally marks engraved on his maul's haft."
  }
  // Add more characters as desired
];

export default characters.map((char) => ({
  ...char,
  color: randomColor(),
}));
