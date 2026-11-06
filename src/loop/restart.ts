/**
 * THE RESTART LOOP: every death, the same planned character again - and,
 * since #25, every ATTAINED STAGE, a kept save and the next one.
 *
 * Ported from neowarrior-borg's src/loop/restart.ts (T04, issue #7 there;
 * hardened by its review rounds #29, #34, #35; shipped in v0.1.0 e1ec1b7)
 * as part of the M2 unification (#15). It is class-agnostic machinery: WHAT
 * gets birthed on the far side of the create is the active strategy pack's
 * business (src/class/), and this loop only owns the protocol that gets
 * there. The issue numbers below are the archived fork's, kept so the review
 * provenance stays readable; its history is the immutable record.
 *
 * WHAT THIS REPLACES. Upstream's host reincarnates an autoplayer itself:
 * `onDeath` defaults to "reincarnate", which starts the next character in
 * place with a RANDOM race and class and roller stats - precisely what the
 * planned-birth packs exist not to do. So plugin.ts installs this mod's
 * controller with `onDeath: "end"` instead: the ordinary death flow runs
 * (tombstone, score entry, run report), and what happens NEXT becomes this
 * loop's business.
 *
 * THE RETIRE PATH (#25, the purpose redirect's first rail): the mod's main
 * job is the grind, so a character that ATTAINS ITS STAGE is retired into a
 * kept, loadable save and the next one starts - the library, beside the
 * graveyard the deaths go to. The trigger is NOT an event the host pushes:
 * attainment is a fact about the live character (level and max first-arrival
 * depth, the sticky facts - src/loop/stage.ts), so the decision tick, which
 * already reads the world every wait, watches for it and calls this loop's
 * `retire()` the moment it turns true. The protocol (`retireAtStage`, ONE
 * implementation the headless driver shares):
 *
 *   attain -> session.save -> find the saved slot -> saves.rename
 *          -> birth flag (verified) -> create({resumeAutoplay: true})
 *
 * THE RETIRE FAIL-SAFE, absolute (#25): a refused save or rename is LOGGED
 * and the run KEEPS PLAYING - never a create without a kept save (that
 * would be the death loop this path exists to avoid), never a retry storm
 * (one retire attempt per page, the same one-shot discipline as the report
 * path's `spent`). A create that is refused after a successful save+rename
 * leaves the kept save standing under its library name, clears the
 * stranded flag, and lets the run play on; its eventual death still runs
 * the ordinary death path below.
 *
 * THE SEAMS the retire path needs beyond the death path's: `session.save`
 * (under the manifest's `session:control`; the host's own game menu rows
 * confirm before these - retirement is unattended BY DESIGN, and the mod's
 * own policy, the stage settings the owner set, is the consent),
 * `saves.list` and `saves.rename` (under `saves:manage`). The slot to
 * rename is FOUND, not guessed: after our own save answers ok, the roster's
 * alive entry whose level and depth match the live facts and whose
 * lastPlayed is greatest is the one just saved (the host stamps it newest,
 * saves-facade.ts) - no match is a refused rename, not a wrong rename. The
 * name fits the host's 1-15 character rule (src/loop/stage.ts builds it; a
 * longer name is refused outright, charsheet.ts:250).
 *
 * THE WHOLE LOOP, AS A PROTOCOL, leg by leg:
 *
 *   death -> onRunEnd -> flag -> create -> reload -> presenter -> armed
 *   controller -> (play) -> death -> ...
 *
 *   1. The character dies while our controller holds the keyboard; the host
 *      runs the ordinary death flow and keeps the controller installed until
 *      the page reloads (`onDeath: "end"`, MOD_SEAMS 4q).
 *   2. The host delivers the run report exactly once, after the score table
 *      is written and before the tombstone. API 2 surfaces it as the
 *      "run-end" event (MOD_SEAMS 4w calls the same seam
 *      `ctx.character.onRunEnd`); this module subscribes at install and owns
 *      the subscription until the mod stops.
 *   3. On a report that says DEATH - and only then - and only while our
 *      controller still holds the keyboard: set the one-shot birth flag in
 *      the install slot (setBirthFlag). The flag is set BEFORE create,
 *      exactly once per create attempt - one birth per reload is the contract
 *      the presenter's arming and this loop's `spent` latch both enforce.
 *   4. Call `create({ resumeAutoplayer: true })` (MOD_SEAMS 4x). NEVER with
 *      `like`: the presenter plans the birth, and `like`'s copy of the dead
 *      character's rolled stats would override the plan.
 *   5. The host reloads the page into character creation with our controller
 *      armed on the result and the character marked autoplayed.
 *   6. The presenter's prepare durably consumes the flag (verified by its
 *      own read-back) and births the active pack's planned character through
 *      the game's own point-buy.
 *   7. The armed controller takes the keyboard without a prompt; plugin.ts's
 *      start runs again on the new page, this loop re-installs, and the chain
 *      continues unattended.
 *
 * EVERY FAILURE MODE, AND WHERE IT LANDS:
 *
 *   - A report still in flight when the loop is stopped (#29): retired by
 *     EPOCH. stop() invalidates synchronously - `stopped` for anything that
 *     enters afterwards, a bumped generation counter for every report the
 *     loop was already running. Each report captures the counter at entry
 *     and re-checks it after every await, before its next side effect: no
 *     flag write, no create, no claim in the log. The ONE deliberate
 *     exception is cleanup: a flag a cancelled report HAD WRITTEN - or had
 *     asked to write without its read-back ever completing (#35: a failed
 *     verification cannot prove the write did not land, and a slot's
 *     refusal is not proof of absence either) - is still durably cleared,
 *     with a loud honest warning kept when even the clear will not verify,
 *     because a standing flag beside a live page is the stranded-flag
 *     hazard whatever retired the loop - and a create
 *     that was already issued still has its OUTCOME handled (ok means the
 *     page is going away; a failure still clears the flag), because
 *     undoing a birth is not an option and abandoning the flag is worse.
 *     A report that was not going to restart anyway (victory, a keyboard
 *     not ours) needs no such care: its continuations only ever read.
 *
 *   - A report that is not a death ("winner" / "retired"): the session ENDS.
 *     Logged, no create. DEFAULT, OWNER-FLIPPABLE: a victorious or retired
 *     character starting the next one would bury the one event a human must
 *      see; an owner who wants the loop to roll on regardless flips the
 *     outcome check below.
 *   - A report with no report body (this front end delivers the payload only
 *     to its own mods): the loop cannot VERIFY a death, so it restarts
 *     nothing and says so loudly. Failing closed here is the same choice as
 *     the presenter's: a victory must not be buried under a restart.
 *   - The keyboard question refused, thrown, or answered "not ours" (a human
 *     was playing, or another autoplayer holds it): nothing is started, no
 *     flag is touched. `create` would be the host's refusal anyway (it is
 *     refused unless our controller holds the keyboard at that moment), so
 *     this guard refuses first, cheaply and loggably.
 *   - The flag would not durably land (the slot refused the write, or the
 *     read-back cannot see it - a slot answers ok to a swallowed write, #25):
 *     NO create. Nothing reloads, nothing is stranded; the loop stalls
 *     visibly with a loud log.
 *   - `create` refused, thrown, or rejected: contained inside this module -
 *     the listener never rejects, so nothing escapes as an unhandled
 *     rejection into the host. THE STRANDED-FLAG HAZARD: the flag was set in
 *     step 3, but the page does NOT reload, so the standing flag would take
 *     the NEXT birth on any LATER reload - a human's - as the presenter's
 *     own. So on every create failure the flag is durably cleared
 *     (clearBirthFlag: read-modify-write, then read back to verify,
 *     the presenter's own standard). If even the clear will not verify, the
 *     log says the flag may still be set and names the consequence; the
 *     presenter's prepare remains the last line (it re-verifies, consumes or
 *     declines loudly, and takes at most one birth).
 *   - `create` answers ok: the page is going away. The presenter consumes
 *     the flag on the next page; there is nothing to undo here.
 *   - A second run report on the same page: ignored (`spent`). One restart
 *     per reload; the host owes one report per page. A retire and a death
 *     each keep their own latch: a refused retire must leave the death path
 *     fully armed for the same page's later death.
 *   - The host gives no roster seam at all (`manage.saves` absent - a
 *     third-party install of this mod, or the event grant refused): the loop
 *     logs at install and the run simply ends at its death. The retire path
 *     needs one seam more (`manage.session`, `session:control`): without it
 *     an attained run plays on, loudly, and the stage grinds nowhere on
 *     that host.
 *
 * Rule 5: no wall clock, no network, no engine reads - the loop is pure
 * orchestration over the host's own calls, and the decision code never sees
 * it.
 */

