import { bodyFormDescription } from "./bodyForm";
import { DemonStats, sizeStrings } from "./demon";
import { rankStrings } from "./rank";

const WAX_COLORS = [
  "#7a2419",
  "#b08d3e",
  "#4c5d4a",
  "#3d4f66",
  "#5c3a21",
  "#6b2d52",
];

function escapeHtml(str: string | number) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeMultiline(str: string) {
  return escapeHtml(str).replace(/\n/g, "<br>");
}

export function waxColorFor(str: string) {
  str = String(str || "");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return WAX_COLORS[hash % WAX_COLORS.length];
}

function formatBudget(v: number | string) {
  if (typeof v !== "number" || isNaN(v)) return escapeHtml(String(v ?? "—"));
  if (Number.isInteger(v)) return String(v);
  const denominators = [2, 3, 4, 6, 8, 12, 16, 32];
  for (const d of denominators) {
    const n = v * d;
    if (Math.abs(n - Math.round(n)) < 1e-6) {
      return Math.round(n) + "/" + d;
    }
  }
  return String(Math.round(v * 10000) / 10000);
}

function signed(n: number) {
  if (typeof n !== "number" || isNaN(n)) return escapeHtml(String(n ?? "—"));
  return (n > 0 ? "+" : "") + n;
}

function yesNo(b: boolean) {
  return b ? "Yes" : "No";
}

function moveCell(a: string | number | null, b: string | number | null) {
  a = a || 0;
  b = b || 0;
  if (!a && !b) return '<span class="dash">–</span>';
  return a + '’ <span class="quickstats-sep">/</span> ' + b + "’";
}

function attacksHTML(demon: DemonStats) {
  const attacks = Array.isArray(demon.attacks) ? demon.attacks : [];
  if (!attacks.length)
    return '<p class="none-recorded">No attacks recorded.</p>';
  let rows = attacks
    .map(
      (a) =>
        "<tr>" +
        "<td>" +
        escapeHtml(a.name) +
        "</td>" +
        '<td class="num">×' +
        escapeHtml(a.qty) +
        "</td>" +
        "<td>" +
        escapeHtml(a.damageType) +
        "</td>" +
        '<td class="num">' +
        escapeHtml(a.roll) +
        "</td>" +
        "</tr>",
    )
    .join("");
  return (
    '<table class="dossier-table"><thead><tr>' +
    '<th>Attack</th><th class="num">Qty</th><th>Damage Type</th><th class="num">Roll</th>' +
    "</tr></thead><tbody>" +
    rows +
    "</tbody></table>"
  );
}

function abilitiesHTML(demon: DemonStats) {
  const abilities = Array.isArray(demon.specialAbilities)
    ? demon.specialAbilities
    : [];
  if (!abilities.length)
    return '<p class="none-recorded">No special abilities recorded.</p>';
  return abilities
    .map(
      (sa: any) =>
        '<div class="ability-entry">' +
        '<span class="ability-name">' +
        escapeHtml(sa.name) +
        "</span>" +
        '<span class="ability-cost">(' +
        formatBudget(sa.value) +
        ")</span>" +
        '<p class="ability-desc">' +
        escapeMultiline(sa.description) +
        "</p>" +
        "</div>",
    )
    .join("");
}

function spellsHTML(demon: DemonStats) {
  const spells = demon.knownSpells || [];
  if (!spells.length) return "";

  let rows = spells
    .map(
      (s) =>
        "<tr>" +
        '<td class="num">L' +
        escapeHtml(s.level) +
        "</td>" +
        "<td>" +
        escapeHtml(s.name) +
        "</tr>",
    )
    .join("");

  return (
    '<div class="section-label">Known Spells</div>' +
    '<table class="dossier-table"><thead><tr>' +
    '<th class="num">Level</th><th>Spell</th>' +
    "</tr></thead><tbody>" +
    rows +
    "</tbody></table>" +
    "</div></div>"
  );
}

