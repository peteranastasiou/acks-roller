import { BodyForm, BodyFormStats } from "./bodyForm";
import { Rank, RankStats } from "./rank";
import { SpecialAbility } from "./specialAbilities";

export type DemonStats = BodyFormStats & RankStats & {
  rank: Rank,
  bodyForm: BodyForm,
  winged: boolean,
  mass: number;
  carryingCap: number;
  isSpellCaster: boolean;
  specialAbilities: SpecialAbility[];
};
