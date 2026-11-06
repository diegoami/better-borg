/** FORK: Mandos #99 adopts Neo Borg 74a017d's C-parity corrections.
 * Upstream credit: neostryder; retained Mandos differences are marked locally.
 */
/**
 * One decision, at one input wait.
 *
 * The game calls a mod's controller each time it needs a command, with the
 * wait's token, and the mod answers by submitting intents under it. The Borg's
 * decision code is synchronous and wants the game as a view, so a tick reads the
 * world, asks the decision code for one command, and submits the targets it
 * chose and then the command.
 *
 * The decision code asks "what would this loadout be" in the middle of a ladder,
 * and the game answers that only through a call that takes time. The first pass
 * of a decision gets "no answer yet" and records the questions; the tick reads
 * them in one round and decides again with the answers in hand, until a pass
 * asks nothing new.
 *
 * A tick that has nothing to do, or whose command the game refuses, submits
 * nothing more and the game asks again; a run of either ends the errand so the
 * keyboard goes back to the player instead of looping.
 */

import type { AgentCommand, AgentController } from "@rpgm-tools/neo-angband-core";
import type { Api2InputState, Api2Intent, Api2Prompt, Api2PromptAnswer, ModApi2 } from "@rpgm-tools/neo-angband-mod-sdk";
import type { Bridge } from "./host.js";
import type { World } from "./world.js";
import { createActFacade, intentOf } from "./act.js";
import type { UnsurePoint } from "../uncertainty.js";
import { aimedGrid, createStallWatch, sceneKey, STALLS_BEFORE_RELEASE } from "../loop/stall.js";
import { recallDepthAnswer } from "../controller.js";

/** Consecutive refusals after which the keyboard goes back. */
export const REFUSALS_BEFORE_RELEASE = 25;
/** Most extra passes one decision takes to read the loadout questions it asked. */
export const MAX_EXTRA_PASSES = 6;
/* The stall watch and its thresholds live in src/loop/stall.ts since #56,
 * one copy for the tick and the headless harness; re-exported here for the
 * tick's own callers and tests. */
export { IDLE_BEFORE_RELEASE, STALLS_BEFORE_FORGET, STALLS_BEFORE_RELEASE } from "../loop/stall.js";

export interface Tick {
  (mod: ModApi2, input: Api2InputState): Promise<void>;
}

/** What to say to a prompt the game raised at the Borg's turn. The Borg asks nothing of the player. */
export function promptAnswer(prompt: Api2Prompt, resetRecallDepth = false): Api2PromptAnswer {
  switch (prompt.kind) {
    case "ack":
      return { action: "acknowledge" };
    case "confirm":
      /* Recall uses its queued depth answer (borg-escape.c:63-115). */
      if (prompt.label?.startsWith("Set recall depth")) return resetRecallDepth;
      return true;
    case "quantity":
      return prompt.defaultValue;
    case "text":
      return prompt.defaultValue;
    default:
      return { action: "cancel" };
  }
}

/** The decision code: the Borg's controller and the undo for the counters a decision moves. */
export interface Decider {
  readonly controller: AgentController;
  rewind(): void;
  /** Mandos166: same settled cached view/command, before submission; no policy feedback. */
  observe?(world: World, command: AgentCommand, deliveredMessages: readonly string[], targets: readonly Api2Intent[]): void;
  /** Drop what the Borg's own map believes about one grid, so the next decision treats it as unknown. */
  forget?(x: number, y: number): void;
  /**
   * FORK (Mandos #25), a CHOICE with no C counterpart (4.2.6 has no stage
   * to retire at). THE STAGE WATCH, asked once per wait after the world is read and
   * before any decision is made. `attained` sees the same world the
   * decision would; when it answers true the tick submits NOTHING for this
   * wait - the retire the caller starts owns what happens next - and hands
   * the world to `onAttained`. The WATCHER (not the tick) owns the one-shot
   * latch: attainment is a sticky fact, so a watcher that keeps answering
   * true would stall the game, and a watcher that latches (the wiring's
   * does) lets a failed retire's run keep playing on the next wait.
   */
  readonly stage?: {
    attained(world: World): boolean;
    onAttained(world: World): void;
  };
  /**
   * FORK (Mandos #29), a CHOICE with no C counterpart. THE REPLAY RELEASE,
   * asked after the world is read and BEFORE the
   * stage watch and any decision: when `releaseAt` answers true for this
   * wait's world, the tick releases the keyboard with `banner`'s text as
   * the shown reason (the host displays it in place of the usual line -
   * that shown reason IS the death banner) and submits nothing more, ever:
   * the owner plays the last turns of the dead run. `onReleased` fires once
   * at the release for the wiring that arms the demonstration log. The
   * watcher answers from the turn the world already carries (the
   * `borg.replayReleaseTurn` setting's value, fixed per page); the TICK
   * owns the one-shot latch, exactly as it owns the stage watch's.
   */
  readonly replay?: {
    releaseAt(world: World): boolean;
    banner(world: World): string;
    onReleased?(world: World): void;
  };
  /**
   * FORK (Mandos #27), a CHOICE with no C counterpart. THE TRAINER RAIL
   * (PHASE 1 as scoped by the owner, 2026-11-03): the
   * uncertainty journal. `assess` answers whether the command this wait is
   * about to carry marks the decision unsure (the wiring closes over the
   * Borg's own world model; pure, observation-only); `note` journals the
   * point wherever this page keeps it. The QUESTION half of the issue's
   * phase 2 - pausing at an unsure point to ask a human through a panel -
   * is deferred: no ask, no pause, no panel, and no capability beyond the
   * grind's own.
   */
  readonly trainer?: {
    assess(world: World, command: AgentCommand): UnsurePoint | null;
    note(point: UnsurePoint): void;
  };
}

