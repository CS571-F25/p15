// src/data/characters.js
// Sample character data for D&D 5e party
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
  }
  // Add more characters as desired
];

export default characters;
