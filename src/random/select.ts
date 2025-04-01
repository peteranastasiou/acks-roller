type SelectOpts<T> = {
  exclude?: Array<T>;
};

type SelectManyOpts<T> = SelectOpts<T> & {
  unique?: boolean;
};

/**
 * Randomly select an element of an array
 */
export function select<T>(arr: Array<T>, opts?: SelectOpts<T>): T {
  // Reroll up to this many times
  for (let i = 0; i < 10000; i++) {
    const res = selectOne(arr);
    if (opts?.exclude?.includes(res)) {
      // Roll again
      continue;
    }
    return res;
  }
  throw new Error(
    `Couldn't select after many tries: ${JSON.stringify(arr)}, opts: ${JSON.stringify(opts)}`,
  );
}

export function selectMany<T>(
  n: number,
  arr: Array<T>,
  opts?: SelectManyOpts<T>,
): Array<T> {
  return [...Array(n)].reduce((acc) => {
    let excludes: T[] = [];
    if (opts?.unique) {
      // Exclude anything we have seen before
      excludes = acc;
    }
    if (opts?.exclude) {
      excludes = [...excludes, ...opts.exclude];
    }

    acc.push(select(arr, { exclude: excludes }));
    return acc;
  }, []);
}

function selectOne<T>(arr: Array<T>): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