/** What a command's aim is, for the commands that name a direction. */

export function createTick(bridge: Bridge, borg: Decider): Tick {
  let refusals = 0;
  let announced = false;
  const watch = createStallWatch();
  /* FORK (Mandos #29): the replay's one-shot. Once the release point is reached the tick
   * releases and never submits again - the owner owns the keyboard, and a
   * host that asks anyway gets nothing, not a decision after the hand-over. */
  let released = false;
  return async (mod, input) => {
    bridge.setInput(input);
    if (input.prompt !== null) {
      await mod.act.answer(input.prompt.promptId, promptAnswer(input.prompt, recallDepthAnswer(borg.controller)));
      return;
    }
    if (input.phase !== "play" && input.phase !== "store") return;
    const world = await bridge.readWorld();
    if (world === null) return;

    /* FORK (Mandos #29): the replay release BEFORE the stage watch and any
     * decision. A
     * deliberately armed replay outranks everything the grind would do -
     * the owner asked for these last turns, not for another retire. */
    if (borg.replay !== undefined && !released && borg.replay.releaseAt(world)) {
      released = true;
      const banner = borg.replay.banner(world);
      await mod.act.controller.release(banner);
      borg.replay.onReleased?.(world);
      return;
    }
    if (released) return;

    /* FORK (Mandos #25): the stage watch before any decision. An attained character
     * spends no further decision - the retire protocol owns the next move.
     * The watcher latches, so this asks at most once per page per life. */
    if (borg.stage !== undefined && borg.stage.attained(world)) {
      borg.stage.onAttained(world);
      return;
    }

    const deliveredMessages: string[] = [];
    const decisionView = borg.observe ? { ...world.view, messages: () => { const batch = world.view.messages(); deliveredMessages.push(...batch); return batch; } } : world.view;
    let facade = createActFacade();
    let command = borg.controller(decisionView, facade.act);
    for (let pass = 0; pass < MAX_EXTRA_PASSES && bridge.loadoutsPending(); pass++) {
      if ((await bridge.settleLoadouts()) === 0) break;
      borg.rewind();
      facade = createActFacade();
      command = borg.controller(decisionView, facade.act);
    }
    const targets = facade.take();

    if (command === null) {
      if (watch.observe("", null).stalled !== null) {
        await mod.act.controller.release("The Borg had no command to give.");
      }
      return;
    }

    /* FORK (Mandos #27): the uncertainty journal (phase 1), assessed after the decision is
     * final - the extra passes done - and before anything is submitted: the
     * point describes the command this wait is about to carry, and a decision
     * with no command is a yield, not a choice. Observation-only; the
     * question half of the issue (phase 2) is deferred and nothing hangs off
     * the point but the journal. */
    const unsure = borg.trainer?.assess(world, command) ?? null;
    if (unsure !== null) borg.trainer?.note(unsure);

    /* The same command against the same scene, again and again, is a command the
     * game takes and does nothing with. */
    const step = watch.observe(sceneKey(world.view), command);
    if (step.stalled !== null) {
      await mod.act.controller.release(`The Borg's ${command.code} changed nothing ${String(STALLS_BEFORE_RELEASE)} times running.`);
      return;
    }
    if (step.forget) {
      const aim = aimedGrid(command, world.view.player().grid);
      if (aim !== null && borg.forget !== undefined) {
        borg.forget(aim.x, aim.y);
        mod.meta.log(`the Borg's ${command.code} at ${String(aim.x)},${String(aim.y)} changed nothing, so it forgot what it believed was there`);
      }
    }
    if (!announced) {
      announced = true;
      mod.meta.log("the Borg is playing");
    }

    try { borg.observe?.(world, command, deliveredMessages, targets); } catch (error) { mod.meta.log(`Mandos decision recording failed: ${String(error)}`); }
    let token = input.token;
    for (const target of targets) {
      const result = await mod.act.submit(token, target);
      if (!result.ok) mod.meta.log(`the Borg's target was refused: ${result.message}`);
    }
    if (targets.length > 0) {
      const fresh = await mod.view.input();
      if (fresh.ok) token = fresh.value.token;
    }
    const sent = await mod.act.submit(token, intentOf(command));
    if (sent.ok) {
      refusals = 0;
      return;
    }
    refusals += 1;
    if (refusals === 1 || refusals % 10 === 0) mod.meta.log(`the Borg's ${command.code} was refused: ${sent.message}`);
    if (refusals >= REFUSALS_BEFORE_RELEASE) {
      refusals = 0;
      await mod.act.controller.release("The game kept refusing the Borg's commands.");
    }
  };
}
