import { Rank, rankStrings } from "./cacodemon/rank";
import { rollDemon } from "./cacodemon/rollDemon";
import "./style.css";
import Alpine from "alpinejs";

window.Alpine = Alpine;

interface AppData {
  rows: [string, any][],
  rankStrings: string[],
  init(): void,
  generate(rank: number): void,
}

Alpine.data("cacodemon", (): AppData =>({
  rows: [],
  rankStrings,

  init(){
  },

  generate(rank: number){
    this.rows = rollDemon(rank as Rank);
  },

}));

Alpine.start();
