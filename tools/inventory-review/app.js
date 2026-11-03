/*
 * The inventory decision reviewer (#28): a static page over one
 * decisions.json (tools/inventory-export.mjs). No server, no network, no
 * engine - it reads the file the reviewer chose and writes feedback.json
 * back as a download. Offline by construction (rule 5 clean).
 *
 * A moment's identity is (seed, life, turn, handle of the item that left):
 * unique within a run, stable across re-exports of the same record, and
 * what a later reader joins feedback to decisions on.
 */
"use strict";

const DECISIONS_SCHEMA = "mandos/inventory-decisions@1";
const FEEDBACK_SCHEMA = "mandos/inventory-feedback@1";

/** The loaded export, and the marks by moment key. */
let doc = null;
let current = 0;
const marks = new Map();

const $ = (id) => document.getElementById(id);

function el(tag, attrs, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs ?? {})) {
    if (key === "class") node.className = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value);
  }
  for (const child of children) {
    if (child === null || child === undefined) continue;
    node.append(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

function momentKey(run, moment) {
  return `${run.seed}:${run.life}:${moment.turn}:${moment.left.handle}`;
}

/* The draft survives a reload (a per-viewer convenience; feedback.json is
 * the record). Storage may be unavailable - the page works without it. */
function draftKey() {
  return doc === null ? null : `mandos-inventory-review:${doc.record.directory}:${doc.record.recorded}`;
}
function saveDraft() {
  const key = draftKey();
  if (key === null) return;
  try {
    localStorage.setItem(key, JSON.stringify([...marks.entries()]));
  } catch {
    /* storage refused: the export is the only copy */
  }
}
function loadDraft() {
  const key = draftKey();
  if (key === null) return;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return;
    for (const [k, v] of JSON.parse(raw)) marks.set(k, v);
  } catch {
    /* no draft */
  }
}

function showError(message) {
  const box = $("load-error");
  box.textContent = message;
  box.hidden = false;
}

function validate(value) {
  if (value === null || typeof value !== "object") return "not a JSON object";
  if (value.schema !== DECISIONS_SCHEMA) return `schema is ${String(value.schema)}, expected ${DECISIONS_SCHEMA}`;
  if (!Array.isArray(value.runs)) return "no runs array";
  return null;
}

/** A feedback.json loaded on top of the decisions resumes an earlier review. */
function absorbFeedback(value) {
  if (value?.schema !== FEEDBACK_SCHEMA || !Array.isArray(value.marks)) return false;
  for (const m of value.marks) {
    if (m.mark !== "good" && m.mark !== "bad") continue;
    marks.set(`${m.seed}:${m.life}:${m.turn}:${m.handle}`, { mark: m.mark, note: m.note ?? "" });
  }
  return true;
}

function accept(text, name) {
  $("load-error").hidden = true;
  let value;
  try {
    value = JSON.parse(text);
  } catch (error) {
    showError(`${name}: not JSON (${error.message})`);
    return;
  }
  if (doc !== null && absorbFeedback(value)) {
    saveDraft();
    renderRun();
    return;
  }
  const problem = validate(value);
  if (problem !== null) {
    showError(`${name}: ${problem}`);
    return;
  }
  doc = value;
  marks.clear();
  loadDraft();
  const first = doc.runs.findIndex((run) => run.moments.length > 0);
  current = first < 0 ? 0 : first;
  renderRecord();
  renderRun();
}

function readFile(file) {
  file.text().then((text) => accept(text, file.name), (error) => showError(String(error)));
}

function facts(dl, pairs) {
  dl.replaceChildren();
  for (const [term, value] of pairs) {
    dl.append(el("dt", null, term), el("dd", null, String(value)));
  }
}

function renderRecord() {
  $("record").hidden = false;
  $("record-title").textContent = doc.record.label ?? doc.record.directory;
  const d = doc.definition;
  facts($("record-facts"), [
    ["directory", doc.record.directory],
    ["recorded", doc.record.recorded],
    ["commit", doc.record.build?.commit ?? "?"],
    ["discard moment", `pack at ${d.packSize - d.pressureFreeSlots}+ of ${d.packSize} slots, an item leaving by ${d.ways.join(" / ")}`],
  ]);
  const nav = $("runs");
  nav.replaceChildren();
  doc.runs.forEach((run, index) => {
    nav.append(
      el(
        "button",
        {
          type: "button",
          class: index === current ? "run-tab active" : "run-tab",
          onclick: () => {
            current = index;
            renderRecord();
            renderRun();
          },
        },
        `seed ${run.seed}${run.life > 1 ? ` life ${run.life}` : ""} (${run.moments.length})`,
      ),
    );
  });
}

function rowLine(row) {
  const price = row.value === null ? "" : ` - ${row.value} gold`;
  return `${row.desc} [${row.kind}${row.number > 1 ? ` x${row.number}` : ""}]${price}`;
}

function renderMoment(run, moment, index) {
  const key = momentKey(run, moment);
  const state = marks.get(key) ?? { mark: null, note: "" };
  const set = (mark) => {
    const now = marks.get(key) ?? { mark: null, note: "" };
    marks.set(key, { ...now, mark: now.mark === mark ? null : mark });
    saveDraft();
    renderRun();
  };
  const note = el("textarea", { rows: "2", placeholder: "why (optional)" });
  note.value = state.note;
  note.addEventListener("input", () => {
    const now = marks.get(key) ?? { mark: null, note: "" };
    marks.set(key, { ...now, note: note.value });
    saveDraft();
  });
  const gone = moment.gone < moment.left.number ? `${moment.gone} of ` : "";
  return el(
    "article",
    { class: `moment ${state.mark ?? "unmarked"}` },
    el(
      "header",
      null,
      el("span", { class: `way ${moment.way}` }, moment.way),
      el("strong", null, `${gone}${moment.left.desc}`),
      el("span", { class: "meta" }, `#${index + 1} - turn ${moment.turn}, depth ${moment.depth}, pack ${moment.slotsUsed}/${moment.packSize}, command ${moment.command}`),
    ),
    el("p", { class: "left" }, "left: ", rowLine(moment.left)),
    el(
      "details",
      null,
      el("summary", null, `kept (${moment.stayed.length})`),
      el("ul", { class: "stayed" }, ...moment.stayed.map((row) => el("li", null, rowLine(row)))),
    ),
    moment.said.length > 0 ? el("pre", { class: "said" }, moment.said.join("\n")) : null,
    el(
      "div",
      { class: "judge" },
      el("button", { type: "button", class: state.mark === "good" ? "good on" : "good", onclick: () => set("good") }, "good"),
      el("button", { type: "button", class: state.mark === "bad" ? "bad on" : "bad", onclick: () => set("bad") }, "bad"),
      note,
    ),
  );
}

function renderRun() {
  const run = doc.runs[current];
  $("run").hidden = false;
  $("run-title").textContent = `Seed ${run.seed}${run.life > 1 ? `, life ${run.life}` : ""}: ${run.race} ${run.class}`;
  facts($("run-facts"), [
    ["clvl", run.clvl],
    ["max depth", run.maxDepth],
    ["turns", run.turns],
    ["outcome", run.dead ? `died: ${run.causeOfDeath}` : "alive"],
    ["moments", `${run.moments.length} kept of ${run.total}`],
  ]);
  const all = doc.runs.reduce((n, r) => n + r.moments.length, 0);
  const done = [...marks.values()].filter((m) => m.mark !== null).length;
  $("progress-text").textContent = `${done} of ${all} marked`;
  $("progress-fill").style.width = all === 0 ? "0" : `${(100 * done) / all}%`;
  const box = $("moments");
  box.replaceChildren();
  if (run.moments.length === 0) box.append(el("p", { class: "hint" }, "No discard moments in this run."));
  run.moments.forEach((moment, index) => box.append(renderMoment(run, moment, index)));
}

/** feedback.json: marked moments only, in record order - same marks, same bytes. */
function feedbackDoc() {
  const out = [];
  for (const run of doc.runs) {
    for (const moment of run.moments) {
      const m = marks.get(momentKey(run, moment));
      if (m === undefined || m.mark === null) continue;
      out.push({
        seed: run.seed,
        life: run.life,
        turn: moment.turn,
        handle: moment.left.handle,
        way: moment.way,
        item: moment.left.desc,
        mark: m.mark,
        note: m.note.trim(),
      });
    }
  }
  return {
    schema: FEEDBACK_SCHEMA,
    decisions: {
      schema: doc.schema,
      directory: doc.record.directory,
      recorded: doc.record.recorded,
      commit: doc.record.build?.commit ?? null,
    },
    marks: out,
  };
}

function exportFeedback() {
  if (doc === null) return;
  const body = feedbackDoc();
  const blob = new Blob([`${JSON.stringify(body, null, 2)}\n`], { type: "application/json" });
  const link = el("a", { href: URL.createObjectURL(blob), download: "feedback.json" });
  document.body.append(link);
  link.click();
  link.remove();
  $("export-note").textContent = `${body.marks.length} marks exported - commit it beside the record as feedback-<reviewer>-<date>.json`;
}

$("file").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) readFile(file);
});
const drop = $("drop");
drop.addEventListener("dragover", (event) => {
  event.preventDefault();
  drop.classList.add("over");
});
drop.addEventListener("dragleave", () => drop.classList.remove("over"));
drop.addEventListener("drop", (event) => {
  event.preventDefault();
  drop.classList.remove("over");
  const file = event.dataTransfer?.files?.[0];
  if (file) readFile(file);
});
$("export").addEventListener("click", exportFeedback);
