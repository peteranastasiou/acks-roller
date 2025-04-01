import { randName } from "../random/randName";
import { roll } from "../random/roll";
import { select } from "../random/select";
import { bodyFormDescription, bodyForms, getBodyFormStats } from "./bodyForm";
import { DemonStats } from "./demon";
import { getRankStats, Rank, rankStrings } from "./rank";
import { rollSpecialAbility } from "./specialAbilities";

export const rollDemon = (rank: Rank): DemonStats => {
  // Roll body form
  const bodyForm = select(bodyForms);
  const winged = roll(1).d(2) === 1;

  // Generate base statistics from rank and body form
  const stats: DemonStats = {
    rank,
    bodyForm,
    winged,
    ...getRankStats(rank),
    ...getBodyFormStats(bodyForm, winged),
    mass: 0,
    carryingCap: 0,
    isSpellCaster: false,
    specialAbilities: [],
  };

  // Update AC to include modifier
  stats.ac = stats.ac + stats.acModifier;

  stats.mass = (stats.hd * 10)**stats.bme;
  stats.carryingCap = stats.mass * stats.ccf;

  // Spellcaster if hasSpeech or special abilities include spell-like-ability or spellcaster
  stats.isSpellCaster = stats.hasSpeech;

  let specialAbilitySum = 0;
  const specialAbilitySet = new Set();

  // Number of retries before giving up:
  for (let i = 0; i < 1000; i++) {
    const sa = rollSpecialAbility(stats);
    const newSum = specialAbilitySum + sa.value;
    if (newSum > stats.numSpecialAbilities) {
      // Went over the cap, roll again:
      continue;
    }
    if (specialAbilitySet.has(sa.name)) {
      // No duplicates
      continue;
    }

    // Accept special ability
    specialAbilitySum = newSum;
    specialAbilitySet.add(sa.name);
    stats.specialAbilities.push(sa);

    // Apply any stat changes due to special ability:
    if(sa.modifyStats) sa.modifyStats();

    // Update whether it is a spellcaster
    if (sa.name.includes("Spell")) {
      stats.isSpellCaster = true;
    }

    if (newSum === stats.numSpecialAbilities) {
      // We are done
      break;
    }
  }

  return stats;
};

export const formatDemonIntoRows = (stats: DemonStats): [string, string][] => {
  const rows: [string, string][] = [];
  const push = (key: string, val: any) => {
    rows.push([key, val]);
  };

  push("Name", randName());
  push("Rank", rankStrings[stats.rank]);
  push("Body Form", stats.bodyForm);
  push("Description", bodyFormDescription(stats.bodyForm, stats.winged));
  push("", "");
  push("Winged?", stats.winged);
  push(
    "Land Speed (Combat / Running) feet/round",
    `${stats.landCombatSpeed}' / ${stats.landRunningSpeed}'`,
  );
  if (stats.winged) {
    push(
      "Flying Speed (Combat / Running) feet/round",
      `${stats.flyingCombatSpeed}' / ${stats.flyingRunningSpeed}'`,
    );
  }
  push(
    "Climbing Speed (Combat / Running) feet/round",
    `${stats.climbingCombatSpeed}' / ${stats.climbingRunningSpeed}'`,
  );
  push(
    "Swimming Speed (Combat / Running) feet/round",
    `${stats.swimmingCombatSpeed}' / ${stats.swimmingRunningSpeed}'`,
  );
  push("BME", stats.bme);
  push("CCF", stats.ccf);
  push("Num Attacks", stats.attacks.length);
  for (const atk of stats.attacks) {
    push(`${atk.qty} ${atk.name} Attack`, atk.roll + " " + atk.damageType);
  }

  push("", "");

  // Base cacodemon stuff
  push(
    "Resistances",
    "Resistant to acidic, cold, electrical, fire, poisonous, and seismic damage.",
  );
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
  push(`Num Special Abilities:`, stats.numSpecialAbilities);
  for(const sa of stats.specialAbilities) {
    push(`Special Ability: ${sa.name} (${sa.valueStr})`, sa.description);
  }

  // TODO - if spellcaster
  // TODO spell & usage roller - most common are enchantments such as dark whisperss incite madness, infuriate beast, inspire horror, enslave

  push("", "");

  push("Is Spellcaster?", stats.isSpellCaster);
  if (stats.isSpellCaster) push("Caster Level", stats.casterLevel);

  return rows;
}