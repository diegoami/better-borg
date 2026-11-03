/**
 * THE POST-MORTEM DOSSIER (#29): one dead run, one offset, one deterministic
 * page of text.
 *
 * The owner's trainer insight (2026-11-03): the feedback loop needs no human
 * in the loop's critical path. Every death a harness run records is
 * REPLAYABLE - same seed, same planned birth, same deterministic Borg (rule
 * 5) - so the moments before a death can be exported as TEXT a session with
 * code access reads natively: no screenshots, no images, nothing a diff
 * cannot compare. The dossier is that export. A session (or the owner)
 * consumes it, walks the decision code beside it, and writes a diagnosis
 * artifact under the same directory (docs/postmortem.md is the workflow).
 *
 * WHAT GOES IN, per the issue's spec: the screen as text (the remembered map
 * window with the monsters the character can see - the same facts the lab
 * hook's `screen()` renders for a watched window, here rendered from the
 * engine state a headless harness holds), the message-log tail, the pack AND
 * the home (a wrong inventory verdict often lives in the home: junk stashed,
 * kit missing), the recent decisions with the command census, the rung's
 * facts (depth/turn/cause), and the provenance (seed, lineage, engine,
 * content). Every section is pure text, every order is fixed, and no section
 * reads a clock: the same replay on the same engine and content produces
 * byte-identical output, which is what makes a committed dossier comparable
 * against a later one (rule 7's spirit, applied to a new artifact kind).
 *
 * TWO LAYERS, on purpose. `capturePostmortem` reads the LIVE game at a
 * decision boundary - engine-shaped, observation-only, draws no RNG - and
 * freezes plain data (PostmortemCapture). `renderDossier` is a pure
 * function from that data (plus the rung's header facts) to text. The seam
 * exists so the format can be tested without booting a game, and so the
 * capture can never grow formatting concerns (a number formatted in the
 * capture layer would be a number the tests cannot see).
 *
 * THE FORMAT ID (`mandos/postmortem@1`) follows the run-record schema's
 * convention: a format identifier committed into the artifacts themselves,
 * bumped (never edited) when the shape changes.
 */

import type * as Core from "@rpgm-tools/neo-angband-core";
import type { GameState } from "@rpgm-tools/neo-angband-core";

/** Identifies the dossier text's shape; bump the @n when a section changes. */
export const POSTMORTEM_SCHEMA_ID = "mandos/postmortem@1";

/** The map window's half-extent: the screen shows 2w+1 x 2h+1 grids. */
export const SCREEN_HALF_WIDTH = 16;
export const SCREEN_HALF_HEIGHT = 8;

/** How many message-log lines the dossier carries (oldest first). */
export const MESSAGE_TAIL = 20;

/** How many recent decisions the dossier carries (oldest first). */
export const DECISION_TAIL = 30;

/** The game's own view of the character, frozen at the boundary. */
export interface PostmortemPlayer {
  readonly name: string;
  readonly race: string;
  readonly cls: string;
  readonly level: number;
  readonly hp: number;
  readonly maxHp: number;
  readonly sp: number;
  readonly maxSp: number;
  readonly gold: number;
  readonly x: number;
  readonly y: number;
}

/** One monster the character can see, as the screen's legend names it. */
export interface PostmortemMonster {
  /** The race's display character (what the map cell shows). */
  readonly ch: string;
  readonly name: string;
  readonly hp: number;
  readonly maxHp: number;
  readonly x: number;
  readonly y: number;
}

/** The remembered-map window, rendered to one character per grid. */
export interface PostmortemScreen {
  readonly originX: number;
  readonly originY: number;
  readonly width: number;
  readonly height: number;
  readonly rows: readonly string[];
}

/** Everything the dossier shows, frozen at one decision boundary. */
export interface PostmortemCapture {
  readonly turn: number;
  readonly depth: number;
  readonly player: PostmortemPlayer;
  readonly screen: PostmortemScreen;
  readonly monsters: readonly PostmortemMonster[];
  readonly messages: readonly { readonly text: string; readonly count: number }[];
  readonly pack: readonly string[];
  readonly equipment: readonly string[];
  readonly home: readonly string[];
  readonly trail: readonly { readonly at: string; readonly alone: boolean; readonly cmd: string }[];
  readonly census: Readonly<Record<string, number>>;
}

