/**
 * Borg, as a mod's entry point.
 *
 * This file and title.ts are the mod's own code, and src/api2/ is the bridge
 * between the game's API and the port: everything else under src/ is the port,
 * carried over from the game's repository. This file's job is to satisfy the
 * mod API, read the game's content once, and take a decision at each input wait.
 * title.ts adds the title screen's "New Mandos character" row, which also
 * arms the planned birth.
 *
 * THE M2 UNIFICATION (#15): the mod is ONE class-agnostic core with
 * per-class STRATEGY PACKS (src/class/). Since #16 the class and race of
 * each birth are drawn from the birth pools (src/birth/pools.ts: one toggle
 * per class and per race); a Warrior is born through the warrior pack's plan,
 * whose lineage continues here from the archived neowarrior-borg fork, and
 * any other class through the game's suggested spread. What that adds to
 * this file, ported from the archived fork at v0.1.0 (e1ec1b7): the birth
 * presenter under `ui:birth.replace` (src/class/birth.ts), the restart loop
 * (src/loop/restart.ts) with `onDeath: "end"`, and the journal and graveyard
 * (src/records/journal.ts) - the unattended line: birth, play, die, record,
 * restart.
 *
 * ------------------------------------------------------------------
 * WHY BORG IS A MOD AT ALL
 * ------------------------------------------------------------------
 *
 * Upstream, the borg hooks the game at `inkey_hack`: when Angband asks for a
 * keypress, the borg perceives the world, decides, and returns keystrokes. That
 * is a privileged position inside the C. Here it is not privileged at all: it is
 * the mod API's `controller`, the same seam any agent mod uses. Borg is the most
 * demanding possible consumer of "read the whole game, drive every command", so
 * a faithful Borg that plays correctly IS the acceptance test that the surface
 * is complete.
 *
 * ------------------------------------------------------------------
 * WHAT THE BORG MAY SEE
 * ------------------------------------------------------------------
 *
 * An autoplayer plans from the known world: the remembered map, the monsters the
 * character perceives, the pack, the stores as the character last saw them
 * (neostryder/neo-angband#415). Every hidden read is named in
 * src/api2/truth.ts with its reason, and truth-allowlist.test.ts fails when
 * this mod calls any other. The real map is not read at all.
 *
 * ------------------------------------------------------------------
 * WHY bindCore RUNS FIRST
 * ------------------------------------------------------------------
 *
 * A plugin cannot `import` the engine: a bare specifier does not resolve in a
 * module fetched from a folder, and bundling core into plugin.js would give this
 * mod its own registries and singletons while the game ran on another set. The
 * host passes the engine in as `mod.engine.core` instead, and src/core-api.ts is
 * the one file that holds it - read that file's header for how, and for the
 * single rule it imposes on the rest of the port.
 *
 * ------------------------------------------------------------------
 * WHY THIS DECLARES NO HOOKS
 * ------------------------------------------------------------------
 *
 * Borg changes no rule, adds no record, and overrides no system. It plays the
 * game exactly as a player can, through commands the engine already accepts.
 * It adds only the title row, and only when the host grants the title and
 * profile seams (title.ts).
 */

