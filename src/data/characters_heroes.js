// src/data/characters.js
// Sample character data for D&D 5e party
function randomColor() {
  // Returns [r, g, b, a]
  const n = 10;
  const r = Math.floor(Math.random() * n);
  const g = Math.floor(Math.random() * n);
  const b = Math.floor(Math.random() * n);
  const a = Math.floor(Math.random() * n);
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
    lore: "Aelar spent decades within the Spire of Echoes, studying ancient scrolls that predate the Sundering. His fascination with the arcane is not merely academic; he seeks to understand the very fabric of reality to prevent a catastrophe he saw in a vision. Though often lost in thought, his mastery of the weave is undeniable, capable of bending the elements to his will with a mere whisper. He once froze an avalanche in place to evacuate a mountain pass caravan, then rewove the falling snow into shimmering sigils that guided the travelers to safety. Aelar now wanders Azterra to confirm whether the symbols from his vision match those appearing in ruins across the continent.",
    sheet: {
      core: {
        hitDie: "d6",
        raceTraits: ["Darkvision", "Keen Senses", "Fey Ancestry", "Trance"],
        classFeatures: ["Spellcasting", "Arcane Recovery"],
        backgroundFeature: "Researcher (Sage)",
        appearance: "Lean elf wrapped in layered scholar's robes, fingers smudged with ink and starlit chalk.",
        backstory: "Decades within the Spire of Echoes cataloging omens; now hunts matching glyphs across Azterra."
      },
      abilityMethod: "Point Buy",
      abilityScores: { str: 8, dex: 14, con: 12, int: 18, wis: 15, cha: 10 },
      proficiencies: {
        savingThrows: ["Intelligence", "Wisdom"],
        armorWeapons: ["Daggers", "Quarterstaff", "Light crossbows"],
        tools: ["Calligrapher's supplies"],
        skills: ["Arcana", "History", "Investigation"],
        languages: ["Common", "Elvish", "Draconic"]
      },
      combat: {
        armorClass: 13,
        initiative: "+2 (Dex)",
        speed: "30 ft (Elf)",
        hitPoints: "31",
        hitDice: "5d6",
        passivePerception: 12,
        proficiencyBonus: "+3"
      },
      attacks: [
        { name: "Fire Bolt", bonus: "+7", damage: "1d10 fire", tags: ["Cantrip", "120 ft"] },
        { name: "Quarterstaff", bonus: "+2", damage: "1d6 bludgeoning", tags: ["Melee"] },
        { name: "Magic Missile", bonus: "Auto", damage: "3 darts / 1d4+1 force each", tags: ["Spell"] }
      ],
      equipmentDetail: {
        starting: [
          "Amber-tipped staff etched with constellations",
          "Spellbook bound in dragonhide",
          "Explorer's pack",
          "Crystal lens focus"
        ],
        wealth: "25 gp and assorted arcane inks"
      },
      features: {
        classFeatures: ["Spellcasting (rituals)", "Arcane Recovery"],
        racialTraits: ["Keen Senses", "Fey Ancestry", "Trance"],
        background: "Researcher - knows where to find lore quickly",
        feats: []
      },
      spellsDetail: {
        ability: "Intelligence",
        saveDC: 15,
        attackBonus: "+7",
        prepared: "9 prepared / ritual casting",
        known: ["Magic Missile", "Shield", "Fireball"],
        slots: "1st:4, 2nd:3, 3rd:2"
      },
      personality: {
        traits: ["Keeps a meticulous star journal", "Soft-spoken until discussing magic"],
        ideals: ["Knowledge prevents catastrophe"],
        bonds: ["Sworn to the mentors of the Spire of Echoes"],
        flaws: ["Overanalyzes when action is needed"]
      },
      extras: {
        languages: ["Common", "Elvish", "Draconic"],
        inventoryWeight: "42 lb",
        notes: "Mana hue: deep sapphire. Uses a crystal lens as arcane focus."
      }
    }
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
    lore: "Born in the harsh badlands of Karkoth, Brog learned early that strength was the only law that mattered. He earned the name 'Ironbreaker' after shattering a warlord's shield with a single blow. Despite his fearsome reputation, Brog possesses a quiet wisdom about the natural world, respecting the spirits of the land as much as the steel in his hand.",
    sheet: {
      core: {
        hitDie: "d12",
        raceTraits: ["Darkvision", "Relentless Endurance", "Savage Attacks"],
        classFeatures: ["Rage (+2 damage)", "Unarmored Defense"],
        backgroundFeature: "Wanderer (knows terrain and food sources)",
        appearance: "Broad-shouldered half-orc with a scarred brow and weathered travel cloak.",
        backstory: "Raised in the Karkoth badlands; wanders to measure strength against worthy foes."
      },
      abilityMethod: "Standard Array",
      abilityScores: { str: 17, dex: 13, con: 16, int: 8, wis: 12, cha: 9 },
      proficiencies: {
        savingThrows: ["Strength", "Constitution"],
        armorWeapons: ["Light/Medium armor", "Shields", "Simple & martial weapons"],
        tools: ["Drum"],
        skills: ["Athletics", "Survival"],
        languages: ["Common", "Orc"]
      },
      combat: {
        armorClass: 15,
        initiative: "+1 (Dex)",
        speed: "40 ft (fast movement)",
        hitPoints: "44",
        hitDice: "4d12",
        passivePerception: 10,
        proficiencyBonus: "+2"
      },
      attacks: [
        { name: "Greataxe", bonus: "+5", damage: "1d12+3 slashing (+2 rage)", tags: ["Melee", "Heavy", "Two-Handed"] },
        { name: "Javelin", bonus: "+5", damage: "1d6+3 piercing (30/120)", tags: ["Thrown"] }
      ],
      equipmentDetail: {
        starting: ["Greataxe", "Javelin (4)", "Explorer's Pack", "Bedroll"],
        wealth: "8 gp and carved clan totem"
      },
      features: {
        classFeatures: ["Rage (3/day)", "Unarmored Defense"],
        racialTraits: ["Relentless Endurance", "Savage Attacks", "Darkvision"],
        background: "Wanderer - recalls maps and safe paths",
        feats: ["Prefers Great Weapon Master style feats"]
      },
      spellsDetail: {
        ability: "None",
        saveDC: "—",
        attackBonus: "—",
        prepared: "",
        known: ["Non-caster"],
        slots: "—"
      },
      personality: {
        traits: ["Quiet observer of storms", "Protective once angered"],
        ideals: ["Strength proves worth"],
        bonds: ["Keeps carved clan totem close"],
        flaws: ["Rushes toward the loudest battle"]
      },
      extras: {
        languages: ["Common", "Orc"],
        inventoryWeight: "68 lb",
        notes: "Prefers open-sky camps; trophies hang from the explorer's pack."
      }
    }
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
    lore: "Celeste was found on the steps of the Temple of Solara as an infant, bathed in the morning light. Raised by the priesthood, she has dedicated her life to bringing hope to the darkest corners of Azterra. Her faith is unwavering, a beacon that rallies her allies even in the direst of circumstances. It is said that her prayers can turn the tide of battle, calling down the very wrath of the sun.",
    sheet: {
      core: {
        hitDie: "d8",
        raceTraits: ["Versatile", "Bonus training from temple"],
        classFeatures: ["Channel Divinity", "Divine Domain: Light"],
        backgroundFeature: "Shelter of the Faithful",
        appearance: "Sun-embossed shield and silver holy bell, eyes warm like sunrise.",
        backstory: "Raised by Solara's priesthood; travels to carry that light into shadowed places."
      },
      abilityMethod: "Standard Array",
      abilityScores: { str: 12, dex: 11, con: 14, int: 12, wis: 18, cha: 15 },
      proficiencies: {
        savingThrows: ["Wisdom", "Charisma"],
        armorWeapons: ["Light/Medium armor", "Shields", "Simple weapons"],
        tools: ["Herbalism kit"],
        skills: ["Insight", "Medicine", "Religion"],
        languages: ["Common", "Celestial"]
      },
      combat: {
        armorClass: 18,
        initiative: "+0 (Dex)",
        speed: "30 ft",
        hitPoints: "38",
        hitDice: "5d8",
        passivePerception: 15,
        proficiencyBonus: "+3"
      },
      attacks: [
        { name: "Mace", bonus: "+4", damage: "1d6+1 bludgeoning", tags: ["Melee"] },
        { name: "Guiding Bolt", bonus: "+7", damage: "4d6 radiant", tags: ["Spell", "120 ft"] },
        { name: "Spiritual Weapon", bonus: "+7", damage: "1d8+4 force (bonus action)", tags: ["Spell"] }
      ],
      equipmentDetail: {
        starting: ["Mace", "Shield", "Holy Symbol", "Chain Mail", "Priest pack"],
        wealth: "15 gp tithe held for the temple"
      },
      features: {
        classFeatures: ["Channel Divinity (2/rest)", "Domain: Light"],
        racialTraits: ["Versatile and adaptable"],
        background: "Shelter of the Faithful - temple lodging",
        feats: []
      },
      spellsDetail: {
        ability: "Wisdom",
        saveDC: 15,
        attackBonus: "+7",
        prepared: "10 prepared including domain",
        known: ["Guiding Bolt", "Spiritual Weapon", "Mass Healing Word"],
        slots: "1st:4, 2nd:3, 3rd:2"
      },
      personality: {
        traits: ["Comforts the wounded with song", "Walks with sunrise calm"],
        ideals: ["Hope is a shared light"],
        bonds: ["Bell relic from Solara's altar"],
        flaws: ["Overextends to protect strangers"]
      },
      extras: {
        languages: ["Common", "Celestial"],
        inventoryWeight: "56 lb",
        notes: "Keeps a travel journal of miracles witnessed."
      }
    }
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
    lore: "A veteran of the Scale Wars, Drusk swore an oath of vengeance against those who would threaten the innocent. His bronze scales are scarred from countless battles, each a testament to his resilience. He views himself as a living shield, placing himself between danger and his companions without hesitation. His code is strict, but his heart burns with the fire of his ancestors.",
    sheet: {
      core: {
        hitDie: "d10",
        raceTraits: ["Draconic Ancestry (Bronze)", "Breath Weapon (lightning)", "Damage Resistance: Lightning"],
        classFeatures: ["Lay on Hands", "Divine Smite", "Fighting Style: Defense"],
        backgroundFeature: "Military Rank",
        appearance: "Bronze scales scarred from war, armor engraved with draconic script.",
        backstory: "Veteran of the Scale Wars; sworn to stand between danger and the innocent."
      },
      abilityMethod: "Standard Array",
      abilityScores: { str: 18, dex: 10, con: 16, int: 10, wis: 12, cha: 14 },
      proficiencies: {
        savingThrows: ["Wisdom", "Charisma"],
        armorWeapons: ["All armor", "Shields", "Simple & martial weapons"],
        tools: ["Vehicles (land)"],
        skills: ["Athletics", "Intimidation", "Persuasion"],
        languages: ["Common", "Draconic"]
      },
      combat: {
        armorClass: 19,
        initiative: "+0 (Dex)",
        speed: "30 ft",
        hitPoints: "54",
        hitDice: "6d10",
        passivePerception: 12,
        proficiencyBonus: "+3"
      },
      attacks: [
        { name: "Greatsword", bonus: "+7", damage: "2d6+4 slashing (+2d8 radiant smite)", tags: ["Melee", "Heavy"] },
        { name: "Lay on Hands", bonus: "—", damage: "Restore 30 hp pool", tags: ["Healing"] },
        { name: "Breath Weapon", bonus: "DC 13", damage: "2d6 lightning (5x30 ft line)", tags: ["Racial", "Recharge"] }
      ],
      equipmentDetail: {
        starting: ["Greatsword", "Plate Armor", "Insignia of rank", "Traveler's pack"],
        wealth: "20 gp and a polished bronze holy symbol"
      },
      features: {
        classFeatures: ["Lay on Hands", "Divine Smite", "Fighting Style: Defense"],
        racialTraits: ["Breath Weapon", "Lightning Resistance"],
        background: "Military Rank - respects of other soldiers",
        feats: []
      },
      spellsDetail: {
        ability: "Charisma",
        saveDC: 13,
        attackBonus: "+5",
        prepared: "8 prepared (Cha mod + level)",
        known: ["Bless", "Shield of Faith"],
        slots: "1st:4, 2nd:3"
      },
      personality: {
        traits: ["Stands as the first shield in danger", "Polishes armor nightly"],
        ideals: ["Discipline maintains order"],
        bonds: ["Oathbound to fallen comrades' families"],
        flaws: ["Overly rigid with personal codes"]
      },
      extras: {
        languages: ["Common", "Draconic"],
        inventoryWeight: "110 lb",
        notes: "Prefers to keep armor on even while resting; drinks only water on duty."
      }
    }
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
    lore: "Elyra believes that the world is made of stories, and she intends to learn them all. A wanderer by nature, she weaves magic into her music, charming kings and calming beasts alike. Her laughter is infectious, but beneath her playful exterior lies a sharp wit and a keen observer. She chronicles the party's deeds, ensuring their legend will be sung for generations to come.",
    sheet: {
      core: {
        hitDie: "d8",
        raceTraits: ["Darkvision", "Fey Ancestry", "Skill Versatility"],
        classFeatures: ["Bardic Inspiration (d8)", "Jack of All Trades", "Song of Rest"],
        backgroundFeature: "By Popular Demand",
        appearance: "Half-elf with braided silver hair and a lute etched with constellations.",
        backstory: "Travels tavern to tavern collecting legends to weave into new songs."
      },
      abilityMethod: "Point Buy",
      abilityScores: { str: 10, dex: 14, con: 12, int: 13, wis: 11, cha: 18 },
      proficiencies: {
        savingThrows: ["Dexterity", "Charisma"],
        armorWeapons: ["Light armor", "Simple weapons", "Hand crossbows", "Longswords", "Rapiers", "Shortswords"],
        tools: ["Lute", "Pan flute", "Disguise kit"],
        skills: ["Performance", "Deception", "Persuasion", "Stealth"],
        languages: ["Common", "Elvish", "Sylvan"]
      },
      combat: {
        armorClass: 15,
        initiative: "+2 (Dex)",
        speed: "30 ft",
        hitPoints: "32",
        hitDice: "5d8",
        passivePerception: 13,
        proficiencyBonus: "+3"
      },
      attacks: [
        { name: "Rapier", bonus: "+5", damage: "1d8+2 piercing", tags: ["Melee", "Finesse"] },
        { name: "Dissonant Whispers", bonus: "DC 15", damage: "3d6 psychic (1st)", tags: ["Spell", "Wis save"] },
        { name: "Hypnotic Pattern", bonus: "DC 15", damage: "Charm/incapacitate", tags: ["Spell", "Area control"] }
      ],
      equipmentDetail: {
        starting: ["Rapier", "Lute", "Pan flute", "Leather Armor", "Entertainer's pack"],
        wealth: "28 gp in performance tips"
      },
      features: {
        classFeatures: ["Bardic Inspiration (d8)", "Jack of All Trades", "Song of Rest"],
        racialTraits: ["Fey Ancestry", "Skill Versatility"],
        background: "By Popular Demand - always finds a stage",
        feats: []
      },
      spellsDetail: {
        ability: "Charisma",
        saveDC: 15,
        attackBonus: "+7",
        prepared: "Knows 11 spells / 3 cantrips",
        known: ["Dissonant Whispers", "Hypnotic Pattern", "Cure Wounds"],
        slots: "1st:4, 2nd:3, 3rd:2"
      },
      personality: {
        traits: ["Turns every scene into a story prompt", "Laughs easily, schemes quietly"],
        ideals: ["Freedom to wander and collect songs"],
        bonds: ["Protects the tales of those who trust her"],
        flaws: ["Keeps secrets for the sake of a better story"]
      },
      extras: {
        languages: ["Common", "Elvish", "Sylvan"],
        inventoryWeight: "34 lb",
        notes: "Writes nightly ballads about the day's heroes and villains."
      }
    }
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
    lore: "Flint sees magic not as a mystical force, but as a puzzle to be solved. Exiled from his clan for his unorthodox experiments, he travels the world seeking rare materials for his inventions. His mechanical companion, Cog, is his masterpiece, a testament to his genius. Flint is always tinkering, improving, and optimizing, believing that with enough gears and mana, anything is possible.",
    sheet: {
      core: {
        hitDie: "d8",
        raceTraits: ["Darkvision", "Dwarven Resilience", "Stonecunning"],
        classFeatures: ["Magical Tinkering", "Infuse Item (2 infusions)"],
        backgroundFeature: "Guild Membership",
        appearance: "Stocky dwarf with soot-stained gloves and bronze lenses perched on his brow.",
        backstory: "Exiled for unorthodox experiments; roams to find rare materials for inventions."
      },
      abilityMethod: "Point Buy",
      abilityScores: { str: 11, dex: 12, con: 15, int: 17, wis: 10, cha: 9 },
      proficiencies: {
        savingThrows: ["Constitution", "Intelligence"],
        armorWeapons: ["Light/Medium armor", "Shields", "Simple weapons"],
        tools: ["Tinker's tools", "Thieves' tools", "Smith's tools"],
        skills: ["Arcana", "Investigation", "Tinker's Tools"],
        languages: ["Common", "Dwarvish", "Gnomish"]
      },
      combat: {
        armorClass: 16,
        initiative: "+1 (Dex)",
        speed: "25 ft",
        hitPoints: "34",
        hitDice: "4d8",
        passivePerception: 11,
        proficiencyBonus: "+2"
      },
      attacks: [
        { name: "Light Crossbow", bonus: "+3", damage: "1d8+1 piercing", tags: ["Ranged", "Infused bolts"] },
        { name: "Handaxe", bonus: "+2", damage: "1d6 slashing", tags: ["Melee", "Light"] },
        { name: "Gadget Burst", bonus: "DC 13", damage: "1d8 thunder (prototype)", tags: ["Infusion", "Close burst"] }
      ],
      equipmentDetail: {
        starting: ["Handaxe", "Light Crossbow", "Tinker satchel", "Cog the mechanical raven"],
        wealth: "35 gp held for guild dues"
      },
      features: {
        classFeatures: ["Magical Tinkering", "Infuse Item (2 infusions)"],
        racialTraits: ["Dwarven Resilience", "Stonecunning"],
        background: "Guild Membership - workshop access",
        feats: []
      },
      spellsDetail: {
        ability: "Intelligence",
        saveDC: 13,
        attackBonus: "+5",
        prepared: "5 prepared artificer spells",
        known: ["Faerie Fire", "Cure Wounds"],
        slots: "1st:3, 2nd:1"
      },
      personality: {
        traits: ["Talks to his inventions", "Records observations in gear-etched shorthand"],
        ideals: ["Innovation makes the world safer"],
        bonds: ["Protects Cog as proof of his craft"],
        flaws: ["Tinkers instead of resting"]
      },
      extras: {
        languages: ["Common", "Dwarvish", "Gnomish"],
        inventoryWeight: "62 lb",
        notes: "Travels with Cog the mechanical raven; keeps spare springs in beard braid."
      }
    }
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
    lore: "Ghita struck a bargain with a shadowy entity to save her own life, a debt she is now forever paying. She walks the line between light and dark, using her deceptive charm to manipulate those around her. While her methods are questionable, her power is undeniable. She seeks a way to break her pact, but the whispers in the dark are growing louder every day.",
    sheet: {
      core: {
        hitDie: "d8",
        raceTraits: ["Darkvision", "Hellish Resistance", "Infernal Legacy"],
        classFeatures: ["Eldritch Invocations", "Pact of the Tome"],
        backgroundFeature: "False Identity",
        appearance: "Tiefling with deep violet eyes, fine robes hiding concealed daggers.",
        backstory: "Bound to a shadowed patron to escape death; walks the line between need and freedom."
      },
      abilityMethod: "Point Buy",
      abilityScores: { str: 8, dex: 14, con: 13, int: 11, wis: 12, cha: 18 },
      proficiencies: {
        savingThrows: ["Wisdom", "Charisma"],
        armorWeapons: ["Light armor", "Simple weapons"],
        tools: ["Disguise kit", "Forgery kit"],
        skills: ["Arcana", "Deception", "Sleight of Hand"],
        languages: ["Common", "Infernal"]
      },
      combat: {
        armorClass: 14,
        initiative: "+2 (Dex)",
        speed: "30 ft",
        hitPoints: "30",
        hitDice: "5d8",
        passivePerception: 13,
        proficiencyBonus: "+3"
      },
      attacks: [
        { name: "Eldritch Blast", bonus: "+7", damage: "1d10+4 force (Agonizing)", tags: ["Spell", "120 ft"] },
        { name: "Dagger", bonus: "+5", damage: "1d4+2 piercing", tags: ["Melee", "Thrown"] },
        { name: "Hex", bonus: "Bonus", damage: "+1d6 necrotic to target", tags: ["Curse", "Concentration"] }
      ],
      equipmentDetail: {
        starting: ["Dagger", "Component pouch", "Silken robes", "Book of shadows"],
        wealth: "15 gp hidden across false identities"
      },
      features: {
        classFeatures: ["Eldritch Invocations", "Pact of the Tome"],
        racialTraits: ["Hellish Resistance", "Infernal Legacy"],
        background: "False Identity - forged papers",
        feats: []
      },
      spellsDetail: {
        ability: "Charisma",
        saveDC: 15,
        attackBonus: "+7",
        prepared: "Knows 8 spells / 3 cantrips",
        known: ["Eldritch Blast", "Hex", "Shadow of Moil"],
        slots: "2 pact slots (3rd level)"
      },
      personality: {
        traits: ["Smiles while scheming", "Asks questions instead of giving answers"],
        ideals: ["Freedom from the pact above all"],
        bonds: ["Book of shadows contains true name rune"],
        flaws: ["Takes risks to prove she controls the darkness"]
      },
      extras: {
        languages: ["Common", "Infernal"],
        inventoryWeight: "29 lb",
        notes: "Eyes glow violet when channeling; keeps black candles for patron rites."
      }
    }
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
    lore: "Harran descends from a tribe of mountain dwellers who value strength above all else. He left his home to test his might against the strongest champions of the lowlands. His maul, 'Earthshaker', has felled giants and beasts alike. Though he speaks little, his actions speak volumes. He fights not for gold or glory, but for the thrill of the challenge and the honor of his ancestors.",
    sheet: {
      core: {
        hitDie: "d10",
        raceTraits: ["Powerful Build", "Stone's Endurance", "Mountain Born"],
        classFeatures: ["Second Wind", "Action Surge", "Battlemaster Maneuvers"],
        backgroundFeature: "Mercenary Life (job board contacts)",
        appearance: "Towering goliath with shale-grey skin and tally marks etched into his maul.",
        backstory: "Left the peaks to test strength against lowland champions and earn renown."
      },
      abilityMethod: "Standard Array",
      abilityScores: { str: 18, dex: 12, con: 16, int: 9, wis: 13, cha: 10 },
      proficiencies: {
        savingThrows: ["Strength", "Constitution"],
        armorWeapons: ["All armor", "Shields", "Simple & martial weapons"],
        tools: ["Vehicles (land)", "Dice set"],
        skills: ["Athletics", "Survival", "Perception"],
        languages: ["Common", "Giant"]
      },
      combat: {
        armorClass: 17,
        initiative: "+1 (Dex)",
        speed: "30 ft",
        hitPoints: "52",
        hitDice: "5d10",
        passivePerception: 12,
        proficiencyBonus: "+3"
      },
      attacks: [
        { name: "Maul 'Earthshaker'", bonus: "+7", damage: "2d6+4 bludgeoning", tags: ["Melee", "Heavy", "Two-Handed"] },
        { name: "Heavy Crossbow", bonus: "+4", damage: "1d10+1 piercing (100/400)", tags: ["Ranged", "Loading"] },
        { name: "Precision Attack", bonus: "+d8", damage: "Superiority die to hit", tags: ["Maneuver"] }
      ],
      equipmentDetail: {
        starting: ["Maul", "Heavy Crossbow", "Chain Mail", "Traveler's kit"],
        wealth: "35 gp and carved dice set"
      },
      features: {
        classFeatures: ["Second Wind", "Action Surge", "Battlemaster Maneuvers"],
        racialTraits: ["Powerful Build", "Stone's Endurance", "Mountain Born"],
        background: "Mercenary Life - access to job boards",
        feats: []
      },
      spellsDetail: {
        ability: "None",
        saveDC: "—",
        attackBonus: "—",
        prepared: "",
        known: ["Non-caster"],
        slots: "—"
      },
      personality: {
        traits: ["Speaks with actions more than words", "Measures foes with a steady gaze"],
        ideals: ["Honor through tested strength"],
        bonds: ["Earthshaker maul is his rite of passage"],
        flaws: ["Seeks the toughest fight even when tactically unwise"]
      },
      extras: {
        languages: ["Common", "Giant"],
        inventoryWeight: "92 lb",
        notes: "Tallies foes on the maul; keeps quiet watch by the campfire."
      }
    }
  }
];

export default characters.map((char) => ({
  ...char,
  color: randomColor(),
}));
