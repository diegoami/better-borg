/**
 * The run-record writer's contract, asserted - not eyeballed (B02, issue #3).
 *
 * runs.json is the raw per-run record every later claim traces back to
 * (docs/runs/README.md), so its shape is a schema, and this file is the gate:
 * exact key sets at every level (a missing or renamed field is a broken
 * reader, not a style question), raw facts passed through VERBATIM from the
 * session reports, and - the hazard the task file names - no derived number
 * anywhere in it. Averages, medians and totals are computed by the reader and
 * live in summary.md, a separate file, never inside the primary record.
 *
 * The fixture here is synthetic and small: two runs over two seeds, one dead,
 * one alive, so every branch of the writer (cause-of-death null and not-null,
 * multiple seeds) is covered without booting the engine. The b02-verify
 * session the sweep writes is this same writer on real runs.
 */

import { mkdtempSync, mkdirSync, readFileSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it, afterAll } from "vitest";
import {
  RUNS_SCHEMA_ID,
  buildRunsJson,
  buildSummary,
  writeSessionRecord,
  type SessionRecord,
} from "./run-record.js";
import type { RunReport } from "./play-session.js";

const RUN_KEYS = [
  "seed",
  "life",
  "race",
  "class",
  "baseStats",
  "decisions",
  "turns",
  "depths",
  "maxDepth",
  "clvl",
  "gold",
  "kills",
  "places",
  "dead",
  "causeOfDeath",
  "commands",
  "jitter",
  "restedBesideMonster",
  "stageAttained",
  "retired",
  "meta",
] as const;

function fixtureRun(overrides: Partial<RunReport>): RunReport {
  return {
    seed: 1,
    life: 1,
    race: "Human",
    class: "Warrior",
    baseStats: [17, 17, 17, 16, 16, 13],
    decisions: 1500,
    turns: 8691,
    depths: [0, 1],
    maxDepth: 1,
    clvl: 1,
    gold: 40,
    kills: 3,
    places: 421,
    dead: false,
    causeOfDeath: null,
    commands: { walk: 659, close: 771, descend: 21 },
    jitter: 12,
    restedBesideMonster: 0,
    stageAttained: false,
    retired: false,
    wallClockMs: 21094,
    ...overrides,
  };
}

function fixtureSession(): SessionRecord {
  return {
    label: "schema-test",
    runner: { tool: "tools/sweep.mjs", decisions: 1500, seeds: [1, 7], lives: 1, stage: null },
    build: {
      commit: "deadbeef0 (dirty)",
      engine: "@rpgm-tools/neo-angband-core 1.23.0-beta.1",
      content: "neo-angband@fc68bccc1",
      borg: "stock",
    },
    recorded: "2026-11-02T20:00:00.000Z",
    runs: [
      fixtureRun({}),
      fixtureRun({
        seed: 7,
        life: 1,
        decisions: 1228,
        turns: 15773,
        depths: [0, 1],
        maxDepth: 1,
        clvl: 2,
        gold: 91,
        kills: 11,
        places: 611,
        dead: true,
        causeOfDeath: "Killed by a cave spider",
        commands: { walk: 1081, descend: 32 },
        wallClockMs: 18002,
      }),
    ],
  };
}

const scratch: string[] = [];
afterAll(() => {
  for (const dir of scratch) rmSync(dir, { recursive: true, force: true });
});

