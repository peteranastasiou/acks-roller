import { DemonStats } from "./cacodemon/demon";
import { Rank, rankStrings } from "./cacodemon/rank";
import { formatDemonIntoRows, rollDemon } from "./cacodemon/rollDemon";
import "./style.css";
import Alpine from "alpinejs";

window.Alpine = Alpine;

interface AppData {
  rows: [string, string][],
  rankStrings: string[],
  generate(rank: number): void,
}

Alpine.data("cacodemon", (): AppData =>({
  rows: [],
  rankStrings,

  generate(rank: number){
    const demon = rollDemon(rank as Rank);
    console.log(demon);
    this.rows = formatDemonIntoRows(demon);
  },

}));

Alpine.start();