import type {
  Api2Call,
  Api2CreateCharacter,
  Api2Events,
  Api2RunEndEvent,
  Api2SaveEntry,
  Api2Slot,
  Api2Subscription,
  RunReport,
} from "@rpgm-tools/neo-angband-mod-sdk";
import { BIRTH_FLAG_KEY, clearBirthFlag, setBirthFlag } from "../birth/flag.js";

/** The install slot's get/set half, the same slice the presenter consumes under. */
type Slot = Pick<Api2Slot, "get" | "set">;

/** What the restart loop needs, each piece a slice of ModApi2 plugin.ts hands in. */
export interface BorgRestartDeps {
  /** The mod's install slot (mod.store.install): the birth flag's home. */
  readonly slot: Slot;
  /** The mod's log (mod.meta.log). */
  readonly log: (message: string) => void;
  /**
   * Whether THIS mod's controller holds the keyboard right now
   * (mod.act.controller.owns). Asked live at the report, never assumed from
   * the install: create is refused unless the keyboard is ours at that
   * moment, and the cheap refusal is the one that leaves a log line.
   */
  readonly ownsKeyboard: () => Api2Call<boolean>;
  /**
   * The host's character-creation call (mod.manage?.saves.create), or null
   * when this game gives the mod no roster seam - a third-party install.
   */
  readonly create: ((options?: Api2CreateCharacter) => Api2Call<null>) | null;
  /**
   * The host's save call (mod.manage?.session.save, under the manifest's
   * `session:control`), or null when this game gives the mod no session
   * seam. The retire path's first leg; the death path never needs it.
   */
  readonly save?: (() => Api2Call<null>) | null;
  /**
   * The host's roster read (mod.manage?.saves.list), or null without the
   * seam. The retire path lists the roster AFTER its own save to find the
   * slot it just stamped newest.
   */
  readonly listSaves?: (() => Api2Call<readonly Api2SaveEntry[]>) | null;
  /**
   * The host's roster rename (mod.manage?.saves.rename), or null without
   * the seam. The retire path renames the kept save into its library name
   * (src/loop/stage.ts builds the name inside the host's 15 characters).
   */
  readonly rename?: ((id: string, name: string) => Api2Call<null>) | null;
  /**
   * The event domain (mod.events): the run report arrives as its "run-end"
   * event, needing the manifest's `event:run-end` grant.
   */
  readonly events: Pick<Api2Events, "on" | "off">;
  /**
   * The graveyard writer, the journal's record of the run that just ended
   * (neowarrior's T06, #9). Awaited at the head of the report path - before
   * the outcome checks, before the flag, before create - so the record lands
   * before anything that could tear the page down, a crash in `create`
   * included. Optional because the loop is older than the journal: without
   * it the report path is exactly what T04 shipped. The writer itself never
   * rejects (src/records/journal.ts), and a refusal or throw here is
   * contained the same way a create failure is: the run still restarts, and
   * the log says the record could not be kept.
   */
  readonly graveyard?: (report: RunReport) => Promise<void | boolean>;
  /** Mandos166: refusal/throw must stop reload until the new durable outbox verifies. */
  readonly recordingRequired?: boolean;
}

