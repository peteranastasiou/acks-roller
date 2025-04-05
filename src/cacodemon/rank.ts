import { roll } from "../random/roll";

export type RankStats = {
  ac: number;
  hd: number;
  save: string;
  morale: number;
  maxSpecialAbilities: number;
  hasSpeech: boolean;
  casterLevel: number;
};

export enum Rank {
  Spawn = 0,
  Imp = 1,
  Gremlin = 2,
  Hellion = 3,
  Incubus = 4,
  Demon = 5,
  Dybbuk = 6,
  Devil = 7,
  Fiend = 8,
  Archfiend = 9,
}

export const rankStrings = [
  "Spawn",
  "Imp",
  "Gremlin",
  "Hellion",
  "Incubus",
  "Demon",
  "Dybbuk",
  "Devil",
  "Fiend",
  "Archfiend",
];

/**
 * Get statistics based on rank
 */
export const getRankStats = (rank: Rank): RankStats => {
  const chanceOfSpeech = [1, 2, 5, 10, 20, 35, 50, 75, 100, 100][rank];
  const hasSpeech = roll(1).d(100) <= chanceOfSpeech;
  return {
    ac: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12][rank],
    hd: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20][rank],
    save: ["F2", "F4", "F6", "F8", "F10", "F12", "F14", "F16", "F18", "F20"][
      rank
    ],
    morale: [0, 0, 0, 0, 1, 1, 1, 2, 2, 3][rank],
    maxSpecialAbilities: [2, 2, 2, 2, 3, 3, 3, 4, 4, 5][rank],
    hasSpeech,
    casterLevel: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20][rank],
  };
};
