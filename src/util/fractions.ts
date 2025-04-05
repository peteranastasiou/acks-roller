export const format8Fraction = (n: number): string => {
  const num = Math.round(n * 8);
  switch (num) {
    case 1:
      return "1/8";
    case 2:
      return "1/4";
    case 3:
      return "3/8";
    case 4:
      return "1/2";
    case 5:
      return "5/8";
    case 6:
      return "3/4";
    case 7:
      return "7/8";
    case 8:
      return "1";
    default:
      // Not a fraction of 8
      return `${n}`;
  }
};