import type { Api2ControllerContext, Api2Events, Api2InputState, Api2ModDefinition, Api2BirthPresenter, Api2Subscription, ModApi2 } from "@rpgm-tools/neo-angband-mod-sdk";
import type * as Core from "@rpgm-tools/neo-angband-core";
import { installMemory, registerBorgTitle } from "./title.js";
import { NOSCORE_BORG } from "./src/activate.js";
import { createBorg } from "./src/controller.js";
import { makeCoreResolvers } from "./src/resolvers.js";
import { defaultCfg, setBuffTimerSafetyNet, type BorgCfg } from "./src/trait/config.js";
import { createBridge, type Bridge } from "./src/api2/host.js";
import { createTick, type Tick } from "./src/api2/controller.js";
import { forgetGrid } from "./src/loop/stall.js";
import { plannedBirth, TITLE_ROW_LABEL } from "./src/class/birth.js";
import { installBorgJournal, type BorgJournal } from "./src/records/journal.js";
import { installBorgRestart, type BorgRestart } from "./src/loop/restart.js";
import { librarySlotName, stageAttained, stageOf, STAGE_CLVL_SETTING, STAGE_DEPTH_SETTING, STAGE_RETIREMENT_FLAG, type StageDefinition } from "./src/loop/stage.js";
import { replayBanner, replayModeOf, REPLAY_DEATH_SETTING, REPLAY_RELEASE_SETTING, type ReplayMode } from "./src/loop/replay.js";
import { assessUncertainty, MAX_UNSURE_KEPT, type UnsurePoint } from "./src/uncertainty.js";
import { readLineage } from "./src/class/warrior/lineage.js";

/**
 * Whether this character has already handed the keyboard to an autoplayer.
 *
 * Enabling the mod and giving away the keyboard are different decisions. There
 * is no standing settings toggle for that any more: Ctrl-Z (the host's
 * do_cmd_try_borg) warns, confirms, marks NOSCORE_BORG on the save, and
 * reloads. This plugin then offers to play only when that permanent mark is
 * already set, so a virgin character stays under human control until Ctrl-Z,
 * and a character that has run the Borg before resumes with it at the wheel.
 * Offering to play from an unmarked save would reintroduce a boot-time confirm
 * every launch merely because the mod is enabled.
 *
 * The one other way in is the title row: a character started from the row
 * arrives armed - and born as the active pack's planned character (title.ts
 * sets the birth flag at its commit point) - because choosing the row was
 * already the player's consent for that character.
 */
function characterAlreadyAutoplayed(context: Api2ControllerContext): boolean {
  const state = context.engine?.state as { readonly actor?: { readonly player?: { readonly noscore?: number } } } | undefined;
  return ((state?.actor?.player?.noscore ?? 0) & NOSCORE_BORG) !== 0;
}

/**
 * The settings a player can move, and the `borg_cfg[]` entry each one is.
 *
 * ------------------------------------------------------------------
 * WHY A MANIFEST RULE AND NOT A SETTINGS FILE
 * ------------------------------------------------------------------
 *
 * Upstream reads `borg.txt` out of the user directory at start-up. There is no
 * user directory here and no path a player could reach on a phone, so the
 * question is which of the host's own surfaces carries a setting. Three exist. A
 * manifest `rule` is a labelled toggle in the mod manager, resolved per mod and
 * handed to the plugin as `ctx.flags`. `ctx.prefs` is a JSON blob the host
 * stores and nothing edits. `ctx.ui.openPanel` is a real form, behind a
 * capability a player has to consent to and a panel the game has to be given a
 * way to open.
 *
 * Rules win for everything that is a yes or a no, which is most of upstream's
 * table: the toggle already exists, it needs no new permission on a screen a
 * player reads before configuring how the Borg plays, and changing one
 * re-composes the page - so a session never sees a setting move under it, which
 * is exactly the lifetime `borg_cfg[]` has. Handing over the keyboard itself is
 * Ctrl-Z in the host, not a rule.
 * The numeric settings (depth ceilings, the enchant limit, a pinned respawn race
 * or class) have no yes-or-no shape and are not here; PLANNED.md carries what
 * each of them still needs.
 *
 * ONLY SETTINGS THE PORT READS ARE LISTED. A toggle for something no ported line
 * consults is worse than an absent one: it reads as a feature, it survives every
 * test, and the only way to find out is to watch a Borg ignore it. Four of
 * upstream's settings are held back on exactly that ground, and each is a
 * different distance from working:
 *
 *   - `borg_kills_uniques` has no reader at all. Its branch needs the live-unique
 *     census (`borg_numb_live_unique`, `borg_depth_hunted_unique`), built upstream
 *     by scanning the whole race table for unique population counts
 *     (borg-update.c) - state this port does not keep.
 *   - `borg_uses_dynamic_calcs` switches the power/depth/restock math from the
 *     internal calculations to a formula language upstream parses out of
 *     `borg.txt`'s own FORMULA SECTION (borg-formulas.c). That is a second
 *     calculation engine, not a flag on this one, and porting it is its own
 *     project.
 *   - `borg_uses_swaps` has a reader (`borgUsesSwaps`, store.ts) that gates two
 *     store functions which return early regardless of its value, because the
 *     swap valuation seams (`weaponSwapEval`/`armourSwapEval`) are deliberately
 *     unwired - see think-session.ts. A swap also contributes zero to
 *     `borg_power` here, so the toggle would tick and the Borg would play
 *     identically either way.
 *   - The numeric settings (`borg_no_deeper`, `borg_munchkin_level`,
 *     `borg_enchant_limit`) have no yes-or-no shape, and the host's manifest rule
 *     schema (`PackRule` in `@rpgm-tools/neo-angband-mod-sdk`) carries only a
 *     boolean `default` - there is no numeric or range rule type to ask for one
 *     with. See PLANNED.md for what a host-side fix would need.
 *
 * `borg_munchkin_start` is NOT on this list any more: it moves real gear
 * valuation (`trait/power.ts`) even though the stair-scum diving mode it is
 * named for is not ported, and that is enough of a working setting to ship - the
 * manifest rule's own description says exactly which half it is.
 */
