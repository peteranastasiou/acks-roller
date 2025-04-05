import { roll } from "../random/roll";
import { select, selectMany } from "../random/select";
import { spellsArcane, spellsDivine } from "../spells/spells";
import { Rank } from "./rank";

export type Spell = {
  name: string;
  level: number;
};

export type SpellLikeAbility = Spell & {
  usage: string;
  numAbilities: number;
};

/**
 * Roll spell-like abilities from arcane and divine spells
 * @returns [spellLikeAbilities, totalNumSpecialAbilities]
 */
export const rollSpellLikeAbilities = (
  remainingNumAbilities: number,
): [SpellLikeAbility[], number] => {
  const numSpellLikeAbilities = roll(1).d(4);
  const knownSpells: string[] = [];
  const spellLikeAbilities: SpellLikeAbility[] = [];
  let totalCost = 0;

  // Each ability counts as 2 * level * usage factor
  for (let i = 0; i < numSpellLikeAbilities; i++) {
    // Randomly pick arcane or divine
    const spellList = roll(1).d(2) === 1 ? spellsArcane : spellsDivine;

    // Randomly pick a spell level
    const spellLevel = roll(1).d(6);
    const spellLevelZeroIndexed = spellLevel - 1;

    // Randomly pick a spell
    const spellName: string = select(spellList[spellLevelZeroIndexed], {
      exclude: knownSpells,
    });

    // Pick the highest usage factor that wont break the budget
    for (const usageFactor of usageFactors) {
      const cost = 0.25 * spellLevel * usageFactor[1];

      if (cost < remainingNumAbilities) {
        // We can afford it, stop here
        remainingNumAbilities -= cost;
        knownSpells.push(spellName);
        spellLikeAbilities.push({
          level: spellLevel,
          name: spellName,
          usage: usageFactor[0],
          numAbilities: cost,
        });
        totalCost += cost;
        break;
      }
    }
  }
  // Round to the nearest 1/8:
  totalCost = Math.ceil(totalCost * 8) / 8;
  return [spellLikeAbilities, totalCost];
};

/**
 * Pick random arcane spells at the caster level
 *
 */
export const rollCacodemonSpells = (rank: Rank): Spell[] => {
  // For each spell level
  return getNumberOfSpellsPerLevel(rank).flatMap(
    (numberOfSpells, spellLevelZeroIndexed) => {
      // Select required number of unique spells
      return selectMany(numberOfSpells, spellsArcane[spellLevelZeroIndexed], {
        unique: true,
      }).map((spellName: string) => ({
        name: spellName,
        level: spellLevelZeroIndexed + 1,
      }));
    },
  );
};

const usageFactors: [string, number][] = [
  ["at will", 1],
  ["once per turn", 0.8],
  ["once per 3 turns", 0.7],
  ["once per hour", 0.6],
  ["3 times per day", 0.5],
  ["once per day", 0.4],
  ["once per week", 0.3],
  ["once per month", 0.2],
  ["once per season", 0.1],
  ["once per year", 0.05],
];

/**
 * Get number of spells at each level e.g. [3, 2] means 3 L1, 2 L2
 */
const getNumberOfSpellsPerLevel = (rank: Rank): number[] => {
  switch (rank) {
    case Rank.Spawn:
      return [2];
    case Rank.Imp:
      return [2, 2];
    case Rank.Gremlin:
      return [2, 2, 2];
    case Rank.Hellion:
      return [3, 3, 2, 2];
    case Rank.Incubus:
      return [3, 3, 3, 3, 2];
    case Rank.Demon:
      return [4, 4, 3, 3, 3, 2];
    case Rank.Dybbuk:
      return [4, 4, 4, 4, 3, 3];
    case Rank.Devil:
      return [4, 4, 4, 4, 4, 4];
    case Rank.Fiend:
      return [5, 5, 5, 5, 4, 4];
    case Rank.Archfiend:
      return [5, 5, 5, 5, 5, 5];
    default:
      throw new Error(`Unexpected rank: ${rank}`);
  }
};
