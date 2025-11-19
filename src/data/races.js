    const base = import.meta.env.BASE_URL; 

    const races = [
    {
        id: "human",
        name: "Human",
        image: `${base}images/races/human.jpg`,
        blurb: "Adaptable folk found in every corner of the world.",
        tags: ["Size: 5-6+ ft", "Speed: 30 ft walking speed", "Alignment: None"],
        description:
            "Humans are known for their ambition and versatility. They build kingdoms, trading cities, and frontier towns, and can be found in almost any role—from humble farmer to archmage.",
        traits: [
            "Ability Score Flexibility: Humans can excel in many different classes",
            "Cultural Variety: Traditions, dress, and beliefs change from region to region",
            "Shorter Lives: Human lives are brief compared to many other peoples, encouraging bold choices"
        ]
    },
    {
        id: "elf",
        name: "Elf",
        image: `${base}images/races/elf.jpg`,
        blurb: "Graceful, long-lived people attuned to magic and nature.",
        tags: ["Size: 5-6 ft", "Speed: 30 ft walking speed", "Alignment: Chaotic Good / Evil (Drows)"],
        description:
            "Elves are lithe and perceptive, with sharp senses and a natural gift for magic. Many dwell in ancient forests or hidden enclaves, carefully guarding their traditions.",
        traits: [
            "Keen Senses: Elves are hard to surprise and quick to notice details - proficient in the Perception skill",
            "Trance: Rather than sleeping, elves enter a light meditation for 4 hours a day",
            "Fey Ancestry: Magic is unable to put elves to sleep and elves have advantage against being charmed"
        ]
    },
    {
        id: "dwarf",
        name: "Dwarf",
        image: `${base}images/races/dwarf.jpg`,
        blurb: "Stout, hardy folk with a deep love of stone and metal.",
        tags: ["Size: 4-5 ft", "Speed: 25 ft walking speed", "Alignment: Lawful good"],
        description:
            "Dwarves are sturdy and determined. Many live in mountain halls or underground cities, where they mine ore and forge renowned weapons, tools, and armor.",
        traits: [
            "Darkvision: Dwarves have superior vision in dark and dim conditions",
            "Resilience: Dwarves are resistant to various poisons",
            "Craftsmanship: Many dwarves are skilled smiths, masons, or engineers",
            "Weapon Proficiency: Dwarves are proficient with battleaxes, handaxes, throwing hammers, and warhammers"
        ]
    },
    {
        id: "halfling",
        name: "Halfling",
        image: `${base}images/races/halfling.jpg`,
        blurb: "Small, cheerful wanderers with uncanny luck.",
        tags: ["Size: 3ft", "Speed: 25 ft walking speed", "Alignment: Lawful good"],
        description:
            "Halflings value comfort, good food, and close-knit communities. Many travel the world as traders or guides, using their knack for avoiding danger to stay out of trouble.",
        traits: [
            "Brave: Halflings have advantage on saving throws from being frightened",
            "Nimble: Their size makes them quick and agile in tight spaces and can move through larger creatures",
            "Lucky: Halflings can reroll the die on a 1 roll"
        ]
    },
    {
        id: "dragonborn",
        name: "Dragonborn",
        image: `${base}images/races/dragonborn.jpg`,
        blurb: "Proud, draconic humanoids who breathe elemental power.",
        tags: ["Size: 6ft+", "Speed: 30 ft walking speed", "Alignment: Extreme Good / Bad"],
        description:
            "Dragonborn carry echoes of dragon heritage in their blood. Many are driven by honor, personal excellence, or the expectations of their clan or ancestry.",
        traits: [
            "Breath Weapon: Dragonborn can exhale elemental energy in combat",
            "Scaled Resilience: Their draconic ancestry often grants resistance to a damage type",
            "Strong Identity: Each dragonborn’s ancestry is a key part of their story"
        ]
    }

    //Add more here
    
    ];

    export default races;
