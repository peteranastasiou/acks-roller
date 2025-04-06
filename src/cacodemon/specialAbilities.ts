import { roll } from "../random/roll";
import { select, selectMany } from "../random/select";
import { DemonStats, Size } from "./demon";
import { rollSpellLikeAbilities } from "./rollSpell";

export type SpecialAbility = {
  name: string;
  description: string;
  value: number;

  // Special Abilities may alter base stats,
  // but we can't do that until after they are accepted
  // so we defer the change to this function
  modifyStats?: () => void;
};

const damageTypes = [
  "Acidic",
  "Arcane",
  "Bludgeoning",
  "Cold",
  "Electric",
  "Fire",
  "Luminous",
  "Necrotic",
  "Piercing",
  "Poisonous",
  "Seismic",
  "Slashing",
];

export function rollSpecialAbility(
  stats: DemonStats,
): SpecialAbility | undefined {
  const r = roll(1).d(100);

  switch (r) {
    case 1:
    case 2:
      return {
        name: "Acid",
        value: 1,
        description: `The cacodemon’s attacks destroy non-magical armor or clothing on a successful hit. A non-magical weapon that strikes
the cacodemon dissolves immediately after dealing damage. Magical weapons and armor are allowed a saving throw using the
wearer’s death save, adding any magical bonus to the roll if applicable.`,
      };
    case 3:
    case 4:
      return {
        name: "Aura",
        value: 1,
        description:
          `The cacodemon is surrounded by a damaging aura that deals damage to susceptible creatures each round. The aura has
a radius of 1’ per HD, (minimum 5’) and deals 1d8 damage per round. Aura type: [` +
          select([
            "arcane",
            "acidic",
            "cold",
            "electrical",
            "fire",
            "luminous",
            "necrotic",
            "poisonous",
            "seismic",
          ]) +
          "]",
      };
    case 5:
      return {
        name: "Beserk",
        value: 1 / 4,
        description: `The cacodemon gains a +2 bonus to attack rolls and is immune to fear. Its morale score is raised to +4.`,
      };
    case 6:
    case 7: {
      return {
        name: "Bonus Attack",
        value: 1 / 4,
        description:
          `The cacodemon gains one or more bonus attacks. [` +
          select([
            `one bonus attack dealing damage equal to its primary attack`,
            `two bonus attacks each dealing damage equal to its secondary attack (or half its primary attack)`,
          ]) +
          `] If the bonus attack increases the cacodemon’s average damage to more than 4 points per HD, it counts as 1 special ability. otherwise it
counts as 1/4 special abilities. ⚠️ please check - I'm not smart enough to do this yet!`, // TODO
      };
    }
    case 8:
    case 9:
      return {
        name: "Breath Weapon",
        value: 1,
        description:
          `The cacodemon gains a dragon-like breath weapon usable 3/day. The breath weapon deals 1d6 extraordinary
damage per HD of the cacodemon, with a successful Blast save reducing damage by half. Type of breath: [` +
          select([
            "flame (fire)",
            "lightning (electric)",
            "freezing vapors (cold)",
            "poison vapor (poisonous)",
            "sonic blast (seismic)",
            "blistering corrosive (acidic)",
            "magical force (arcane)",
            "fetid gas (necrotic).",
          ]) +
          "]. Area of effect and special properties are as per a dragon.",
      };
    case 10:
    case 11:
    case 12:
      return {
        name: "Charge",
        value: 1 / 4,
        description:
          "The cacodemon is capable of making charge attacks that deal double damage dice. choose one natural attack type for the charge.",
      };
    case 13:
    case 14: {
      const numPowers = roll(1).d(4);
      return {
        name: "Class Powers/Proficiencies",
        value: numPowers / 8,
        description: `The cacodemon gains [${numPowers}] class powers or proficiencies, selected based on the cacodemon’s
overall design (Judge’s choice), excluding spellcasting. Each class power counts as 1/8 special ability`,
      };
    }
    case 15:
    case 16:
      return {
        name: "Dreadful",
        value: 1,
        description: `Creatures that start their initiative or move within 60’ of the cacodemon must succeed on Paralysis saving throws or
falter. If the creature is already cowering or faltering, it is frightened instead. Creatures with class level or HD equal to or greater
than 1/2 the cacodemon’s HD are immune to the dread.`,
      };
    case 17:
    case 18:
      return {
        name: "Enervation",
        value: 2,
        description: `A character damaged by the cacodemon’s primary attack reduces his maximum hp by the amount of damage
dealt and becomes enervated`,
      };
    case 19:
    case 20:
      return {
        name: "Enslave",
        value: 1,
        description: `The cacodemon can enslave victims to its will 3/day or by gaze. The target must succeed on a spells save or
be enslaved to the cacodemon. If the cacodemon has 3 HD or less, the save is at +2. If the cacodemon has 9 HD or more,
the save is at -2.`,
      };
    case 21:
    case 22:
    case 23:
      return {
        name: "Flying",
        value: 1 / 2,
        description: `The cacodemon is capable of flying at the speed noted for its body form. If it already flies, it becomes capable of
making dive attacks that deal double damage. If a dive hits a victim smaller than itself, it grabs and carries him off, unless the
victim makes a successful size-adjusted Paralysis save. If it already has a dive attack, re-roll.`,
        modifyStats: () => {
          stats.flying = true;
        }
      };
    case 24:
    case 25: {
      const n = roll(1).d(20);
      let d = "";
      if (n < 15) {
        d =
          "It gains a constriction attack that deals damage equal to its primary attack and restrains any creature struck that is smaller than the cacodemon";
      } else if (n < 18) {
        d = `If it hits a creature smaller than itself with at least two of its secondary attacks, the creature struck must make a successful size-adjusted Paralysis save or be grabbed`;
      } else {
        d = `If it hits a creature smaller than itself with its primary attack, the creature struck must make a
successful size-adjusted Paralysis save or be grabbed`;
      }
      return {
        name: "Grab/Restrain",
        value: 1,
        description: `The cacodemon gains the ability to grab or restrain its targets. [${d}]`,
      };
    }
    case 26:
    case 27:
      return {
        name: "Horrific",
        value: 1,
        description: `Creatures encountering the cacodemon must make a successful Paralysis save at the start of their first initiative or be
cowering until the start of their next initiative`,
      };
    case 28:
    case 29:
    case 30:
    case 31:
      return {
        name: "Hug",
        value: 1 / 4,
        description: `If the cacodemon hits with more than half its attacks during its attack sequence, it deals additional extraodinary bludgeoning damage: 2d6 if
man-sized, 2d8 if large, 2d10 if huge, 2d12 if gigantic, and 2d20 if colossal.`,
      };
    case 32:
    case 33:
    case 34:
    case 35:
    case 36:
    case 37: {
      const [d, v] = select([
        ["all mundane damage", 1],
        ["all extraordinary damage", 1],
        ["all physical damage", 1],
        ["all energy damage", 1],
        [
          `6 damage types: ${selectMany(6, damageTypes, { unique: true }).join(", ")}`,
          1,
        ],
        [
          `3 damage types: ${selectMany(3, damageTypes, { unique: true }).join(", ")}`,
          1 / 2,
        ],
        ["all mundane physical damage", 1 / 2],
        [
          `3 mundane damage types: ${selectMany(3, damageTypes, { unique: true }).join(", ")}`,
          1 / 4,
        ],
        ["all enchantment effects", 1 / 2],
        ["all death effects", 1 / 2],
        ["all transmogrification effects", 1 / 2],
      ]);
      return {
        name: "Immunity",
        value: v,
        description: `The cacodemon gains immunity to [${d}]`,
      };
    }
    case 38:
      return {
        name: "Incorporeal",
        value: 1,
        description: `The cacodemon is formless, weightless, and unable to interact with physical objects except through its attacks
or special abilities. It becomes immune to mundane damage. However, if an incorporeal cacodemon has 4 HD or less, it considers
damage dealt by silver weapons to be extraordinary damage. It can select enervation and flying as special abilities.`,
      };
    case 39:
      return {
        name: "Infectious",
        value: 1 / 4,
        description: `The cacodemon is able to transform its victims into others of its kind or a lesser kind. creatures slain by the
cacodemon might rise as cacodemons of its type unless appropriate measures are taken; or victims suffering loss of half or more of
their hit points to the cacodemon’s natural attacks might become a cacodemon of its type after 2d6 days`,
      };
    case 40:
    case 41:
      return {
        name: "Invisibility",
        value: 1,
        description:
          "The cacodemon is naturally invisible. It may act freely, including attacking, without becoming visible",
      };
    case 42:
    case 43:
      return {
        name: "Lightning Reflexes",
        value: 1 / 4,
        description:
          "The cacodemon is extremely fast, and gains a +2 bonus to initiative.",
      };
    case 44:
      return {
        name: "Magic Resistance",
        value: 1,
        description:
          "The cacodemon gains magic resistance with a throw modifier equal to its HD – 7.",
      };
    case 45:
    case 46:
    case 47:
    case 48:
      return {
        name: "Ongoing Damage",
        value: 1 / 2,
        description: `Once the cacodemon has hit its victim, it can use its combat action to automatically deal ongoing
damage each round equal to its most damaging attack. It does not grab or restrain the target, but it does count as encumbrance
equal to its weight.`,
      };
    case 49:
    case 50:
    case 51:
      return {
        name: "Paralysis",
        value: 1,
        description: `Victims of the cacodemon’s primary attack(s) must make a successful Paralysis save or become paralyzed. Roll 1d6:
1-2, paralysis lasts for 1d10 rounds; 3-6, paralysis lasts for 2d4 turns.`,
      };
    case 52:
    case 53:
      return {
        name: "Petrification",
        value: 2,
        description:
          `Any victim that [` +
          select([
            "beholds the cacodemon’s gaze (as medusa)",
            "is struck by the cacodemon’s attack(s)",
          ]) +
          `] is required to make a successful Paralysis save or be turned to stone.`,
      };
    case 54:
    case 55:
    case 56:
    case 57:
    case 58:
    case 59:
    case 60:
    case 61:
      return {
        name: "Poison",
        value: 1,
        description: `Creatures damaged by the cacodemon’s primary attack(s) must make successful death save or be poisoned. Roll 1d20
to determine onset time: 1-12, instant (at the end of the cacodemon’s initiative); 13-14, 1 turn; 15, 1d4 turns; 16-19 1d4+2 turns;
20, 1 d10 turns. roll 1d20 to determine effect 1-16, death; 17-19: paralysis 2d4 turns + 1d6 damage per HD; 20: incapacitation. If
the cacodemon has 3 HD or less, the save is at +2. If the cacodemon has 9 HD or more, the save is at -2.`,
      };
    case 62:
    case 63: {
      let types: string[] = [];
      if (roll(1).d(2) === 1) {
        // "usually fire and acid" - interpretting "usually" to mean 50% of the time
        types = ["fire", "acid"];
      } else {
        // Select two unique damage types
        types = selectMany(2, damageTypes, { unique: true });
      }
      return {
        name: "Regeneration",
        value: 1,
        description: `The cacodemon regenerates hit points each round, with the ability to re-attach lost limbs, unless the damage is
of two particular types (usually fire and acid): [${types}]. The amount regenerated will be HD/2 per round.`,
      };
    }
    case 64:
    case 65:
    case 66:
    case 67: {
      const opts: (() => [string, number])[] = [
        () => ["all mundane damage", 1 / 2],
        () => ["all extraordinary damage", 1 / 2],
        () => ["all physical damage", 1 / 2],
        () => ["all energy damage", 1 / 2],
        () => [
          `any damage types: [${selectMany(6, damageTypes, { unique: true }).join(", ")}]`,
          1 / 2,
        ],
        () => [
          `any damage types: [${selectMany(3, damageTypes, { unique: true }).join(", ")}]`,
          1 / 4,
        ],
        () => ["all mundane physical damage types", 1 / 4],
        () => [
          `mundane damage types: [${selectMany(3, damageTypes, { unique: true }).join(", ")}]`,
          1 / 8,
        ],
        () => ["all enchantment effects", 1 / 4],
        () => ["all death effects", 1 / 4],
        () => ["all transmogrification effects", 1 / 4],
      ];
      const d1: [string, number] = select(opts)();
      const d2: [string, number] = select(opts)();
      const value = d1[1] + d2[1];

      return {
        name: "Resistance",
        value,
        description: `The cacodemon gains resistances: [${d1[0]}, ${d2[0]}].  If the same effect is rolled twice, the cacodemon becomes immune (as above).
re-roll if the cacodemon is already immune to the effect.`, // TODO
      };
    }
    case 68:
    case 69: {
      const d: [string, number] = select([
        [`Acute Hearing`, 1 / 8],
        [`Acute olfaction`, 1 / 8],
        ["Acute vision", 1 / 8],
        ["Night vision", 1 / 8],
        ["Echolocation", 1 / 4],
        [
          `Mechanoreception. Choose type of mechanoreception based on
the cacodemon’s other capabilities. Aerial mechanoreception and echolocation range is equal to its best encounter speed. Aquatic
mechanoreception is equal to its swimming encounter speed.`,
          1 / 4,
        ],
      ]);
      return {
        name: "Special Senses",
        value: d[1],
        description: d[0],
      };
    }
    case 70:
    case 71:
      if (stats.isSpellCaster) {
        // reroll if already spellcaster
        return undefined;
      }

      return {
        name: "Spellcasting",
        value: 2,
        description: `The cacodemon may cast spells as if it were a mage of the class level shown on the cacodemon Primary characteristics by rank table.`,
        modifyStats: () => {
          stats.isSpellCaster = true;
        },
      };
    case 72:
    case 73:
    case 74:
    case 75: {
      const remainingNumAbilities =
        stats.maxSpecialAbilities - stats.numSpecialAbilities;
      const [spellLikeAbilities, numAbilities] = rollSpellLikeAbilities(
        remainingNumAbilities,
      );

      return {
        name: "Spell-like Abilities",
        value: numAbilities,
        description: `The cacodemon gains spell-like abilities`,
        modifyStats: () => {
          stats.spellLikeAbilities = spellLikeAbilities;
        },
      };
    }
    case 76:
    case 77:
    case 78:
    case 79:
    case 80:
      return {
        name: "Stealth",
        value: 1 / 8,
        description:
          "The cacodemon is difficult to notice. Characters encountering the cacodemon at any time suffer a -2 penalty to surprise rolls.",
      };
    case 81:
    case 82:
    case 83:
      if (stats.size < Size.HUGE) return undefined;

      return {
        name: "Swallow Attack",
        value: 1,
        description: ` The cacodemon can swallow whole victims two size categories smaller than itself on an unmodified attack
throw of 20. A victim that is swallowed whole takes damage equal to the cacodemon’s HD each round until the cacodemon is
killed or the victim dies. If the cacodemon is of gigantic size, it can swallow on 19-20; if of colossal size, on 18-20. If the cacodemon
is not at least huge size, re-roll`,
      };
    case 84:
    case 85:
    case 86:
      return {
        name: "Swift",
        value: 1 / 4,
        description:
          "The cacodemon moves rapidly. Its speed is increased by 30’ for every 120’ of base encounter movement",
      };
    case 87:
    case 88:
      return {
        name: "Terrifying",
        value: 1,
        description: `The cacodemon can cause panic and terror by taking a combat action. The area of effect is 100 square feet per
HD. each affected creature must succeed on a Paralysis save or become frightened. creatures with class level or HD of 1/2 the
cacodemon’s HD or less falter even if the save succeeds.`,
      };
    case 89:
    case 90:
    case 91:
      if (stats.size < Size.HUGE) return undefined;

      return {
        name: "Topple and Fling",
        value: 1 / 2,
        description: `When the cacodemon hits with its primary attack, it can topple and fling creatures at least one size
category smaller than itself. The creature struck must make a size-adjusted Paralysis saving throw. If the save fails, the creature is
knocked prone and forced back a number of feet equal to the damage dealt. If this would push the creature into a wall or other
obstacle, the creature takes 1d6 mundane bludgeoning damage per 10’ he has traveled. If the cacodemon is not at least huge sized, re-roll`,
      };
    case 92:
    case 93:
    case 94: {
      // Work out whether this is 1 or 1/4 special abilities
      const r = roll(1).d(4);
      const newAc = stats.ac + r;
      const limit = 1.5 * stats.hd;
      const isWorthOne = newAc > limit;

      return {
        name: "Tough",
        value: isWorthOne ? 1 : 1 / 4,
        description: `The cacodemon is unusually tough or hardy. Its AC is increased by 1d4 points [${stats.ac} + 1d4:${r} = ${newAc}]. If this increases its AC to more than
its HD × 1.5 [${limit}], this counts as a 1 special ability. otherwise it counts as 1/4 special ability.`,
        modifyStats: () => {
          // Apply the AC change once special ability is accepted
          console.log(`AC updated from ${stats.ac} to ${newAc}`);
          stats.ac = newAc;
        },
      };
    }
    case 95:
    case 96:
    case 97:
      if (stats.size < Size.LARGE) return undefined;

      return {
        name: "Trample",
        value: 1 / 4,
        description: `The cacodemon gains a trample attack which it may use in lieu of its normal attack sequence. The trample attack
should inflict an average of 2 hp of mundane bludgeoning damage per HD the cacodemon possesses. The cacodemon gains a +4 bonus to attack
targets smaller than itself and can force back such creatures. If the cacodemon is not at least large sized, re-roll`,
      };
    case 98:
    case 99:
      if (stats.size < Size.LARGE) return undefined;

      return {
        name: "Vicious Attack",
        value: 1 / 2,
        description: `The cacodemon has a vicious attack. on an unmodified attack throw of 20, the creature struck by the
attack must make a death save. If the save succeeds, the creature suffers double damage. If the save fails, the creature suffers triple
damage and has a limb broken. If the cacodemon is of gigantic size, it can dismember on 19-20; if of colossal size, on 18-20. If the
cacodemon is not at least large sized, re-roll`,
      };
    case 100:
    default:
      return {
        name: "Unusual",
        value: 1,
        description: `The cacodemon has a rare, unique, or special power determined by the Judge. If the Judge doesn’t have time
to be creative, re-roll.`,
      };
  }
}
