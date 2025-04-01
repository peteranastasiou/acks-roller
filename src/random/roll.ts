/**
 * Usage: roll(3).d(6);  // rolls 3d6
 */
export const roll = (
  numberOfRolls: number,
): { d: (numberOfSides: number) => number } => ({
  d: (numberOfSides: number) =>
    // Loop `numberOfRolls` times
    [...Array(numberOfRolls)].reduce(
      // Accumulate random value from 1 to numberOfSides
      (acc) => (acc += 1 + Math.floor(numberOfSides * Math.random())),
      0, // initial value
    ),
});

// TODO lowest(3).of(3).d(6)