/** A running restart loop. */
export interface BorgRestart {
  /** Whether the loop is listening for run reports. */
  readonly listening: boolean;
  /**
   * Retire the live character into a kept save and start the next one
   * (#25). Fire-and-forget by design: the caller is the decision tick,
   * which must not await host calls; every failure is contained and logged
   * exactly as the report path's are. ONE attempt per page (a refused leg
   * leaves the run playing; the watcher never asks twice), and the epoch
   * discipline of the report path applies to every await inside.
   *
   * `facts.clvl` and `facts.depth` are the live facts at attainment (the
   * character's level and the depth it stands on - what the just-saved
   * roster entry will carry, and what the log should say);
   * `facts.slotName` is the library name the caller built (src/loop/
   * stage.ts: the caller knows the stage, and the identity the name
   * carries - seed in the harness, lineage counter in the mod).
   */
  retire(facts: { readonly clvl: number; readonly depth: number; readonly slotName: string }): void;
  /**
   * Stop listening. The host tears its mods down before the reload anyway;
   * this is for a mod stop that keeps the page (the headless runner's
   * re-registration, and plugin.ts's own stop).
   */
  retryRecording(): Promise<void>;
  stop(): Promise<void>;
}

const messageOf = (error: unknown): string => (error instanceof Error ? error.message : String(error));

