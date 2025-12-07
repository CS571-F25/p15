// D&D 5e Calculation Utilities

/**
 * Calculate ability modifier from ability score
 * @param {number} score - Ability score (1-30)
 * @returns {number} - Modifier value
 */
export function getAbilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

/**
 * Format modifier with + or - sign
 * @param {number} modifier - The modifier value
 * @returns {string} - Formatted string like "+3" or "-1"
 */
export function formatModifier(modifier) {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

/**
 * Calculate saving throw value
 * @param {number} abilityScore - The ability score
 * @param {number} profBonus - Proficiency bonus
 * @param {boolean} isProficient - Whether proficient in this save
 * @returns {number} - Total saving throw modifier
 */
export function getSavingThrow(abilityScore, profBonus, isProficient) {
  const abilityMod = getAbilityModifier(abilityScore);
  return isProficient ? abilityMod + profBonus : abilityMod;
}

/**
 * Calculate skill modifier
 * @param {number} abilityScore - The ability score for this skill
 * @param {number} profBonus - Proficiency bonus
 * @param {boolean} isProficient - Whether proficient in this skill
 * @param {boolean} hasExpertise - Whether has expertise (double proficiency)
 * @returns {number} - Total skill modifier
 */
export function getSkillModifier(abilityScore, profBonus, isProficient, hasExpertise = false) {
  const abilityMod = getAbilityModifier(abilityScore);
  if (hasExpertise) return abilityMod + (profBonus * 2);
  if (isProficient) return abilityMod + profBonus;
  return abilityMod;
}

/**
 * Calculate passive score (10 + skill modifier)
 * @param {number} skillModifier - The skill modifier
 * @param {number} bonus - Any additional bonuses (e.g., Observant feat)
 * @returns {number} - Passive score
 */
export function getPassiveScore(skillModifier, bonus = 0) {
  return 10 + skillModifier + bonus;
}

/**
 * Calculate initiative modifier
 * @param {number} dexScore - Dexterity score
 * @param {number} bonus - Any additional bonuses
 * @returns {number} - Initiative modifier
 */
export function getInitiative(dexScore, bonus = 0) {
  return getAbilityModifier(dexScore) + bonus;
}

/**
 * Calculate spell save DC
 * @param {number} spellAbilityScore - Spellcasting ability score
 * @param {number} profBonus - Proficiency bonus
 * @returns {number} - Spell save DC
 */
export function getSpellSaveDC(spellAbilityScore, profBonus) {
  return 8 + getAbilityModifier(spellAbilityScore) + profBonus;
}

/**
 * Calculate spell attack bonus
 * @param {number} spellAbilityScore - Spellcasting ability score
 * @param {number} profBonus - Proficiency bonus
 * @returns {number} - Spell attack bonus
 */
export function getSpellAttackBonus(spellAbilityScore, profBonus) {
  return getAbilityModifier(spellAbilityScore) + profBonus;
}

/**
 * D&D 5e skill to ability mapping
 */
export const SKILL_ABILITIES = {
  'Acrobatics': 'dex',
  'Animal Handling': 'wis',
  'Arcana': 'int',
  'Athletics': 'str',
  'Deception': 'cha',
  'History': 'int',
  'Insight': 'wis',
  'Intimidation': 'cha',
  'Investigation': 'int',
  'Medicine': 'wis',
  'Nature': 'int',
  'Perception': 'wis',
  'Performance': 'cha',
  'Persuasion': 'cha',
  'Religion': 'int',
  'Sleight of Hand': 'dex',
  'Stealth': 'dex',
  'Survival': 'wis'
};

/**
 * Ability score abbreviations
 */
export const ABILITY_NAMES = {
  str: 'Strength',
  dex: 'Dexterity', 
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma'
};

/**
 * Get all skills sorted alphabetically
 */
export function getAllSkills() {
  return Object.keys(SKILL_ABILITIES).sort();
}