/** The rung's facts: which dead run, which offset, and how the replay ended. */
export interface DossierHeader {
  /** The dead run's seed (the harness owns it; the record carries it). */
  readonly seed: number;
  /** The life number within the record (1-based, the record's own key). */
  readonly life: number;
  /** The record directory the dead run lives in (e.g. the baseline's). */
  readonly record: { readonly label: string; readonly directory: string; readonly recorded: string };
  /** The recorded death: the facts the replay must reproduce exactly. */
  readonly death: {
    readonly turn: number;
    readonly cause: string;
    readonly clvl: number;
    readonly maxDepth: number;
    readonly decisions: number;
  };
  /** This dossier's rung: the offset, and the whole ladder for context. */
  readonly offset: number;
  readonly ladder: readonly number[];
  /** T - offset: the turn the autoplayer drives to. */
  readonly targetTurn: number;
  /** The boundary actually captured: the first decision boundary at or after targetTurn. */
  readonly boundaryTurn: number;
  /** Decisions completed when the boundary was captured (of the death's total). */
  readonly decisionsAtBoundary: number;
  /** Whether the replay's death matched the record (cause, turn, decisions, census). */
  readonly verification: { readonly exact: boolean; readonly differences: readonly string[] };
  /** What was playing (the record's own provenance block, cited). */
  readonly build: { readonly engine: string; readonly content: string | null; readonly borg: string; readonly cap: number };
}

/** The game's letter for a pack/equipment row: a, b, ... z, then aa, ab, ... */
function slotLetter(index: number): string {
  let n = index;
  let text = "";
  do {
    text = String.fromCharCode(97 + (n % 26)) + text;
    n = Math.trunc(n / 26) - 1;
  } while (n >= 0);
  return text;
}

/**
 * Freeze the live game into a capture. OBSERVATION ONLY: every read here is
 * of state the game already holds (the remembered map, the message log, the
 * pack, the home, the census the session's observation keeps); nothing draws
 * RNG and nothing mutates, so the driven play is exactly what it was - the
 * same standing the session's own census and trail keep (rule 5).
 *
 * `observation` is the session's LifeObservation slice (commands + trail):
 * the census-so-far and the recent decisions ARE the "what was the Borg
 * doing" section; the trail's tail is taken oldest-first, newest last.
 */