function spellLikeHTML(demon: DemonStats) {
  const slas = Array.isArray(demon.spellLikeAbilities)
    ? demon.spellLikeAbilities
    : [];
  if (!slas.length) return "";
  let rows = slas
    .map(
      (s) =>
        "<tr>" +
        '<td class="num">Lv ' +
        escapeHtml(s.level) +
        "</td>" +
        "<td>" +
        escapeHtml(s.name) +
        "</td>" +
        "<td>" +
        escapeHtml(s.usage) +
        "</td>" +
        '<td class="num">' +
        formatBudget(s.numAbilities) +
        "</td>" +
        "</tr>",
    )
    .join("");
  return (
    '<div class="section-label">Spell-like Abilities</div>' +
    '<table class="dossier-table"><thead><tr>' +
    '<th class="num">Level</th><th>Ability</th><th>Usage</th><th class="num">Cost</th>' +
    "</tr></thead><tbody>" +
    rows +
    "</tbody></table>" +
    "</div></div>"
  );
}

function getSpellCasterLevel(demon: DemonStats) {
  if (!demon.isSpellCaster) {
    return "No";
  } else {
    return "Level " + demon.casterLevel;
  }
}

function vitalsHTML(demon: DemonStats) {
  const rows = [
    ["Rank", rankStrings[demon.rank]],
    ["Body Form", escapeHtml(demon.bodyForm ?? "—")],
    ["Size", sizeStrings[demon.size]],
    ["Height", (demon.height ?? "—") + " ft"],
    ["Mass", (demon.mass ?? "—") + " lb"],
    ["BME", demon.bme ?? "—"],
    ["CCF", demon.ccf ?? "—"],
    ["Carrying Cap.", (demon.carryingCap ?? "—") + " lb"],
    ["Morale", signed(demon.morale)],
    ["Save", demon.save],
    ["Flying", yesNo(demon.flying)],
    ["Has Speech", yesNo(demon.hasSpeech)],
    ["Spell Caster", getSpellCasterLevel(demon)],
  ];
  return (
    '<div class="vitals-grid">' +
    rows
      .map(
        ([label, value]) =>
          '<div class="vital"><span class="vital-label">' +
          escapeHtml(label) +
          "</span>" +
          '<span class="vital-value">' +
          value +
          "</span></div>",
      )
      .join("") +
    "</div>"
  );
}

function movementHTML(demon: DemonStats) {
  const rows = [
    ["Land", demon.landCombatSpeed, demon.landRunningSpeed],
    ["Flying", demon.flyingCombatSpeed, demon.flyingRunningSpeed],
    ["Climbing", demon.climbingCombatSpeed, demon.climbingRunningSpeed],
    ["Swimming", demon.swimmingCombatSpeed, demon.swimmingRunningSpeed],
  ];
  let out = rows
    .map(
      ([label, a, b]) =>
        "<tr><td>" +
        label +
        '</td><td class="num">' +
        moveCell(a, b) +
        "</td></tr>",
    )
    .join("");
  return (
    '<table class="dossier-table"><thead><tr><th>Mode</th><th class="num">Combat / Running</th></tr></thead><tbody>' +
    out +
    "</tbody></table>"
  );
}

export function getQuickStats(demon: DemonStats) {
  let badges = "";
  if (demon.flying) badges += '<span class="trait-pill">Flying</span>';

  return (
    rankStrings[demon.rank] +
    ' <span class="quickstats-sep">·</span> ' +
    "AC " +
    (demon.ac ?? "—") +
    ' <span class="quickstats-sep">·</span> HD ' +
    (demon.hd + "d8") +
    ' <div style="width: 10px"></div>' +
    badges
  );
}

export function renderDemonStats(demon: DemonStats) {
  return (
    '<div class="ability-desc" style="margin:0">' +
    bodyFormDescription(demon.bodyForm, demon.winged) +
    "</div>" +
    '<div class="section-label">Vitals</div>' +
    vitalsHTML(demon) +
    '<div class="section-label">Movement</div>' +
    movementHTML(demon) +
    '<div class="section-label">Attacks</div>' +
    attacksHTML(demon) +
    '<div class="section-label">Special Abilities ('+ 
    demon.numSpecialAbilities +
    ')</div>' +
    abilitiesHTML(demon) +
    spellsHTML(demon) +
    spellLikeHTML(demon)
  );
}