/**
 * The settings a rule can carry: the yes-or-no half of `BorgCfg`.
 *
 * Derived rather than listed, so wiring a rule to a numeric setting - a depth
 * ceiling, the enchant limit - is a compile error here rather than a toggle that
 * writes `true` into a field the decision code compares against a level.
 */
type BoolCfgKey = {
  [K in keyof BorgCfg]: BorgCfg[K] extends boolean ? K : never;
}[keyof BorgCfg];

const RULE_CFG: Readonly<Record<string, BoolCfgKey>> = {
  "borg.playsRisky": "playsRisky",
  "borg.worshipsDamage": "worshipsDamage",
  "borg.worshipsSpeed": "worshipsSpeed",
  "borg.worshipsHp": "worshipsHp",
  "borg.worshipsMana": "worshipsMana",
  "borg.worshipsAc": "worshipsAc",
  "borg.worshipsGold": "worshipsGold",
  "borg.selfScum": "selfScum",
  "borg.munchkinStart": "munchkinStart",
};

/**
 * Fold the resolved rule flags into a settings override.
 *
 * A flag the host did not resolve is left out rather than read as false. The
 * host resolves every rule this mod's own manifest declares, so a missing one
 * means the manifest and this table have drifted - and `selfScum` defaults to
 * ON, so reading absence as false would quietly switch off a setting upstream
 * ships enabled. src/manifest-tunables.test.ts is what stops the drift; this is
 * what stops it costing anything if it happens.
 */
function cfgFromFlags(
  flags: Readonly<Record<string, boolean>>,
): { [K in BoolCfgKey]?: boolean } {
  const cfg: { [K in BoolCfgKey]?: boolean } = {};
  for (const [flag, key] of Object.entries(RULE_CFG)) {
    const value = flags[flag];
    if (typeof value === "boolean") cfg[key] = value;
  }
  return cfg;
}

/**
 * The settings that are NOT on their stock value, for the log line.
 *
 * Named rather than counted, because the log of an unattended run is the only
 * record of what the Borg was told to do, and "3 settings changed" does not
 * explain a Borg that dived to depth twelve at character level four.
 */
function changedFrom(cfg: Partial<BorgCfg>): string[] {
  const stock = defaultCfg();
  return Object.entries(cfg)
    .filter(([key, value]) => stock[key as keyof BorgCfg] !== value)
    .map(([key, value]) => `${key}=${String(value)}`)
    .sort();
}