export function capturePostmortem(
  core: typeof Core,
  state: GameState,
  observation: {
    readonly commands: Record<string, number>;
    readonly trail: readonly { readonly at: string; readonly alone: boolean; readonly cmd: string }[];
  },
): PostmortemCapture {
  const player = state.actor.player;

  /* The screen: the remembered map (what the character's own map shows -
   * unknown grids blank, stale memory kept stale, exactly the knowledge the
   * Borg plays from), with the VISIBLE monsters and the character stamped
   * over it. A fixed window centered on the character: symmetric, diffable,
   * deterministic - the dossier's map is not a screenshot of a viewport
   * whose size depends on the reader's screen. */
  const originX = state.actor.grid.x - SCREEN_HALF_WIDTH;
  const originY = state.actor.grid.y - SCREEN_HALF_HEIGHT;
  const width = SCREEN_HALF_WIDTH * 2 + 1;
  const height = SCREEN_HALF_HEIGHT * 2 + 1;

  const visible = new Map<string, PostmortemMonster>();
  for (const mon of state.monsters) {
    if (mon === null || !mon.mflag.has(core.MFLAG.VISIBLE)) continue;
    const ch = mon.race.dChar !== "" ? mon.race.dChar : "M";
    visible.set(`${String(mon.grid.x)},${String(mon.grid.y)}`, {
      ch,
      name: mon.race.name,
      hp: mon.hp,
      maxHp: mon.maxhp,
      x: mon.grid.x,
      y: mon.grid.y,
    });
  }

  const rows: string[] = [];
  for (let dy = 0; dy < height; dy++) {
    let row = "";
    for (let dx = 0; dx < width; dx++) {
      const x = originX + dx;
      const y = originY + dy;
      if (x === state.actor.grid.x && y === state.actor.grid.y) {
        row += "@";
        continue;
      }
      const seen = visible.get(`${String(x)},${String(y)}`);
      if (seen !== undefined) {
        row += seen.ch;
        continue;
      }
      /* B32: a rung boundary near the level edge puts parts of the fixed
       * 33x17 window outside the chunk; core.knownFeat indexes the known
       * map without a bounds check (gi = y*width+x), so an out-of-bounds
       * read surfaces here as features.get(undefined). Out-of-bounds is
       * unknown terrain: render the blank, exactly as remembered < 0 does.
       * Found by the seed-34 replay the moment the fixed borg stood where
       * the recorded run never did (the diverged-replay-dossier promise,
       * B29's semantic choice 5, holds again). */
      const remembered = state.chunk.inBoundsFully({ x, y })
        ? core.knownFeat(state, { x, y })
        : -1;
      if (remembered < 0) {
        row += " ";
        continue;
      }
      const feature = state.chunk.features.get(remembered);
      row += feature.dChar !== "" ? feature.dChar : " ";
    }
    rows.push(row);
  }

  /* The message log: newest-first internally, carried oldest-first (the
   * order a reader meets them in), with the engine's own repeat counts. */
  const log = state.messages ?? null;
  const total = log === null ? 0 : log.num();
  const messages: { text: string; count: number }[] = [];
  for (let age = Math.min(MESSAGE_TAIL, total) - 1; age >= 0; age--) {
    messages.push({ text: log!.str(age), count: log!.count(age) });
  }

  /* The pack and the worn equipment, named by the game's own describe call -
   * gated by the character's real knowledge (the same names the inventory
   * screen shows). The home beside them, from the live town stores: empty
   * for a character that never stashed anything, which is itself a verdict
   * the post-mortem can question. */
  const nameOf = (handle: number | undefined): string | null => {
    if (handle === undefined || handle === 0) return null;
    const obj = state.gear.store.get(handle);
    if (obj === undefined) return null;
    return core.describeObject(state, obj);
  };
  const pack: string[] = [];
  for (const handle of state.gear.pack) {
    const named = nameOf(handle);
    if (named !== null) pack.push(named);
  }
  const equipment: string[] = [];
  for (let slot = 0; slot < player.equipment.length; slot++) {
    const named = nameOf(player.equipment[slot]);
    equipment.push(named === null ? "-" : named);
  }
  const home: string[] = [];
  for (const store of state.stores ?? []) {
    if (store.featName !== "HOME") continue;
    for (const obj of store.stock) home.push(core.describeObject(state, obj));
  }

  return {
    turn: state.turn,
    depth: state.chunk.depth,
    player: {
      name: player.fullName.length > 0 ? player.fullName : "Borg",
      race: player.race.name,
      cls: player.cls.name,
      level: player.lev,
      hp: player.chp,
      maxHp: player.mhp,
      sp: player.csp,
      maxSp: player.msp,
      gold: player.au,
      x: state.actor.grid.x,
      y: state.actor.grid.y,
    },
    screen: { originX, originY, width, height, rows },
    monsters: [...visible.values()].sort((a, b) =>
      a.y !== b.y ? a.y - b.y : a.x !== b.x ? a.x - b.x : a.name < b.name ? -1 : 1),
    messages,
    pack,
    equipment,
    home,
    trail: observation.trail.slice(-DECISION_TAIL),
    census: { ...observation.commands },
  };
}

/** A section title, uniform. */
function section(title: string): string {
  return `## ${title}`;
}

/**
 * Render the dossier: ONE deterministic text page. Pure - the same header and
 * capture always render to the same bytes, so a dossier committed under a
 * record directory is comparable against any later regeneration of it.
 */
