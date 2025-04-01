import { roll } from "./roll";

/**
 * Print a histogram of the dice roller
 * @param k number of rolls
 * @param n number of sides
 *
 * Used to manually verify roll against https://anydice.com
 */
export function rollHistogram(k: number, n: number) {
  const resultMap = [...Array(10000)].reduce((acc) => {
    const r = roll(k).d(n);
    // add one to the result position in the map to form a histogram
    acc[r] = acc[r] == undefined ? 0 : acc[r] + 1;
    return acc;
  }, new Map<number, number>());

  for (let i = k; i <= n * k; i++) {
    console.log(`${i}: ${resultMap[i] / 100}`);
  }
}
