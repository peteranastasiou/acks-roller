import { Rank, rankStrings } from "./cacodemon/rank";
import { formatDemonIntoRows, rollDemon } from "./cacodemon/rollDemon";
import "./style.css";
import Alpine from "alpinejs";

window.Alpine = Alpine;

interface AppData {
  rows: [string, string][];
  rankStrings: string[];
  init(): void;
  generate(rank: number): void;
}

Alpine.data(
  "cacodemon",
  (): AppData => ({
    rows: [],
    rankStrings,

    init() {
      // Extract demon from query params if it exists
      const s = new URLSearchParams(window.location.search);
      const demon = s.get("demon");
      if(demon) {
        this.rows = formatDemonIntoRows(JSON.parse(demon));
      }
    },

    generate(rank: number) {
      const demon = rollDemon(rank as Rank);
      console.log(demon);

      // Store demon into URL
      const s = JSON.stringify(demon);
      console.log("Length: "+s.length);
      window.history.pushState({}, '', `?demon=${s}`);

      this.rows = formatDemonIntoRows(demon);
    },
  }),
);

Alpine.start();
