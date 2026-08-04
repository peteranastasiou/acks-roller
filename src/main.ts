import { bodyForms, toBodyForm } from "./cacodemon/bodyForm";
import { DemonStats } from "./cacodemon/demon";
import { Rank, rankStrings } from "./cacodemon/rank";
import {
  renderDemonStats,
  waxColorFor,
  getQuickStats,
} from "./cacodemon/renderDemon";
import { rollDemon } from "./cacodemon/rollDemon";
import {
  getRollCount,
  incrementPageViews,
  incrementRollCount,
} from "./firebase/firebase";
import { randName } from "./random/randName";
import "./style.css";
import Alpine from "alpinejs";
import { v4 as uuidv4 } from "uuid";

const LOCAL_STORAGE_KEY = "cacodemons";

window.Alpine = Alpine;

interface AppData {
  demon?: DemonStats;
  demons: DemonStats[];
  defaultRank: Rank;
  rankOptions: string[];
  bodyOptions: string[];
  rollCount: number | undefined;
  expandedIds: Set<string>;
  newDemonId: string | undefined;
  storageMessage: string;

  // Allow any additional properties
  [key: string]: any;
}

Alpine.data(
  "cacodemon",
  (): AppData => ({
    demon: undefined,
    demons: [],
    rows: [],
    defaultRank: Rank.Spawn,
    rankOptions: rankStrings,
    bodyOptions: ["Random", ...bodyForms],
    rollCount: undefined,
    initialised: false,
    expandedIds: new Set([]),
    newDemonId: undefined,
    storageMessage: "",

    init() {
      console.info("INIT");

      this.initialise();

      window.addEventListener("popstate", () => {
        this.initialise();
      });
    },

    initialise() {
      this.newDemonId = undefined;
      this.expandedIds = new Set([]);

      // Extract demon from URL params if it exists
      const s = new URLSearchParams(window.location.search);
      const demon = s.get("demon");
      if (demon) {
        // Restore from URL params
        this.demon = JSON.parse(decodeURIComponent(demon)) as DemonStats;
      } else {
        this.demon = undefined;
      }

      // Fetch demons from local storage
      console.info("Trying to load demons");
      try {
        const demonsStr = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (demonsStr) {
          this.demons = JSON.parse(demonsStr);
          console.info(
            `Loaded ${this.demons.length} demon(s) from local storage`,
          );
        } else {
          console.warn("No demons in local storage");
        }
      } catch (e: any) {
        console.error(e.message);
      }

      // Stats
      incrementPageViews();
      this.fetchRollCounts();

      this.storageMessage = this.hasLocalStorage()
        ? "Autosaving to this browser, on this device."
        : "Storage unavailable — changes last only for this session.";

      this.initialised = true;
    },

    toggleExpanded(demonId: string) {
      if (this.expandedIds.has(demonId)) {
        this.expandedIds.delete(demonId);
      } else {
        this.expandedIds.add(demonId);
      }
    },

    generate(rankStr: string, body: string) {
      // Naiive cast to Rank
      const rank = Number(rankStr) as Rank;

      // Clear last added demon so we don't animate it again
      this.newDemonId = undefined;

      // Roll a new demon and store it in the URL
      this.demon = rollDemon(rank, toBodyForm(body));
      this.saveDemon();

      // Mark it as being new
      this.newDemonId = this.demon.id;

      // Set default select fields values from demon properties
      this.defaultRank = this.demon.rank;
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
      if (res && this.demon) {
        this.demon.name = res;
        this.saveDemon();
      }
    },

    addToRegister() {
      if (this.demon) {
        // Ensure it has an id:
        this.demon.id = this.demon.id || uuidv4();

        // Mark it as having just been added
        this.newDemonId = this.demon.id;

        // Append to array
        this.demons = [...this.demons, this.demon];
      }

      this.saveToLocalStorage();

      // Record stats (if not running locally)
      if (!window.location.host.startsWith("localhost")) {
        incrementRollCount().then(this.fetchRollCounts());
      }

      // Now we have saved it, we can discard the active demon
      this.discard();
    },

    removeFromRegister(demon: DemonStats) {
      const name = demon.name;
      const shortName = name.includes(",")
        ? name.slice(0, name.indexOf(","))
        : name;

      // Clear last added demon so we don't animate it again
      this.newDemonId = undefined;

      const shouldDelete = window.confirm(
        `Are you sure you want to banish ${shortName} to the void, permanently removing it from your registry?`,
      );
      if (shouldDelete) {
        // Remove from list of demons
        this.demons = this.demons.filter((d) => d.id != demon.id);
        this.saveToLocalStorage();
      }
    },

    saveToLocalStorage() {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.demons));
      } catch (e: any) {
        console.error("Failed to save");
      }
    },

    getSeal() {
      return (
        (this.demon?.bodyForm || "?").trim().charAt(0).toUpperCase() || "?"
      );
    },

    getSealColour() {
      return waxColorFor(this.demon?.bodyForm || "");
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

    getLinkFor(demon: DemonStats) {
      const demonWithNewId = { ...demon, id: uuidv4() };
      const s = this.getUrlEncodedDemon(demonWithNewId);
      const url = window.location + `?demon=${s}`;
      navigator.clipboard.writeText(url)
        .then(() => {
          alert("Copied cacodemon link to clipboard");
        })
        .catch(() => {
          alert("Failed to copy a link to the cacodemon");
        });
    },

    hasLocalStorage() {
      try {
        const testKey = "__cacodemonomicon_test__";
        window.localStorage.setItem(testKey, "1");
        window.localStorage.removeItem(testKey);
        return true;
      } catch (e) {
        return false;
      }
    },

    saveDemon() {
      // Store demon into URL
      const s = this.getUrlEncodedDemon(this.demon);
      window.history.pushState(null, "", `?demon=${s}`);
    },

    discard() {
      this.demon = undefined;
      window.history.pushState(null, "", window.location.pathname);
    },

    getUrlEncodedDemon(demon: DemonStats) {
      return encodeURIComponent(JSON.stringify(demon));
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
