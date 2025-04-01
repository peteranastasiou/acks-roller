import { roll } from "./roll";
import { select } from "./select";

const consonants = [
  "w",
  "r",
  "t",
  "y",
  "p",
  "s",
  "d",
  "f",
  "g",
  "h",
  "j",
  "k",
  "l",
  "z",
  "x",
  "c",
  "v",
  "b",
  "n",
  "m",
];

const vowels = ["e", "ee", "u", "i", "o", "oo", "a", "ae"];

export const randName = () => {
  const numLetters = roll(3).d(3);

  // Start off the name
  let name = select(consonants).toUpperCase();
  let isVowel = true;

  for (let i = 0; i < numLetters; i++) {
    name = name + select(isVowel ? vowels : consonants);
    isVowel = !isVowel;
  }
  return name;
};
