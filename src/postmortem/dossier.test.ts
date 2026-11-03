/**
 * The dossier's FORMAT (#29): pure, deterministic, sectioned.
 *
 * The capture layer is engine-shaped and covered by the replay-exactness
 * test against the committed record (src/postmortem/replay.test.ts); this
 * file pins the FORMAT layer - the thing an AI post-mortem session parses
 * and a later dossier is diffed against. Same inputs, same bytes, every
 * time; every section the issue's spec names present, empty or not; every
 * order fixed (census by code, messages oldest first, pack rows lettered
 * like the game letters them).
 */

import { describe, expect, it } from "vitest";
import { POSTMORTEM_SCHEMA_ID, renderDossier, type DossierHeader, type PostmortemCapture } from "./dossier.js";

function capture(over: Partial<PostmortemCapture> = {}): PostmortemCapture {
  return {
    turn: 1347,
    depth: 1,
    player: {
      name: "Borg",
      race: "Half-Troll",
      cls: "Warrior",
      level: 1,
      hp: 12,
      maxHp: 27,
      sp: 0,
      maxSp: 0,
      gold: 42,
      x: 33,
      y: 9,
    },
    screen: {
      originX: 17,
      originY: 1,
      width: 5,
      height: 3,
      rows: ["#####", "#.@e#", "#####"],
    },
    monsters: [{ ch: "e", name: "floating eye", hp: 30, maxHp: 30, x: 35, y: 9 }],
    messages: [
      { text: "You hit the grey mold.", count: 1 },
      { text: "You feel the grey mold's spores.", count: 3 },
    ],
    pack: ["4 rations of food", "a wooden torch (2000 turns of light)"],
    equipment: ["(weapon) a broken dagger", "-"],
    home: [],
    trail: [
      { at: "1:33,9", alone: false, cmd: "walk" },
      { at: "1:34,9", alone: false, cmd: "attack" },
    ],
    census: { attack: 1, walk: 1 },
    ...over,
  };
}

function header(over: Partial<DossierHeader> = {}): DossierHeader {
  return {
    seed: 34,
    life: 3,
    record: { label: "stage-baseline-c2d1", directory: "docs/runs/2026-11-03-stage-baseline-c2d1", recorded: "2026-11-03T12:00:00.000Z" },
    death: { turn: 1365, cause: "grey mold", clvl: 1, maxDepth: 1, decisions: 45 },
    offset: 20,
    ladder: [5, 10, 15, 20],
    targetTurn: 1345,
    boundaryTurn: 1347,
    decisionsAtBoundary: 43,
    verification: { exact: true, differences: [] },
    build: { engine: "@rpgm-tools/neo-angband-core 1.23.0-beta.1", content: "neo-angband@b53ff5f0b", borg: "warrior pack (stock parameters)", cap: 10000 },
    ...over,
  };
}

describe("the dossier's format", () => {
  it("renders the same bytes for the same facts", () => {
    expect(renderDossier(header(), capture())).toBe(renderDossier(header(), capture()));
  });

  it("names the run, the rung, the death line, and the human-path settings", () => {
    const text = renderDossier(header(), capture());
    expect(text).toContain("# Death dossier - seed 34, 20 turns before the death");
    expect(text).toContain("ladder: 5/10/15/20 turns before death (this dossier: 20)");
    expect(text).toContain('recorded death: turn 1365, to "grey mold" (character level 1, deepest depth 1, 45 decisions)');
    expect(text).toContain("target turn (death turn minus 20): 1345");
    expect(text).toContain("release boundary: turn 1347 - the first decision boundary at or after the target, 43 of 45 decisions in");
    expect(text).toContain("replay verification: EXACT");
    expect(text).toContain("borg.replayReleaseTurn = 1347");
    expect(text).toContain("borg.replayDeathTurn = 1365");
    expect(text).toContain(POSTMORTEM_SCHEMA_ID);
  });

  it("says DIVERGED with the differences when the verification failed", () => {
    const text = renderDossier(
      header({ verification: { exact: false, differences: ["turn: replay 1368 vs record 1365"] } }),
      capture(),
    );
    expect(text).toContain("replay verification: DIVERGED - turn: replay 1368 vs record 1365");
  });

  it("carries every section the spec names, with fixed orders inside them", () => {
    const text = renderDossier(header(), capture());
    /* The screen, verbatim in a code block, with the legend beside it. */
    expect(text).toContain("```\n#####\n#.@e#\n#####\n```");
    expect(text).toContain("- e floating eye at 35,9 (30/30 hp)");
    /* Messages oldest first, repeats counted the engine's way. */
    const messages = text.split("## Message log")[1]!.split("## ")[0]!;
    expect(messages.indexOf("You hit the grey mold.")).toBeLessThan(messages.indexOf("x3 You feel the grey mold's spores."));
    /* Pack rows lettered like the game letters them; equipment slots kept
     * positional with '-' for empty; the home says "(nothing)" when empty. */
    expect(text).toContain("- a) 4 rations of food");
    expect(text).toContain("- b) a wooden torch (2000 turns of light)");
    expect(text).toContain("- b) -");
    expect(text).toContain("## The home (what the character stashed in town)\n\n- (nothing)");
    /* Decisions numbered by their place in the life, census sorted by code. */
    expect(text).toContain("- #42 1:33,9 alone=no walk");
    expect(text).toContain("- #43 1:34,9 alone=no attack");
    const census = text.split("## Command census")[1]!.split("## ")[0]!;
    expect(census.indexOf("attack x1")).toBeLessThan(census.indexOf("walk x1"));
    /* Provenance carries the seed and the upstream seam note. */
    expect(text).toContain("- seed 34, life 3 - record `docs/runs/2026-11-03-stage-baseline-c2d1` (stage-baseline-c2d1)");
    expect(text).toContain("neo-angband#431");
  });

  it("letters past z the way long packs need", () => {
    const many = Array.from({ length: 28 }, (_, i) => `item ${String(i)}`);
    const text = renderDossier(header(), capture({ pack: many }));
    expect(text).toContain("- z) item 25");
    expect(text).toContain("- aa) item 26");
  });
});
