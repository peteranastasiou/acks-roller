import { selectMany } from "../random/select";
import { spellsArcane } from "../spells/spells";
import { Rank } from "./rank";

export type Spell = {
  name: string;
  level: number;
}


/**
 * Roll spell-like abilities from arcane and divine spells
 */


/**
 * Pick random arcane spells at the caster level
 * 
 */
export const rollCacodemonSpells = (rank: Rank): Spell[] => {
  // For each spell level
  return getNumberOfSpellsPerLevel(rank).flatMap((numberOfSpells, spellLevelZeroIndexed) => {
    // Select required number of unique spells
    return selectMany(numberOfSpells, spellsArcane[spellLevelZeroIndexed], {unique: true}).map(
      (spellName: string) => ({
        name: spellName,
        level: spellLevelZeroIndexed + 1
      })
    );
  })
}

/**
 * Get number of spells at each level e.g. [3, 2] means 3 L1, 2 L2
 */
const getNumberOfSpellsPerLevel = (rank: Rank): number[] => {
  console.log(typeof(rank) + rank);
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