export function renderDossier(header: DossierHeader, capture: PostmortemCapture): string {
  const lines: string[] = [];
  const ladder = header.ladder.map((n) => String(n)).join("/");
  const linesOut = (title: string, rows: readonly string[]): void => {
    lines.push(section(title));
    lines.push("");
    if (rows.length === 0) {
      lines.push("- (nothing)");
      lines.push("");
      return;
    }
    for (const row of rows) lines.push(`- ${row}`);
    lines.push("");
  };

  lines.push(`# Death dossier - seed ${String(header.seed)}, ${String(header.offset)} turns before the death`);
  lines.push("");
  lines.push(
    `The rung ${String(header.offset)} of the replay ladder (${ladder} turns before death) for the dead run ` +
      `recorded in \`${header.record.directory}\` (runs.json seed ${String(header.seed)}, life ${String(header.life)}; ` +
      `recorded ${header.record.recorded}). The replay rebooted the recorded seed with the same planned birth and drove ` +
      `the Borg deterministically; this page freezes what the character knew at the release point. ` +
      `Format \`${POSTMORTEM_SCHEMA_ID}\`.`,
  );
  lines.push("");

  lines.push(section("The rung"));
  lines.push("");
  lines.push(`- ladder: ${ladder} turns before death (this dossier: ${String(header.offset)})`);
  lines.push(
    `- recorded death: turn ${String(header.death.turn)}, to "${header.death.cause}" ` +
      `(character level ${String(header.death.clvl)}, deepest depth ${String(header.death.maxDepth)}, ${String(header.death.decisions)} decisions)`,
  );
  lines.push(`- target turn (death turn minus ${String(header.offset)}): ${String(header.targetTurn)}`);
  lines.push(
    `- release boundary: turn ${String(capture.turn)} - the first decision boundary at or after the target, ` +
      `${String(header.decisionsAtBoundary)} of ${String(header.death.decisions)} decisions in`,
  );
  lines.push(
    header.verification.exact
      ? "- replay verification: EXACT - the replayed death reproduced the record (cause, turn, decisions, census)"
      : `- replay verification: DIVERGED - ${header.verification.differences.join("; ")}`,
  );
  lines.push(
    `- human replay settings: borg.replayReleaseTurn = ${String(header.boundaryTurn)}, ` +
      `borg.replayDeathTurn = ${String(header.death.turn)}`,
  );
  lines.push("");

  lines.push(section("The character at the boundary"));
  lines.push("");
  lines.push(
    `- ${capture.player.name}, ${capture.player.race} ${capture.player.cls}, character level ${String(capture.player.level)}`,
  );
  lines.push(
    `- hit points ${String(capture.player.hp)}/${String(capture.player.maxHp)}, ` +
      `spell points ${String(capture.player.sp)}/${String(capture.player.maxSp)}, gold ${String(capture.player.gold)}`,
  );
  lines.push(
    `- depth ${String(capture.depth)}, grid ${String(capture.player.x)},${String(capture.player.y)}, turn ${String(capture.turn)}`,
  );
  lines.push("");

  lines.push(section(`The screen (the remembered map, ${String(capture.screen.width)}x${String(capture.screen.height)} around the character)`));
  lines.push("");
  lines.push("```");
  for (const row of capture.screen.rows) lines.push(row);
  lines.push("```");
  lines.push("");
  if (capture.monsters.length === 0) {
    lines.push("No monster is visible.");
  } else {
    lines.push("Visible monsters (letter = the map cell):");
    for (const mon of capture.monsters) {
      lines.push(`- ${mon.ch} ${mon.name} at ${String(mon.x)},${String(mon.y)} (${String(mon.hp)}/${String(mon.maxHp)} hp)`);
    }
  }
  lines.push("");

  linesOut(
    `Message log (the last ${String(MESSAGE_TAIL)} lines, oldest first, repeats counted)`,
    capture.messages.map((m) => (m.count > 1 ? `x${String(m.count)} ${m.text}` : m.text)),
  );

  linesOut(
    "The pack",
    capture.pack.map((item, i) => `${slotLetter(i)}) ${item}`),
  );

  linesOut(
    "Worn equipment (body slots in order)",
    capture.equipment.map((item, i) => `${slotLetter(i)}) ${item}`),
  );

  linesOut("The home (what the character stashed in town)", capture.home);

  const firstDecision = Math.max(0, header.decisionsAtBoundary - capture.trail.length);
  linesOut(
    `Recent decisions (the last ${String(capture.trail.length)}, oldest first; at = depth:x,y; alone = nothing visible)`,
    capture.trail.map(
      (step, i) =>
        `#${String(firstDecision + i + 1)} ${step.at} alone=${step.alone ? "yes" : "no"} ${step.cmd}`,
    ),
  );

  const census = Object.entries(capture.census).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  linesOut(
    "Command census (to the boundary)",
    census.map(([code, count]) => `${code} x${String(count)}`),
  );

  lines.push(section("Provenance"));
  lines.push("");
  lines.push(`- seed ${String(header.seed)}, life ${String(header.life)} - record \`${header.record.directory}\` (${header.record.label})`);
  lines.push(`- engine ${header.build.engine}; content ${header.build.content ?? "(unidentified)"}`);
  lines.push(`- borg ${header.build.borg}; decision cap ${String(header.build.cap)}`);
  lines.push(
    "- watched-lineage replay (a death the MOD played, seed unknown to it) needs the upstream seed seam: " +
      "neo-angband#431",
  );
  lines.push("");
  return `${lines.join("\n")}\n`;
}
