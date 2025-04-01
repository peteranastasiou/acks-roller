import { randName } from "../random/randName";
import { roll } from "../random/roll";
import { select } from "../random/select";
import { bodyFormDescription, bodyForms, getBodyFormStats } from "./bodyForm";
import { DemonStats } from "./demon";
import { getRankStats, Rank, rankStrings } from "./rank";
import { rollSpecialAbility } from "./specialAbilities";

export const rollDemon = (rank: Rank): [string, any][] => {
  const rows: [string, any][] = [];
  const push = (key: string, val: any) => {
    rows.push([key, val]);
  };

  // Body form stats
  const bodyForm = select(bodyForms);
  const winged = roll(1).d(2) === 1;
  const description = bodyFormDescription(bodyForm, winged);
  const bodyStats = getBodyFormStats(bodyForm, winged);

  push("Name", randName());
  push("Rank", rankStrings[rank]);
  push("Body Form", bodyForm);
  push("Description", description);
  push("", "");
  push("Winged?", winged);
  push(
    "Land Speed (Combat / Running) feet/round",
    `${bodyStats.landCombatSpeed}' / ${bodyStats.landRunningSpeed}'`,
  );
  if (winged) {
    push(
      "Flying Speed (Combat / Running) feet/round",
      `${bodyStats.flyingCombatSpeed}' / ${bodyStats.flyingRunningSpeed}'`,
    );
  }
  push(
    "Climbing Speed (Combat / Running) feet/round",
    `${bodyStats.climbingCombatSpeed}' / ${bodyStats.climbingRunningSpeed}'`,
  );
  push(
    "Swimming Speed (Combat / Running) feet/round",
    `${bodyStats.swimmingCombatSpeed}' / ${bodyStats.swimmingRunningSpeed}'`,
  );
  push("BME", bodyStats.bme);
  push("CCF", bodyStats.ccf);
  push("Num Attacks", bodyStats.attacks.length);
  for (const atk of bodyStats.attacks) {
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
  const rankStats = getRankStats(rank);
  const stats: DemonStats = { ...rankStats, ...bodyStats };
  stats.ac = rankStats.ac + bodyStats.acModifier;
  push("AC", stats.ac);
  push("HD", stats.hd + "d8");
  push("Save", stats.save);
  push("Morale", stats.morale);
  push("Has Speech?", stats.hasSpeech);

  // TODO mass, size, carrying cap

  // TODO derive one special ability from body form

  // Spellcaster if hasSpeech or special abilities include spell-like-ability or spellcaster
  let isSpellCaster = stats.hasSpeech;

  push("", "");
  push(`Num Special Abilities:`, stats.numSpecialAbilities);
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
    push(`Special Ability: ${sa.name} (${sa.valueStr})`, sa.description);

    // Update whether it is a spellcaster
    if (sa.name.includes("Spell")) {
      isSpellCaster = true;
    }

    if (newSum === rankStats.numSpecialAbilities) {
      // We are done
      break;
    }
  }

  // TODO - if spellcaster
  // TODO spell & usage roller - most common are enchantments such as dark whisperss incite madness, infuriate beast, inspire horror, enslave

  push("", "");

  push("Is Spellcaster?", isSpellCaster);
  if (isSpellCaster) push("Caster Level", rankStats.casterLevel);

  return rows;
};
