import { bodyForms, toBodyForm } from "./cacodemon/bodyForm";
import { DemonStats } from './cacodemon/demon';
import { Rank, rankStrings } from "./cacodemon/rank";
import { renderDemonStats, waxColorFor, getQuickStats } from './cacodemon/renderDemon';
import { formatDemonIntoRows, rollDemon } from "./cacodemon/rollDemon";
import { getRollCount, incrementPageViews, incrementRollCount } from "./firebase/firebase";
import { randName } from "./random/randName";
import "./style.css";
import Alpine from "alpinejs";

window.Alpine = Alpine;

interface AppData {
  demon?: DemonStats;
  demons: Map<string, DemonStats>;
  defaultRank: Rank;
  rows: string[][];
  rankOptions: string[];
  bodyOptions: string[];
  rollCount: number | undefined;

  // Allow any additional properties
  [key: string]: any;
}

Alpine.data(
  "cacodemon",
  (): AppData => ({
    demon: undefined,
    demons: new Map<string, DemonStats>(),
    rows: [],
    defaultRank: Rank.Spawn,
    rankOptions: rankStrings,
    bodyOptions: ["Random", ...bodyForms],
    rollCount: undefined,
    initialised: false,

    init() {
      // Extract demon from URL params if it exists
      const s = new URLSearchParams(window.location.search);
      const demon = s.get("demon");
      if (demon) {
        // Restore from URL params
        this.demon = JSON.parse(decodeURIComponent(demon)) as DemonStats;
        this.rows = formatDemonIntoRows(this.demon);

        // Set default select fields values from demon properties
        this.defaultRank = this.demon.rank;
      }

      // Stats
      incrementPageViews();
      this.fetchRollCounts();

      this.initialised = true;
    },

    generate(rankStr: string, body: string) {
      // Naiive cast to Rank
      const rank = Number(rankStr) as Rank;

      // Roll a new demon and store it in the URL
      this.demon = rollDemon(rank, toBodyForm(body));
      this.saveDemon();

      // Format the table
      this.rows = formatDemonIntoRows(this.demon);

      // Record stats (if not running locally)
      if (!window.location.host.startsWith("localhost")) {
        incrementRollCount().then(this.fetchRollCounts());
      }
    },

    regenerateName() {
      // Re-roll just the name
      if (this.demon) {
        this.demon.name = randName();
        this.saveDemon();
      }
    },
    
    editName() {
      const res = prompt("Pen a new name:", this.demon?.name);
      if(res && this.demon) {
        this.demon.name = res;
        this.saveDemon();
      }
    },

    addToRegister() {
      if (this.demon) {
        this.demons.set(this.demon.name, this.demon);
      }

      // TODO store to local storage

      window.location.href = '/';
    },

    getSeal() {
      return (this.demon?.bodyForm || "?").trim().charAt(0).toUpperCase() || "?";
    },

    getSealColour() {
      return waxColorFor(this.demon?.bodyForm || '');
    },

    getDemonStatsHtml() {
      if (this.demon) {
        return renderDemonStats(this.demon);
      } else {
        return "";
      }
    },

    getQuickStats() {
      if (this.demon) {
        return getQuickStats(this.demon);
      }
      return "";
    },

    saveDemon() {
      // Store demon into URL
      const s = encodeURIComponent(JSON.stringify(this.demon));
      window.history.pushState({}, "", `?demon=${s}`);
    },

    discard() {
      console.log("Discard")
      window.location.href = '/';
    },

    fetchRollCounts() {
      // Fetch roll count from firebase
      getRollCount().then((rollCount) => {
        if (rollCount) {
          this.rollCount = rollCount;
        }
      });
    },
  }),
);

Alpine.start();
