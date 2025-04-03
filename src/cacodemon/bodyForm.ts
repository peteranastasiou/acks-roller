import { select } from "../random/select";

export type BodyForm =
  | "Arachnine"
  | "Humanoid"
  | "Monadine"
  | "Scolopendrine"
  | "Wyverine";

export const bodyForms: BodyForm[] = [
  "Arachnine",
  "Humanoid",
  "Monadine",
  "Scolopendrine",
  "Wyverine",
];

export type Attack = {
  name: string;
  qty: number;
  damageType: string;
  roll: string;
};

export type BodyFormStats = {
  acModifier: number;
  landCombatSpeed: number;
  landRunningSpeed: number;
  flyingCombatSpeed: number;
  flyingRunningSpeed: number;
  climbingCombatSpeed: number;
  climbingRunningSpeed: number;
  swimmingCombatSpeed: number;
  swimmingRunningSpeed: number;
  bme: number;
  ccf: number;
  attacks: Attack[];
};

/**
 * Cast a string to body form or undefined if invalid
 */
export const toBodyForm = (body: string): BodyForm | undefined => {
  const bodyForm = body as BodyForm;
  return bodyForms.includes(bodyForm) ? bodyForm : undefined;
};

/**
 * Generate body form description
 */
export const bodyFormDescription = (b: BodyForm, winged: boolean): string => {
  switch (b) {
    case "Arachnine":
      return `Arachnine cacodemons resemble giant spiders,
with chitinous segmented eight-legged bodies, fanged
chelicerae, web-making spinnerets, and up to eight
insect-like eyes. ${winged ? "Winged arachnine cacodemons add a pair of dragonfly-like wings." : ""}
Arachnines can climb at their land encounter speed. Arachnine cacodemons
may select the poison special ability if desired.`;

    case "Humanoid":
      return `Humanoid cacodemons are bipedal,
two-armed, two-legged creatures. Some are beautiful
and majestic, resembling elves, men, or gods. Others are
hideous to behold, resembling minotaurs, ogres, owlbeasts,
or worse. ${winged ? "Wings sprout from the shoulder blades; they are typically bat-like, but feathered avian wings and membranous insect wings are also possible." : ""}
`;
    case "Monadine":
      return `Monadine cacodemons appear as amorphous blobs
of cytoplasmic ichor, capable of changing their shape, forming
stalks, and extruding pseudopods. Some monadine cacodemons
may have blinking eyes, agonized human faces, or pulsating
organs visible on or within their cytoplasm. 
${winged ? "Winged monadine are capable of propelling themselves into the air and forming their bodies into a wing-like surface." : ""}`;
    case "Scolopendrine":
      return `Scolopendrine cacodemons resemble enormous
carrion horrors, with long segmented bodies with a pair of legs on
every segment, terminating in a head festered with elongated
mandibles and eight tentacle-like antenna.
${winged ? "Winged scolopendrine gain a pair of membranous wings on every segment. " : ""}
Scolopendrine cacodemons may select the paralysis
special ability if desired.`;
    case "Wyverine":
      return `Wyverine cacodemons have bipedal body forms
with two vestigial arms (like a tyrannosaur). ${winged ? "If wings are present, they replace the arms (like a bat or bird)." : ""} 
${
  winged
    ? "Winged wyvernine cacodemons may select the dive attack special ability"
    : "Wingless wyvernine cacodemons may select the berserk special ability."
}`;
  }
};

export const getBodyFormStats = (
  bodyForm: BodyForm,
  hasWings: boolean,
): BodyFormStats => {
  switch (bodyForm) {
    case "Arachnine":
      return {
        acModifier: +1,
        landCombatSpeed: 20,
        landRunningSpeed: 60,
        flyingCombatSpeed: 40,
        flyingRunningSpeed: 120,
        climbingCombatSpeed: 20,
        climbingRunningSpeed: 60,
        swimmingCombatSpeed: 0,
        swimmingRunningSpeed: 0,
        bme: 1.5,
        ccf: 0.3,
        attacks: [
          {
            name: "Bite",
            qty: 1,
            damageType: "Extraordinary piercing",
            roll: "1d8",
          },
        ],
      };
    case "Humanoid":
      return {
        acModifier: 0,
        landCombatSpeed: hasWings ? 30 : 40,
        landRunningSpeed: hasWings ? 90 : 120,
        flyingCombatSpeed: 20,
        flyingRunningSpeed: 60,
        climbingCombatSpeed: 0,
        climbingRunningSpeed: 0,
        swimmingCombatSpeed: 0,
        swimmingRunningSpeed: 0,
        bme: 2,
        ccf: 0.033,
        attacks: [
          {
            name: "Claws",
            qty: 2,
            damageType: "Extraordinary slashing",
            roll: "1d2",
          },
          {
            name: "Bite",
            qty: 1,
            damageType: "Extraordinary piercing",
            roll: "1d3",
          },
        ],
      };
    case "Monadine":
      return {
        acModifier: 0,
        landCombatSpeed: 10,
        landRunningSpeed: 30,
        flyingCombatSpeed: 20,
        flyingRunningSpeed: 60,
        climbingCombatSpeed: 10,
        climbingRunningSpeed: 30,
        swimmingCombatSpeed: 10,
        swimmingRunningSpeed: 30,
        bme: 2.08,
        ccf: 0,
        attacks: [
          {
            name: "Envelopment",
            qty: 1,
            damageType: "Extraordinary bludgeoning",
            roll: "1d8",
          },
        ],
      };
    case "Scolopendrine":
      return {
        acModifier: 0,
        landCombatSpeed: 40,
        landRunningSpeed: 120,
        flyingCombatSpeed: 60,
        flyingRunningSpeed: 180,
        climbingCombatSpeed: 0,
        climbingRunningSpeed: 0,
        swimmingCombatSpeed: 0,
        swimmingRunningSpeed: 0,
        bme: 1.5,
        ccf: 0.2,
        attacks: [
          {
            name: "Tentacles",
            qty: 8,
            damageType: "Extraordinary bludgeoning",
            roll: "0",
          },
          {
            name: "Bite",
            qty: 1,
            damageType: "Extraordinary piercing",
            roll: "1d6",
          },
        ],
      };
    case "Wyverine": {
      return {
        acModifier: +1,
        landCombatSpeed: hasWings ? 30 : 40,
        landRunningSpeed: hasWings ? 90 : 120,
        flyingCombatSpeed: 80,
        flyingRunningSpeed: 240,
        climbingCombatSpeed: 0,
        climbingRunningSpeed: 0,
        swimmingCombatSpeed: 0,
        swimmingRunningSpeed: 0,
        bme: 1.72,
        ccf: 0.2,
        // Randomly pick talons or bite/sting
        attacks: select([
          [
            {
              name: "Talons",
              qty: 2,
              damageType: "Extraordinary slashing",
              roll: "1d4",
            },
          ],
          [
            {
              name: "Bite",
              qty: 1,
              damageType: "Extraordinary piercing",
              roll: "1d4",
            },
            {
              name: "Sting",
              qty: 1,
              damageType: "Extraordinary piercing",
              roll: "1d4",
            },
          ],
        ]),
      };
    }
  }
};
