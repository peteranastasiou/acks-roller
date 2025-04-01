import { Rank } from "./cacodemon/rank";
import { rollDemon } from "./cacodemon/rollDemon";
import "./style.css";
import Alpine from "alpinejs";

window.Alpine = Alpine;

// TODO select rank from spawn to archfiend

interface AppData {
  rows: [string, any][],
  init(): void,
  generate(): void,
}

Alpine.data("cacodemon", (): AppData =>({
  rows: [],

  init(){
  },

  generate(){
    this.rows = rollDemon(Rank.Spawn);
  },

}));

Alpine.start();
