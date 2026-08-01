import { bodyForms, toBodyForm } from "./cacodemon/bodyForm";
import { DemonStats } from './cacodemon/demon';
import { Rank, rankStrings } from "./cacodemon/rank";
import { renderDemonStats, waxColorFor, getQuickStats } from './cacodemon/renderDemon';
import { formatDemonIntoRows, rollDemon } from "./cacodemon/rollDemon";
import { getRollCount, incrementPageViews, incrementRollCount } from "./firebase/firebase";
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
  rows: string[][];
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
      // Extract demon from URL params if it exists
      const s = new URLSearchParams(window.location.search);
      const demon = s.get("demon");
      if (demon) {
        // Restore from URL params
        this.demon = JSON.parse(decodeURIComponent(demon)) as DemonStats;
        this.rows = formatDemonIntoRows(this.demon);

        // Set default select fields values from demon properties
        this.defaultRank = this.demon.rank;
      } else {
        this.demon = undefined;
      }

      // Fetch demons from local storage
      console.info("Trying to load demons");
      try {
        const demonsStr = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (demonsStr) {
          this.demons = JSON.parse(demonsStr);
          console.info(`Loaded ${this.demons.length} demon(s) from local storage`);

          // Ensure all demons have an ID:
          this.demons = this.demons.map((d) => ({
            ...d,
            id: d.id || uuidv4(),
          }));
        } else {
          console.warn("No demons in local storage");
        }
      } catch(e: any) {
        console.error(e.message);
      }

      // Stats
      incrementPageViews();
      this.fetchRollCounts();

      this.storageMessage = this.hasLocalStorage() ? 
        'Autosaving to this browser, on this device.' 
        : 'Storage unavailable — changes last only for this session.';

      window.addEventListener('popstate', () => {
        this.init();
      });

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

      // Spin for a bit just for the feel of it
      // TODO

      // Roll a new demon and store it in the URL
      this.demon = rollDemon(rank, toBodyForm(body));
      this.saveDemon();

      // Format the table
      this.rows = formatDemonIntoRows(this.demon);
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
      const shortName = name.includes(",") ? name.slice(0, name.indexOf(",")) : name;

      const shouldDelete = window.confirm(
        `Are you sure you want to banish ${shortName} to the void, permanently removing it from your registry?`
      );
      if (shouldDelete) {
        // Remove from list of demons
        this.demons = this.demons.filter((d) => d.id != demon.id);
        this.saveToLocalStorage();
      }
    },

    saveToLocalStorage() {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.demons));
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

    hasLocalStorage() {
      try {
        const testKey = '__cacodemonomicon_test__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
        return true;
      } catch (e) {
        return false;
      }
    },

    saveDemon() {
      // Store demon into URL
      const s = encodeURIComponent(JSON.stringify(this.demon));
      window.history.pushState(null, "", `?demon=${s}`);
    },

    discard() {
      this.demon = undefined;
      window.history.pushState(null, "", window.location.pathname);
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