/** What one running mod holds: the bridge to the game and the decision tick. */
interface Running {
  readonly bridge: Bridge;
  readonly tick: Tick;
  /** The restart loop, so a stop can retire it with the bridge. */
  readonly restart: BorgRestart;
  /** The journal, retired with the loop and the bridge. */
  readonly journal: BorgJournal;
}

/**
 * The stage THIS page's character grinds toward (#25): `borg.stageClvl` x
 * `borg.stageDepth`, read from the persisted settings at each page - the
 * same per-page lifetime `borg.class` keeps, so a change applies to the
 * NEXT birth (rule 5: no mid-life policy shifts; the stage check a life
 * runs against is fixed at its own page). The declared defaults - the stage
 * baseline's calibration, docs/runs/2026-11-03-stage-baseline/ - serve
 * until the settings read lands, which is long before any character can
 * attain anything; a host with no settings seam plays the defaults.
 */
let activeStage: StageDefinition = stageOf({});
/**
 * THE REPLAY MODE this page runs (#29, the trainer's human path): the two
 * `borg.replay*` settings, read from the persisted settings at each page -
 * the same per-page lifetime the stage keeps, for the same reason (rule 5:
 * the release point is fixed for the life that plays it; a mid-life move of
 * the rung would move the goalposts under a running replay). The defaults
 * (both 0) keep the mode OFF: nothing about the grind changes until an
 * owner deliberately arms a replay from a dossier's rung line.
 */
let activeReplay: ReplayMode = replayModeOf({});
/**
 * The install slot's lineage counter as this page read it (#25): the
 * mod-side library name's identity segment. A mod cannot know the game
 * seed - no host seam carries it - so the kept save is named by the birth
 * counter instead (the harness, which owns the seed, names by the seed;
 * src/loop/stage.ts documents the split). Read once per page, fire and
 * forget like the settings read; null until it lands.
 */
let lineageAtPage: number | null = null;

let bridge: Bridge | undefined;
let running: Promise<Running | null> | undefined;
/* The restart loop's handle, retired in stop() with the bridge. */
let restartHandle: BorgRestart | undefined;
/* The journal's handle, retired the same way. Module-level for the same
 * reason: a stop can land before `running` settles. */
let journalHandle: BorgJournal | undefined;
/**
 * The replay demonstration log's event subscription (#29): module-level for
 * the same reason as the handles above - a stop must retire it even mid-
 * start, or a re-registration on the same page would log every command
 * twice. The events domain it was subscribed through is held beside it
 * because `stop()` receives no mod - only the off seam is kept, nothing
 * wider.
 */
let replayLogHandle: Api2Subscription | null = null;
let replayLogOff: Api2Events["off"] | null = null;
/**
 * The installation epoch (ported from the archived fork's #30). stop() bumps
 * it SYNCHRONOUSLY; a begin that was still starting when stop ran finds the
 * epoch it captured stale at its checkpoint and installs NOTHING - no title
 * row, no restart listener, no handles published - disposing the bridge it
 * made. A begin that starts AFTER a stop captures the bumped epoch and
 * installs normally: stop retires starts in flight, it does not forbid new
 * ones, and a stopped older start resolving late must not disturb whatever a
 * newer start installed.
 */
let startEpoch = 0;