/** Whether the flag is standing in the slot right now. The flag module owns the shape; this reads it. */
async function flagIsDurable(slot: Slot): Promise<boolean> {
  try {
    const read = await slot.get();
    if (!read.ok) return false;
    const value = read.value;
    return value !== null && typeof value === "object" && !Array.isArray(value) &&
      (value as Record<string, unknown>)[BIRTH_FLAG_KEY] === true;
  } catch {
    return false;
  }
}

/**
 * THE STRANDED-FLAG CLEAR, shared by the death path and the retire path: the
 * page is NOT going away, so a standing birth flag must be durably cleared
 * (verified by clearBirthFlag's own read-back) - or, when even the clear
 * will not verify, the log keeps the loud warning that names the
 * consequence, because the hazard is the same whoever failed to start the
 * next character. `aftermath` is the one word the two paths differ on: a
 * death ends the run, a failed retire keeps playing.
 */
async function clearStrandedFlag(
  slot: Slot,
  log: (message: string) => void,
  why: string,
  aftermath: string,
): Promise<void> {
  const cleared = await clearBirthFlag(slot);
  if (cleared) {
    log(`the Borg could not start the next character (${why}); the birth flag was cleared and ${aftermath}`);
    return;
  }
  log(
    `the Borg could not start the next character (${why}) AND could not durably clear its birth flag: ` +
      `the flag may still be set, and the next character created after any later reload would be born as the Borg's ` +
      `planned character. The presenter still consumes-or-declines it on that page, but a human's birth could be taken ` +
      `once - clear the mod's install storage before letting anyone create a character here`,
  );
}

/**
 * THE RETIRE PROTOCOL (#25): save the live character, rename the kept slot
 * into its library name, arm the birth flag, and start the next character -
 * or, at the first leg that refuses, log and answer "refused" so the caller
 * can keep playing. ONE implementation for both callers: the loop's `retire`
 * entry (wired from the decision tick) and the headless driver (the harness
 * models the roster over the same protocol). Never throws and never
 * rejects; `cancelled` is the caller's stop discipline (the loop's epoch;
 * the driver passes nothing), checked before every side effect - a cancelled
 * retire produces no new side effect, and a birth flag it had written (or
 * may have written, #35's lesson) is still durably cleared.
 */