describe("buildRunsJson", () => {
  it("gives the document the exact top-level shape", () => {
    const doc = buildRunsJson(fixtureSession());
    expect(Object.keys(doc)).toEqual([
      "schema",
      "recorded",
      "label",
      "runner",
      "build",
      "runs",
    ]);
    expect(doc["schema"]).toBe(RUNS_SCHEMA_ID);
    expect(doc["recorded"]).toBe("2026-11-02T20:00:00.000Z");
    expect(doc["label"]).toBe("schema-test");
  });

  it("carries the runner and build facts verbatim", () => {
    const doc = buildRunsJson(fixtureSession()) as unknown as Record<string, unknown>;
    expect(Object.keys(doc["runner"] as object)).toEqual([
      "tool",
      "decisions",
      "seeds",
      "lives",
      "stage",
    ]);
    expect(Object.keys(doc["build"] as object)).toEqual([
      "commit",
      "engine",
      "content",
      "borg",
    ]);
    expect(doc["runner"]).toEqual({
      tool: "tools/sweep.mjs",
      decisions: 1500,
      seeds: [1, 7],
      lives: 1,
      stage: null,
    });
  });

  it("gives every run the exact per-run shape", () => {
    const doc = buildRunsJson(fixtureSession());
    const runs = (doc as { runs: unknown[] })["runs"];
    expect(runs).toHaveLength(2);
    for (const run of runs) {
      expect(Object.keys(run as object)).toEqual([...RUN_KEYS]);
      const meta = (run as { meta: unknown })["meta"];
      expect(Object.keys(meta as object)).toEqual(["wallClockMs"]);
    }
  });

  it("passes the raw per-run facts through verbatim", () => {
    const session = fixtureSession();
    const doc = buildRunsJson(session) as unknown as { runs: Array<Record<string, unknown>> };
    for (const [i, run] of doc["runs"].entries()) {
      const given = session.runs[i]!;
      expect(run["seed"]).toBe(given.seed);
      expect(run["life"]).toBe(given.life);
      expect(run["race"]).toBe(given.race);
      expect(run["class"]).toBe(given.class);
      expect(run["baseStats"]).toEqual(given.baseStats);
      expect(run["decisions"]).toBe(given.decisions);
      expect(run["turns"]).toBe(given.turns);
      expect(run["depths"]).toEqual(given.depths);
      expect(run["maxDepth"]).toBe(given.maxDepth);
      expect(run["clvl"]).toBe(given.clvl);
      expect(run["gold"]).toBe(given.gold);
      expect(run["kills"]).toBe(given.kills);
      expect(run["places"]).toBe(given.places);
      expect(run["dead"]).toBe(given.dead);
      expect(run["causeOfDeath"]).toBe(given.causeOfDeath);
      expect(run["commands"]).toEqual(given.commands);
      expect(run["jitter"]).toBe(given.jitter);
      expect(run["restedBesideMonster"]).toBe(given.restedBesideMonster);
      expect(run["stageAttained"]).toBe(given.stageAttained);
      expect(run["retired"]).toBe(given.retired);
      expect((run["meta"] as { wallClockMs: number })["wallClockMs"]).toBe(
        given.wallClockMs,
      );
    }
  });

  it("keeps derived numbers OUT of the raw record", () => {
    const text = JSON.stringify(buildRunsJson(fixtureSession()));
    /* A summary quantity that leaked into runs.json would silently become the
     * number readers quote - exactly the hazard B02 names. */
    expect(text).not.toMatch(/"median/i);
    expect(text).not.toMatch(/"mean/i);
    expect(text).not.toMatch(/"average/i);
    expect(text).not.toMatch(/"summary/i);
  });

  it("is pure: the same session serializes to the same bytes", () => {
    const session = fixtureSession();
    expect(JSON.stringify(buildRunsJson(session))).toBe(
      JSON.stringify(buildRunsJson(session)),
    );
  });
});

describe("buildSummary", () => {
  it("has one row per run, labelled by seed and life", () => {
    const summary = buildSummary(fixtureSession());
    for (const run of fixtureSession().runs) {
      expect(summary).toContain(`${String(run.seed)}.${String(run.life)}`);
    }
  });

  it("computes the cohort statistics the reader owns", () => {
    const summary = buildSummary(fixtureSession());
    /* maxDepth 1 and 1 -> median 1, mean 1. */
    expect(summary).toContain("median maxDepth");
    expect(summary).toContain("1");
    expect(summary).toContain("1 of 2 runs died");
  });

  it("carries the death's name into the table", () => {
    expect(buildSummary(fixtureSession())).toContain("Killed by a cave spider");
  });

  it("says where the raw record lives", () => {
    expect(buildSummary(fixtureSession())).toContain("runs.json");
  });

  it("states the reach-rate as the cohort's headline when a stage was in play (#25)", () => {
    /* The purpose redirect's number: the fraction of the cohort that
     * attained the session's stage, named WITH the rung so two records at
     * two stages never get compared by accident. The fixture's runs sit at
     * clvl 1 and 2 over maxDepth 1, so a c2d1 rung is attained by exactly
     * one of the two. */
    const session = fixtureSession();
    session.runner = { ...session.runner, stage: { clvl: 2, depth: 1 } };
    session.runs = session.runs.map((run, at) => ({
      ...run,
      stageAttained: at === 1,
      retired: at === 1,
    }));
    const summary = buildSummary(session);
    expect(summary).toContain("reach-rate (stage c2d1): 1/2 runs attained (50.0%)");
    expect(summary).toContain("library: 1 kept save");
    /* And a stage-less session keeps the old shape exactly: no rate, no
     * library line - a pre-#25 reader sees a pre-#25 summary. */
    const bare = buildSummary(fixtureSession());
    expect(bare).not.toContain("reach-rate");
    expect(bare).not.toContain("library");
  });
});

describe("writeSessionRecord", () => {
  it("writes runs.json and summary.md, and runs.json round-trips the schema", () => {
    const dir = join(mkdtempSync(join(tmpdir(), "b02-record-")), "session");
    scratch.push(dirname(dir));
    const session = fixtureSession();
    const paths = writeSessionRecord(dir, session);

    expect(existsSync(paths.runsPath)).toBe(true);
    expect(existsSync(paths.summaryPath)).toBe(true);

    const read = JSON.parse(readFileSync(paths.runsPath, "utf8")) as Record<string, unknown>;
    expect(Object.keys(read)).toEqual(["schema", "recorded", "label", "runner", "build", "runs"]);
    expect(read["schema"]).toBe(RUNS_SCHEMA_ID);
    const runs = read["runs"] as Array<Record<string, unknown>>;
    expect(runs.map((r) => Object.keys(r))).toEqual([
      [...RUN_KEYS],
      [...RUN_KEYS],
    ]);

    const summary = readFileSync(paths.summaryPath, "utf8");
    expect(summary).toContain("median maxDepth");
  });

  it("refuses to write into a directory that already exists", () => {
    /* Run records are append-only (docs/runs/README.md): a completed session
     * is never edited, so the writer must not offer to overwrite one. */
    const dir = join(mkdtempSync(join(tmpdir(), "b02-record-")), "session");
    scratch.push(dirname(dir));
    mkdirSync(dir);
    expect(() => writeSessionRecord(dir, fixtureSession())).toThrow(/exists/i);
  });
});