async function begin(mod: ModApi2): Promise<Running | null> {
  /* Captured before this start's first await, so a stop landing while it is
   * still starting invalidates it. */
  const mine = startEpoch;
  /* A start always gets a bridge of its own, so a second start on the same page reads this game and never the one before it. */
  void bridge?.dispose();
  const made = createBridge(mod);
  bridge = made;
  await made.prime();
  if (mine !== startEpoch) {
    /* Stopped mid-start: dispose what THIS start made and publish nothing -
     * its own bridge only, because the module-level handles may already
     * belong to a newer start and must not be touched from here. */
    mod.meta.log("the Borg's start was stopped before it finished, so it installed nothing");
    void made.dispose();
    return null;
  }
  /* THE STAGE (#25), read from the persisted settings - fire-and-forget
   * here (the settings call is async), settled long before any birth is
   * offered: both stage settings resolve through their declared ranges
   * (stageOf), so a moved number applies to the next birth. A host with no
   * settings seam, or a failed read, keeps the declared defaults. The class
   * and race are not settings: they are the birth pools' toggles
   * (src/birth/pools.ts), read by the birth wiring. */
  try {
    if (typeof mod.meta.settings === "function") {
      void mod.meta.settings().then(
        (read) => {
          if (read.ok) {
            activeStage = stageOf({
              clvl: read.value[STAGE_CLVL_SETTING.id],
              depth: read.value[STAGE_DEPTH_SETTING.id],
            });
            activeReplay = replayModeOf({
              release: read.value[REPLAY_RELEASE_SETTING.id],
              death: read.value[REPLAY_DEATH_SETTING.id],
            });
          }
        },
        () => {
          /* Kept at the declared default stage. */
        },
      );
    }
  } catch {
    /* Kept at the declared default stage. */
  }
  /* The lineage counter for this page's library names: same fire-and-forget
   * lifetime, same settled-long-before-it-matters property. */
  void readLineage(mod.store.install).then(
    (counter) => {
      lineageAtPage = counter;
    },
    () => {
      /* Kept null; the name degrades to the stage alone. */
    },
  );
  const cfg = cfgFromFlags(mod.meta.flags);
  /* Cross-mod, deliberately outside RULE_CFG and cfg itself: see
   * config.ts's setBuffTimerSafetyNet for why. */
  setBuffTimerSafetyNet(mod.meta.flags["bugfix.borgFixes"] ?? true);
  const borg = createBorg({ resolvers: makeCoreResolvers(made.resolverInput()), cfg });
  /* The title row needs ui:title, profiles:manage and the install slot (the
   * row sets the birth flag there); without all three there is no row. The
   * label names no class: the class is drawn at the birth (#16). */
  registerBorgTitle(
    {
      id: mod.meta.id,
      log: (message) => mod.meta.log(message),
      ...(mod.presentation?.title ? { title: mod.presentation.title } : {}),
      ...(mod.manage ? { profiles: mod.manage.profiles } : {}),
      slot: mod.store.install,
      label: TITLE_ROW_LABEL,
    },
    installMemory(mod.store.install),
  );
  mod.meta.log(
    made.hasTruth
      ? "the Borg has the keyboard, with danger vision over the monsters the character perceives, activation identity, the in-shop signal and loadout evaluation"
      : "the Borg has the keyboard, but the game gave it no truth domain: it plays from the known world only, with monster hit points read from health bands",
  );
  const changed = changedFrom(cfg);
  mod.meta.log(changed.length === 0 ? "the Borg is on upstream's stock settings" : `the Borg's settings differ from stock: ${changed.join(", ")}`);
  const forget = (x: number, y: number): void => forgetGrid(borg.world, x, y);
  /* The journal, installed BEFORE the restart loop so the loop can be handed
   * the graveyard writer it awaits ahead of its flag/create sequence. Every
   * piece is a slice of this mod's own context: the character's slot in its
   * own save (the host scopes it to the character, which is what "stored
   * under ctx.character.key()" means in API 2) carries the LIVING character's
   * depth milestones, and the INSTALL slot carries the graveyard archive -
   * the substrate whose lifetime survives the character, because the host's
   * death order deletes the character's save (markDead) before the run report
   * even publishes, and a graveyard written only to the character's bag was a
   * record no later page could read (the archived fork's #34 finding). The
   * same shared value carries the pack's lineage counter and the birth flag,
   * so the archive's writes preserve siblings. The log, the event domain the
   * level arrivals arrive on (the manifest's event:dungeonlevel grant), and
   * the cheap stamps - the character's level from the player read the mod
   * already holds, the turn from the world snapshot it already reads per
   * decision - complete it. The protocol and the dedup rule are documented in
   * src/records/journal.ts. */
  const journal = installBorgJournal({
    slot: mod.store.character,
    archive: mod.store.install,
    log: (message) => mod.meta.log(message),
    events: mod.events,
    stamps: async () => {
      /* Neither read may exist on a given host (the fake game has no player
       * seam); a milestone without stamps is still a milestone. */
      let level: number | null = null;
      let turn: number | null = null;
      try {
        if (typeof mod.view.player === "function") {
          const read = await mod.view.player();
          if (read.ok && typeof read.value.level === "number") level = read.value.level;
        }
      } catch {
        /* Kept null; the milestone still records the arrival. */
      }
      try {
        const world = await mod.view.world();
        if (world.ok && typeof world.value.turn === "number") turn = world.value.turn;
      } catch {
        /* Kept null. */
      }
      return { level, turn };
    },
  });
  /* The restart loop, with the journal's graveyard writer: the record of the
   * run that ended is awaited inside the report path BEFORE the birth flag
   * and the create, so the page teardown a successful create causes can
   * never lose it. Every piece is a slice of this mod's own context: the
   * install slot the birth flag lives in, the log, the keyboard-ownership
   * question, the roster's create (absent on a host that gives this mod no
   * manage seam - the loop says so and the run ends at its death), and the
   * event domain the run report arrives on. THE RETIRE SEAMS (#25) ride
   * along: the session save (session:control) and the roster's list and
   * rename (saves:manage) - absent on a host without them, in which case an
   * attained run plays on, loudly. The protocol it implements - death,
   * report, journal, flag, create, reload, presenter, armed controller -
   * and every failure mode's landing place are documented in
   * src/loop/restart.ts. */
  const restart = installBorgRestart({
    slot: mod.store.install,
    log: (message) => mod.meta.log(message),
    ownsKeyboard: () => mod.act.controller.owns(),
    create: mod.manage?.saves.create ?? null,
    events: mod.events,
    /* The graveyard write carries the ended run's uncertainty journal in the
     * SAME archived entry (#27): where the run was unsure, beside the facts
     * the report itself carries - the on-death report's "where I was not
     * sure" half. Nothing journaled means no dossier: the entry keeps its
     * pre-#27 shape. */
    graveyard: (report) =>
      journal.graveyard(
        report,
        unsure.total > 0 ? { unsure: { total: unsure.total, points: [...unsure.points] } } : {},
      ),
    save: mod.manage?.session?.save ?? null,
    listSaves: mod.manage?.saves.list ?? null,
    rename: mod.manage?.saves.rename ?? null,
  });
  /* THE UNCERTAINTY JOURNAL (#27, phase 1): this page's unsure points, the
   * bounded tail beside the raw total, collected by the tick's trainer rail
   * at every decision the signal marks. Pure observation - the assess call
   * reads the valuation the attack chooser already recorded and the world
   * model the decision already ran on, so the mod's play is byte-for-byte
   * what it was, and the journal only adds the record. */
  const unsure = { total: 0, points: [] as UnsurePoint[] };
  const trainerRail: NonNullable<Parameters<typeof createTick>[1]>["trainer"] = {
    assess: (world, command) => assessUncertainty(borg.world, world.view, command),
    note: (point) => {
      unsure.total += 1;
      unsure.points.push(point);
      if (unsure.points.length > MAX_UNSURE_KEPT) unsure.points.shift();
    },
  };
  /* THE STAGE WATCH (#25): the tick asks it after every world read; it
   * answers from the sticky facts (level, maxDepth) against the page's
   * stage, ONCE - attainment never un-happens, so the latch costs nothing
   * and buys the fail-safe's property: a retire whose save was refused
   * leaves the run playing, and the watch never asks again. The retire call
   * hands the loop the live facts (the roster entry the save just wrote
   * will carry them) and the library name (this page's stage, and the
   * lineage counter as the identity - the seed is not a thing a mod can
   * know). */
  // FORK: Mandos180 keeps benchmark retirement off unless explicitly requested.
  // The workflow opt-in is fixed for this controller/page; thresholds stay unchanged.
  const stageRetirementEnabled = mod.meta.flags[STAGE_RETIREMENT_FLAG] === true;
  let attainmentSeen = false;
  const stageWatch: NonNullable<Parameters<typeof createTick>[1]>["stage"] = {
    attained: (world) => {
      if (!stageRetirementEnabled || attainmentSeen) return false;
      const player = world.view.player();
      if (!stageAttained(activeStage, { clvl: player.level, maxDepth: player.maxDepth })) return false;
      attainmentSeen = true;
      return true;
    },
    onAttained: (world) => {
      const player = world.view.player();
      mod.meta.log(
        `the Borg's stage for this character is ${String(activeStage.clvl)}/${String(activeStage.depth)} ` +
          `(character level and first-arrival depth), from borg.stageClvl and borg.stageDepth`,
      );
      restart.retire({
        clvl: player.level,
        depth: player.depth,
        slotName: librarySlotName(activeStage, { seed: null, lineage: lineageAtPage }),
      });
    },
  };
  /* THE REPLAY RELEASE WATCH (#29), the same shape as the stage watch's:
   * the predicate reads the turn the world already carries against the
   * page's release setting, and the one-shot latch lives in the tick. The
   * banner is pure text from the resolved settings (src/loop/replay.ts);
   * `controller.release(reason)` shows it, which IS the banner. `onReleased`
   * arms the demonstration log below. OFF unless the owner armed it: a
   * release setting of 0 never answers true. */
  let replayReleased = false;
  const replayWatch: NonNullable<Parameters<typeof createTick>[1]>["replay"] = {
    releaseAt: (world) => activeReplay.release > 0 && world.view.turn() >= activeReplay.release,
    banner: () => replayBanner(activeReplay),
    onReleased: (world) => {
      replayReleased = true;
      mod.meta.log(
        `the Borg reached the death replay's release point (turn ${String(world.view.turn())}); ` +
          "the keyboard is the owner's and every command from here is logged",
      );
    },
  };
  /* THE DEMONSTRATION LOG (#29, the minimal rail): the `player-command`
   * event fires only for the PLAYER's commands - an installed controller
   * replaces the human's command provider, so the Borg's own never reach it
   * (neo-angband main.ts emitPlayerCommand, the SDK's Api2CommandEvent) - so
   * one subscription covers the human half: from the release on, each
   * command the OWNER issues is logged with the payload's own frozen
   * facts. FORK (Mandos #54): outside a replay release, any such command
   * marks the life as touched (journal.markTouched), so its graveyard entry
   * says the seed alone will not replay it. The Borg's own line needs no logging: the dossier IS its
   * evidence. #27's phase 3 (the paired demonstration deepening) is DEFERRED
   * by the owner (2026-11-03): this rail keeps its #29 shape. The issue's `event:turn` does not exist in API 2 at this pin (the bus has
   * no turn event), which src/loop/replay.ts documents. The subscription
   * is retired in stop() and on a re-begin, like every handle. */
  if (replayLogHandle !== null && replayLogOff !== null) {
    const held = replayLogHandle;
    replayLogHandle = null;
    await replayLogOff(held).catch(() => undefined);
  }
  replayLogOff = mod.events.off;
  const replayLog = await mod.events.on("player-command", (event) => {
    if (!replayReleased) {
      journal.markTouched();
      return;
    }
    const where = event.dir !== undefined ? ` dir ${String(event.dir)}` : "";
    const args = event.args !== undefined && event.args.handle !== undefined ? ` handle ${String(event.args.handle)}` : "";
    mod.meta.log(`[replay] command ${event.code}${where}${args}`);
  });
  if (replayLog.ok) {
    replayLogHandle = replayLog.value;
  } else {
    mod.meta.log(
      `the Borg cannot log the replayed commands (${replayLog.message}); the release still works, the demonstration log does not`,
    );
  }
  /* Module-level so stop() can retire them even before `running` settles,
   * and retired here the same way the bridge is, so a second start on the
   * same page (a start without a stop) never leaves two loops listening for
   * one report. */
  void restartHandle?.stop();
  restartHandle = restart;
  void journalHandle?.stop();
  journalHandle = journal;
  return { bridge: made, tick: createTick(made, { controller: borg.controller, rewind: borg.rewind, forget, stage: stageWatch, replay: replayWatch, trainer: trainerRail }), restart, journal };
}