export async function retireAtStage(
  deps: Pick<BorgRestartDeps, "slot" | "log" | "create" | "save" | "listSaves" | "rename">,
  facts: { readonly clvl: number; readonly depth: number; readonly slotName: string },
  cancelled: () => boolean = (): boolean => false,
): Promise<"retired" | "refused"> {
  const dropped = (where: string): void => {
    deps.log(`the Borg's retire was cancelled while it was still ${where}, so it is dropped`);
  };
  const keepPlaying = (what: string, why: string): void => {
    deps.log(`the Borg ${what} (${why}); it keeps playing`);
  };

  const save = deps.save ?? null;
  const listSaves = deps.listSaves ?? null;
  const rename = deps.rename ?? null;
  const create = deps.create;
  if (save === null || listSaves === null || rename === null || create === null) {
    deps.log(
      "the Borg cannot retire a character that attains its stage on this game: it was given no session seam, " +
        "so an attained run keeps playing",
    );
    return "refused";
  }

  /* Leg 1: the save. A refusal, throw or rejection here is the fail-safe's
   * headline case: nothing renamed, nothing created, the run plays on. */
  let saved = false;
  try {
    const result = await save();
    saved = result.ok;
    if (!result.ok) keepPlaying("could not keep a save of the character that attained its stage", result.message);
  } catch (error: unknown) {
    keepPlaying("could not keep a save of the character that attained its stage", messageOf(error));
  }
  if (cancelled()) {
    dropped("saving");
    return "refused";
  }
  if (!saved) return "refused";

  /* Leg 2: find the slot the save just wrote - the roster's ALIVE entry
   * matching the live facts (level and depth) with the greatest lastPlayed
   * (our own save stamped it newest). No match is a refused rename, never a
   * guessed one: renaming a stranger's slot would eat someone else's save. */
  let slotId: string | null = null;
  try {
    const read = await listSaves();
    if (!read.ok) {
      keepPlaying("saved the character that attained its stage but cannot tell which roster slot is its own", read.message);
    } else {
      let best = -1;
      const entries = [...read.value];
      for (let at = 0; at < entries.length; at++) {
        const entry = entries[at]!;
        if (entry.dead) continue;
        if (entry.level !== facts.clvl || entry.depth !== facts.depth) continue;
        if (best === -1 || entry.lastPlayed >= entries[best]!.lastPlayed) best = at;
      }
      if (best === -1) {
        deps.log(
          `the Borg saved the character that attained its stage but the roster carries no matching slot ` +
            `(alive, level ${String(facts.clvl)}, depth ${String(facts.depth)}); it keeps playing`,
        );
      } else {
        slotId = entries[best]!.id;
      }
    }
  } catch (error: unknown) {
    keepPlaying("saved the character that attained its stage but cannot tell which roster slot is its own", messageOf(error));
  }
  if (cancelled()) {
    dropped("looking for the saved slot");
    return "refused";
  }
  if (slotId === null) return "refused";

  /* Leg 3: the library name. The save is KEPT whatever happens here; a
   * refused rename costs the name, not the save. */
  let renamed = false;
  try {
    const result = await rename(slotId, facts.slotName);
    renamed = result.ok;
    if (!result.ok) {
      keepPlaying(`saved the character that attained its stage but could not rename its slot to "${facts.slotName}"`, result.message);
    }
  } catch (error: unknown) {
    keepPlaying(`saved the character that attained its stage but could not rename its slot to "${facts.slotName}"`, messageOf(error));
  }
  if (cancelled()) {
    dropped("renaming the kept slot");
    return "refused";
  }
  if (!renamed) return "refused";
  deps.log(`the Borg kept a save of the character that attained its stage, renamed to "${facts.slotName}" in the library`);

  /* Leg 4: the birth flag, BEFORE create, behind a read-back - the same
   * contract as the death path's (#25's swallowed-write lesson). */
  const written = await setBirthFlag(deps.slot);
  const standing = written && (await flagIsDurable(deps.slot));
  if (cancelled()) {
    /* The stop may have landed anywhere inside the flag work; VERIFIED
     * cleanup runs whenever the flag step was reached (#35), because a
     * standing flag beside a live page strands whoever births next. */
    await clearStrandedFlag(deps.slot, deps.log, "the retire's flag would not outlive the stop", "no next character is started");
    return "refused";
  }
  if (!standing) {
    await clearStrandedFlag(
      deps.slot,
      deps.log,
      written ? "the retire's birth flag would not verify after being written" : "the retire's birth flag's write was refused",
      "the character that attained its stage keeps playing",
    );
    return "refused";
  }

  /* Leg 5: the create. A failure here leaves the kept save standing (a
   * library entry the owner can load), clears the stranded flag, and the
   * run plays on - its eventual death still runs the ordinary death path. */
  try {
    const made = await create({ resumeAutoplayer: true });
    if (made.ok) return "retired";
    await clearStrandedFlag(deps.slot, deps.log, `create was refused: ${made.message}`, "the character that attained its stage keeps playing");
  } catch (error: unknown) {
    await clearStrandedFlag(deps.slot, deps.log, `create threw: ${messageOf(error)}`, "the character that attained its stage keeps playing");
  }
  return "refused";
}

