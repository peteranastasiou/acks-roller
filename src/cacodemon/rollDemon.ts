import { randName } from "../random/randName";
import { roll } from "../random/roll";
import { select } from "../random/select";
import { format8Fraction } from "../util/fractions";
import {
  BodyForm,
  bodyFormDescription,
  bodyForms,
  getBodyFormStats,
} from "./bodyForm";
import { DemonStats, Size, sizeStrings } from "./demon";
import { getRankStats, Rank, rankStrings } from "./rank";
import { rollCacodemonSpells } from "./rollSpell";
import { rollSpecialAbility } from "./specialAbilities";

export const rollDemon = (rank: Rank, body?: BodyForm): DemonStats => {
  // Roll body form if not provided
  const bodyForm: BodyForm = body || select(bodyForms);
  const winged = roll(1).d(2) === 1;

  // Generate base statistics from rank and body form
  const stats: DemonStats = {
    name: randName(),
    rank,
    bodyForm,
    winged,
    flying: winged,
    ...getRankStats(rank),
    ...getBodyFormStats(bodyForm, winged),

    // Some initial defaults, overwritten following
    mass: 0,
    height: 0,
    size: Size.MAN,
    carryingCap: 0,
    isSpellCaster: false,
    numSpecialAbilities: 0,
    specialAbilities: [],
  };

  // Update AC to include modifier
  stats.ac = stats.ac + stats.acModifier;

  // Calculate mass and size
  stats.mass = Math.round((stats.hd * 10) ** stats.bme);
  stats.carryingCap = Math.round(stats.mass * stats.ccf);
  if (stats.mass <= 35) {
    stats.size = Size.SMALL;
    stats.height = roll(1).d(2);
  } else if (stats.mass <= 400) {
    stats.size = Size.MAN;
    stats.height = 2 + roll(1).d(6);
  } else if (stats.mass <= 2000) {
    stats.size = Size.LARGE;
    stats.height = 8 + roll(1).d(4);
  } else if (stats.mass <= 8000) {
    stats.size = Size.HUGE;
    stats.height = 12 + roll(1).d(8);
  } else if (stats.mass <= 32000) {
    stats.size = Size.GIGANTIC;
    stats.height = 20 + roll(1).d(12);
  } else {
    stats.size = Size.COLOSSAL;
    stats.height = 32 + roll(1).d(8);
  }

  // Spellcaster if hasSpeech or special abilities include spell-like-ability or spellcaster
  stats.isSpellCaster = stats.hasSpeech;

  const specialAbilitySet = new Set();

  // Number of retries before giving up:
  for (let i = 0; i < 1000; i++) {
    const sa = rollSpecialAbility(stats);
    if (!sa) continue; // need to re-roll

    const newSum = stats.numSpecialAbilities + sa.value;
    if (newSum > stats.maxSpecialAbilities) {
      // Went over the cap, roll again:
      if (sa.name === "Spell-like Abilities") {
        console.warn(sa);
        console.warn(
          `${newSum} went over ${stats.maxSpecialAbilities}!!! This shouldn't happen`,
        );
      }
      continue;
    }
    if (specialAbilitySet.has(sa.name)) {
      // No duplicates
      continue;
    }

    // Accept special ability
    stats.numSpecialAbilities = newSum;
    specialAbilitySet.add(sa.name);
    stats.specialAbilities.push(sa);

    // Apply any stat changes due to special ability:
    if (sa.modifyStats) sa.modifyStats();

    if (newSum === stats.maxSpecialAbilities) {
      // We are done
      break;
    }
  }

  // Roll spells
  if (stats.isSpellCaster) {
    stats.knownSpells = rollCacodemonSpells(rank);
  }

  return stats;
};

export const formatDemonIntoRows = (stats: DemonStats): string[][] => {
  const rows: string[][] = [];
  const push = (key: string, val: any, opt?: any) => {
    rows.push([key, val, opt || ""]);
  };

  push("Rank", rankStrings[stats.rank]);
  push("Body Form", stats.bodyForm);
  push("Description", bodyFormDescription(stats.bodyForm, stats.winged));
  push("", "");
  push("Winged?", stats.winged);
  push(
    "Speed (land):",
    `${stats.landCombatSpeed}' / ${stats.landRunningSpeed}'`,
  );
  if (stats.flying) {
    push(
      "Speed (flying):",
      `${stats.flyingCombatSpeed}' / ${stats.flyingRunningSpeed}'`,
    );
  }
  push(
    "Speed (climbing):",
    `${stats.climbingCombatSpeed}' / ${stats.climbingRunningSpeed}'`,
  );
  push(
    "Speed (swimming):",
    `${stats.swimmingCombatSpeed}' / ${stats.swimmingRunningSpeed}'`,
  );
  push("BME", stats.bme);
  push("CCF", stats.ccf);
  push("Mass (pounds)", stats.mass);
  push("Size", sizeStrings[stats.size]);
  push("Height or Length (feet)", stats.height);
  push("Carrying Capacity", stats.carryingCap);
  push("Num Attacks", stats.attacks.length);
  for (const atk of stats.attacks) {
    push(`${atk.qty} ${atk.name} Attack`, atk.roll + " " + atk.damageType);
  }

  push("", "");

  // Base cacodemon stuff
  push("Resistances", "Acid, cold, electrical, fire, poisonous, seismic");
  push("Vision", "They have lightless vision (90’)");
  push(
    "Telepathy",
    "Cacodemon's possess telepathy (as the spell) allowing them to communicate with any creatures they encounter.",
  );

  // Rank stats
  push("AC", stats.ac);
  push("HD", stats.hd + "d8");
  push("Save", stats.save);
  push("Morale", stats.morale);
  push("Has Speech?", stats.hasSpeech);

  push("", "");
  push(`Num Special Abilities:`, stats.maxSpecialAbilities);
  for (const sa of stats.specialAbilities) {
    push(
      `Special Ability: ${sa.name}`,
      sa.description,
      format8Fraction(sa.value),
    );
  }

  if (stats.spellLikeAbilities) {
    push("", "");
    stats.spellLikeAbilities.forEach((spellLikeAbilty) => {
      push(
        "Spell-like Ability",
        `Cast ${spellLikeAbilty.usage}: L${spellLikeAbilty.level} ${spellLikeAbilty.name}`,
        Math.ceil(1000 * spellLikeAbilty.numAbilities) / 1000,
      );
    });
  }

  push("", "");

  push("Is Spellcaster?", stats.isSpellCaster);
  if (stats.isSpellCaster) push("Caster Level", stats.casterLevel);

  stats.knownSpells?.forEach((spell) => {
    push(`Known L${spell.level} Spell`, spell.name);
  });

  return rows;
};
