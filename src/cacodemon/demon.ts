import { BodyForm, BodyFormStats } from "./bodyForm";
import { Rank, RankStats } from "./rank";
import { SpecialAbility } from "./specialAbilities";

export type DemonStats = BodyFormStats &
  RankStats & {
    rank: Rank;
    bodyForm: BodyForm;
    winged: boolean;
    mass: number;
    size: Size;
    height: number;
    carryingCap: number;
    isSpellCaster: boolean;
    specialAbilities: SpecialAbility[];
  };

export enum Size {
  SMALL = 0,
  MAN = 1,
  LARGE = 2,
  HUGE = 3,
  GIGANTIC = 4,
  COLOSSAL = 5,
}

export const sizeStrings = [
  "Small",
  "Man-Sized",
  "Large",
  "Huge",
  "Gigantic",
  "Colossal",
];
