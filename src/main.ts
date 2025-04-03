import { bodyForms, toBodyForm } from "./cacodemon/bodyForm";
import { DemonStats } from "./cacodemon/demon";
import { Rank, rankStrings } from "./cacodemon/rank";
import { formatDemonIntoRows, rollDemon } from "./cacodemon/rollDemon";
import { randName } from "./random/randName";
import "./style.css";
import Alpine from "alpinejs";

window.Alpine = Alpine;

interface AppData {
  demon?: DemonStats;
  rows: [string, string][];
  rankOptions: string[];
  bodyOptions: string[];

  // Allow any additional properties
  [key: string]: any;
}

Alpine.data(
  "cacodemon",
  (): AppData => ({
    demon: undefined,
    rows: [],
    rankOptions: rankStrings,
    bodyOptions: ["Random", ...bodyForms],

    init() {
      // Extract demon from URL params if it exists
      const s = new URLSearchParams(window.location.search);
      const demon = s.get("demon");
      if (demon) {
        // Restore from URL params
        this.demon = JSON.parse(demon) as DemonStats;
        this.rows = formatDemonIntoRows(this.demon);
      }
    },

    generate(rank: number, body: string) {
      // Roll a new demon and store it in the URL
      this.demon = rollDemon(rank as Rank, toBodyForm(body));
      this.saveDemon();

      // Format the table
      this.rows = formatDemonIntoRows(this.demon);
    },

    regenerateName() {
      // Re-roll just the name
      if (this.demon) {
        this.demon.name = randName();
        console.log(this.demon);
        this.saveDemon();
      }
    },

    saveDemon() {
      // Store demon into URL
      const s = JSON.stringify(this.demon);
      window.history.pushState({}, "", `?demon=${s}`);
    },
  }),
);

Alpine.start();