const definition: Api2ModDefinition = {
  api: ">=2.0.0 <3.0.0",

  /* The mod's own character creation, under ui:birth.replace: the planned
   * birth (src/class/birth.ts), its class and race drawn from the birth
   * pools at each birth (#16). Flag-gated:
   * without the flag the presenter declines and the game's own birth screens
   * run as before. The engine arrives as a parameter the way ctx.core
   * arrives everywhere else; the pack's own index documents the wiring. */
  birth: (mod) => {
    const core = (mod.engine as { readonly core?: typeof Core } | undefined)?.core;
    if (core === undefined) {
      mod.meta.log("the Borg has no engine here, so the game shows its own character creation");
      return undefined;
    }
    return plannedBirth(mod, core);
  },

  /* The controller installs with onDeath: "end", not upstream's default
   * "reincarnate". Upstream's reincarnation starts the next character in
   * place with a RANDOM race and class and roller stats - exactly what the
   * planned-birth packs exist not to do. "end" runs the ordinary death
   * (tombstone, score entry, run report) and leaves this controller
   * installed until the page reloads, which is the moment our own restart
   * loop takes over: it hears the run report, sets the birth flag, and calls
   * saves.create({ resumeAutoplayer: true }) so the reload lands in birth
   * with the active pack's planned character and this controller armed on
   * it (src/loop/restart.ts owns the protocol and its failure modes). */
  onDeath: "end",

  async start(mod) {
    running = begin(mod).catch((error: unknown) => {
      mod.meta.log(`the Borg could not start: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    });
    await running;
  },

  /* The game tears its mods down before it reloads, and the headless runner registers them again on the same page after a save and reload. The message listener leaves the game here, or the second registration doubles every message. */
  stop() {
    /* Invalidate every start still in flight, synchronously, before any
     * teardown: a begin suspended in its bridge's prime will find its epoch
     * stale at the checkpoint and install nothing, instead of installing a
     * live restart listener into a mod the host has already stopped. */
    startEpoch += 1;
    running = undefined;
    const held = bridge;
    bridge = undefined;
    /* The restart loop's run-report listener leaves with the rest, for the
     * same reason: a re-registration on the same page must not leave two
     * loops listening for one report. Torn down before the bridge (reverse
     * of begin's order); the journal's arrival listener leaves with them,
     * for the same reason again. */
    const loop = restartHandle;
    restartHandle = undefined;
    void loop?.stop();
    const journal = journalHandle;
    journalHandle = undefined;
    void journal?.stop();
    /* The replay demonstration log's subscription leaves with the rest
     * (#29): a re-registration on the same page subscribes again, and a
     * standing one would log every command twice. */
    const replayLog = replayLogHandle;
    const replayOff = replayLogOff;
    replayLogHandle = null;
    replayLogOff = null;
    if (replayLog !== null && replayOff !== null) void replayOff(replayLog).catch(() => undefined);
    void held?.dispose();
  },

  /* Offer to play only when this character was handed to an autoplayer before or was armed from the title row. Returning false is the normal case: the mod is installed and enabled, and this character has never been handed over, so the human keeps the keyboard. */
  armed(context) {
    return context.armed || characterAlreadyAutoplayed(context);
  },

  async controller(mod: ModApi2, input: Api2InputState) {
    const live = await running;
    if (live === undefined || live === null) return;
    await live.tick(mod, input);
  },
};

export default definition;