/**
 * Install the loop. Subscribes at once; every decision happens later, inside
 * the report. Never throws and never rejects: a loop that cannot arm says so
 * in the log and leaves the run to end at its death.
 */
export function installBorgRestart(deps: BorgRestartDeps): BorgRestart {
  let subscription: Api2Subscription | null = null;
  /* One restart per page: the report arrives once, and one birth per reload
   * is the contract the presenter's one-shot arming already carries. */
  let spent = false;
  let pendingRecording: Api2RunEndEvent | null = null;
  /* One RETIRE attempt per page (#25): a refused leg leaves the run
   * playing, and the watcher never asks twice - the same one-shot
   * discipline as `spent`, deliberately a SEPARATE latch so a refused
   * retire leaves the death path fully armed for the same page's later
   * death. */
  let retireSpent = false;
  /* THE RETIREMENT EPOCH (#29). `stopped` turns away anything that enters
   * after the stop; the counter invalidates everything already inside. Each
   * report captures it at entry and re-checks after every await, before the
   * next side effect - see the header's failure-mode list. */
  let stopped = false;
  let epoch = 0;

  /* The flag is standing but the page is NOT going away: clear it, verified,
   * and say what happened at full volume either way. The death path's
   * aftermath - the run has ended, so nothing plays on. */
  const stranded = (why: string): Promise<void> =>
    clearStrandedFlag(deps.slot, deps.log, why, "this run ends here rather than loop");

  /** The report path: the only place create is ever called from. */
  const onReport = async (event: Api2RunEndEvent): Promise<void> => {
    if (stopped) return;
    /* This report's epoch: valid only while the loop that received it is
     * still the live one. Every continuation after an await re-checks it
     * BEFORE its next side effect (#29). */
    const mine = epoch;
    const retired = (): boolean => stopped || mine !== epoch;
    const dropped = (where: string): void => {
      deps.log(`the Borg's restart loop was retired while a run report was still in flight (${where}), so the report is dropped`);
    };
    /** Retire a flag a cancelled report may have written, and say which way
     * it landed. Cleanup, deliberately not epoch-gated: a standing flag
     * beside a live page is the stranded-flag hazard whatever retired the
     * loop. Called whenever the report reached the flag step at all (#35) -
     * the clear's own read-back is the only proof of whether the write ever
     * landed, and it says so truthfully in either direction. */
    const retireWrittenFlag = async (): Promise<void> => {
      const cleared = await clearBirthFlag(deps.slot);
      if (cleared) {
        deps.log(
          "the Borg's restart loop was retired while a report's birth flag was written or still unproven; " +
            "the flag was cleared and no next character is started",
        );
        return;
      }
      deps.log(
        "the Borg's restart loop was retired after a report had written - or may have written - the birth flag, AND the flag could not be durably cleared: " +
          "the flag may still be set, and the next character created after any later reload would be born as the Borg's " +
          "planned character. The presenter still consumes-or-declines it on that page, but a human's birth could be taken " +
          "once - clear the mod's install storage before letting anyone create a character here",
      );
    };
    if (spent) {
      deps.log("a second run report reached the Borg on this page; it restarts at most one character per reload, so it ignores this one");
      return;
    }
    spent = true;

    /* The host hands the report only to its own mods on some front ends; a
     * loop that cannot verify a death restarts nothing (see the header). */
    const report = event.report;
    if (report === null) {
      deps.log(
        "the Borg's run ended but this game would not say how (no run report), so it starts no next character: " +
          "a victory or retirement must not be buried under a restart",
      );
      return;
    }

    /* The graveyard entry FIRST, whatever the outcome turns out to be:
     * victory and retirement are runs the journal owes a record of exactly
     * as much as a death is, and the report that just arrived is the only
     * moment the game is telling us how it ended. This await sits ahead of
     * the flag and the create on purpose (a record written after create
     * races the page teardown and can be lost to it); a journal that cannot
     * write says so itself and never blocks the restart, and a throw here is
     * contained like every other seam's. */
    if (deps.recordingRequired && deps.graveyard === undefined) {
      pendingRecording = event;
      deps.log("Mandos terminal recording is required but unavailable; no next character starts.");
      return;
    }
    if (deps.graveyard !== undefined) {
      try {
        const recorded = await deps.graveyard(report);
        if (deps.recordingRequired && recorded !== true) {
          pendingRecording = event;
          deps.log("Mandos could not verify the terminal outbox; no next character starts. Export/import and acknowledge the pending report, or retry recording.");
          return;
        }
      } catch (error: unknown) {
        if (deps.recordingRequired) {
          pendingRecording = event;
          deps.log(`Mandos terminal recording failed (${messageOf(error)}); no next character starts. Retry recording or export the pending report before reloading.`);
          return;
        }
        deps.log(`the Borg could not record the run that just ended (${messageOf(error)}), so it restarts without a journal entry`);
      }
      if (retired()) return dropped("it was still recording the run that ended");
    }

    const diedAt = `on depth ${String(report.maxDepth)} at turn ${String(report.turn)} (${report.cause})`;

    /* DEFAULT, OWNER-FLIPPABLE: victory and retirement END the session. */
    if (report.outcome !== "death") {
      const endedAs = report.outcome === "winner" ? "victory" : "retirement";
      deps.log(
        `the Borg's run ended in ${endedAs} ${diedAt}; the session ends here - no next character is started ` +
          "(an owner who wants the loop to roll on past a victory flips this check in src/loop/restart.ts)",
      );
      return;
    }

    /* Guard 1: only while OUR controller holds the keyboard, asked live. */
    let holds = false;
    try {
      const owned = await deps.ownsKeyboard();
      if (retired()) return dropped("it was still asking who holds the keyboard");
      holds = owned.ok && owned.value === true;
      if (!owned.ok) {
        deps.log(`the Borg could not ask who holds the keyboard (${owned.message}), so it starts no next character`);
      }
    } catch (error: unknown) {
      if (retired()) return dropped("its keyboard question had thrown");
      deps.log(`the Borg could not ask who holds the keyboard (${messageOf(error)}), so it starts no next character`);
    }
    if (!holds) {
      deps.log(`the Borg's character died ${diedAt}, but the Borg was not the one holding the keyboard, so it starts nothing`);
      return;
    }

    if (deps.create === null) {
      deps.log(`the Borg's character died ${diedAt}, but this game gives it no character-creation seam, so the run ends here`);
      return;
    }

    /* The flag, BEFORE create, exactly once - and only behind a read-back:
     * a slot answers ok to a write it swallowed (#25), and reloading into a
     * flag that is not there births nothing at all. Both slot reads here are
     * reads; the writes they precede are what the epoch check below gates. */
    const written = await setBirthFlag(deps.slot);
    const standing = written && (await flagIsDurable(deps.slot));
    if (retired()) {
      /* The stop may have landed anywhere inside the flag work - between
       * the write and this line included - so VERIFIED cleanup runs
       * whenever the flag step was reached at all (#35): `standing ===
       * false` means the read-back failed, NOT that the write did not land,
       * and a slot's refusal is not proof of absence either (#25's lesson,
       * in mirror). A flag a retired report may have written strands
       * exactly like any other, and only the clear's own read-back can
       * prove which way it landed. */
      await retireWrittenFlag();
      return;
    }
    if (!standing) {
      await stranded(written ? "the birth flag would not verify after being written" : "the birth flag's write was refused");
      return;
    }

    /* Guard 2: contain every shape a create failure can take - refusal
     * result, throw, rejection - and clear the stranded flag in each. */
    deps.log(`the Borg's character died ${diedAt}; the Borg is starting the next one`);
    try {
      const made = await deps.create({ resumeAutoplayer: true });
      /* A stop may have landed while create was in flight. The call was
       * issued by the live loop, so its OUTCOME still gets the live
       * handling: ok means the page is going away (the presenter consumes
       * the flag on the next page), a failure still clears the standing
       * flag below. Nothing new is started either way. */
      if (made.ok) return;
      await stranded(`create was refused: ${made.message}`);
    } catch (error: unknown) {
      await stranded(`create threw: ${messageOf(error)}`);
    }
  };

  const subscribed: Promise<void> = deps.events
    .on("run-end", (event) => {
      /* Fire-and-forget by design: the host calls the listener synchronously
       * and must not receive (or swallow) our promise. onReport never
       * rejects; the void makes that the caller's contract too. */
      void onReport(event);
    })
    .then(
      (result) => {
        if (result.ok) {
          subscription = result.value;
        } else {
          deps.log(`the Borg cannot hear how its runs end (${result.message}), so a death ends the session`);
        }
      },
      (error: unknown) => {
        deps.log(`the Borg cannot hear how its runs end (${messageOf(error)}), so a death ends the session`);
      },
    );

  if (deps.create === null) {
    deps.log("the Borg cannot restart its character on this game: it was given no character-creation seam, so a death will end the session");
  }

  return {
    get listening(): boolean {
      return subscription !== null;
    },
    retire(facts) {
      /* Fire-and-forget by design: the caller is the decision tick, which
       * must not await host calls. The epoch discipline applies inside
       * (retireAtStage re-checks before every side effect), and the latch is
       * consumed SYNCHRONOUSLY here, before the first await, so an
       * attainment seen twice starts at most one retire. */
      if (stopped || retireSpent) return;
      retireSpent = true;
      const mine = epoch;
      deps.log(
        `the Borg's character attained its stage (character level ${String(facts.clvl)}, first arrival at depth ` +
          `${String(facts.depth)}); the Borg is keeping a save and starting the next one`,
      );
      void retireAtStage(deps, facts, (): boolean => stopped || mine !== epoch);
    },
    async retryRecording(): Promise<void> {
      if (stopped || pendingRecording === null) return;
      const event = pendingRecording; pendingRecording = null; spent = false;
      await onReport(event);
    },
    async stop(): Promise<void> {
      /* Invalidate FIRST and synchronously (#29): from this moment no
       * continuation of a report this loop was already running may produce
       * a side effect, whether stop's own awaits settle before or after it. */
      stopped = true;
      epoch += 1;
      await subscribed;
      const held = subscription;
      subscription = null;
      if (held !== null) await deps.events.off(held).catch(() => undefined);
    },
  };
}
