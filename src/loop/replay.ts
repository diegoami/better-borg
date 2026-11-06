/**
 * PARKED optional workflow: requires sufficient original captured inputs and
 * matching runtime/controller conditions. A seed alone does not guarantee replay.
 * THE REPLAY MODE (#29, the optional human path): drive to the rung, then
 * hand the owner the keyboard with the death banner.
 *
 * The trainer's human half. The owner picks a dead run's dossier (the
 * harness tool wrote the ladder under the run's record directory), opens the
 * lab build on that seed (`?seed=<S>&new`), births the recorded character
 * (the title row; the dossier's provenance names the race settings to pin),
 * and the Borg plays - deterministically, the same run again - until the
 * game's turn counter reaches the rung. There the controller RELEASES the
 * keyboard with the banner that says what is coming, and the owner plays
 * the last N turns themselves.
 *
 * THE MECHANISM IS THE ENGINE'S OWN (no new seam, verified against the
 * API at pin 1.23.0-beta.1): `controller.release(reason)` hands the keyboard
 * back and the host SHOWS the reason in place of the usual line - that shown
 * reason IS the banner. From that moment every key the owner presses is
 * theirs by the host's own rules (any unclaimed key hands back,
 * neo-angband#334's semantics; Escape and Ctrl-Z always did). The mod
 * issues no further commands after the release.
 *
 * WHAT THE MOD CANNOT KNOW, and the settings that carry it: a mod cannot
 * read the game's master seed (verified 2026-11-03, scope 1 of the issue;
 * the upstream ask is neo-angband#431), so it cannot look a death turn up
 * from a seed - the OWNER reads both numbers off the dossier's rung line
 * and sets them:
 *
 *   borg.replayReleaseTurn  the release boundary turn (the dossier's
 *                           "release boundary: turn <n>" line)
 *   borg.replayDeathTurn    the recorded death turn (for the banner's
 *                           countdown; 0 leaves it unnamed)
 *
 * Both 0 (the defaults) keep the replay mode off - the ordinary grind is
 * untouched. Read once per page (the stage settings' lifetime, rule 5): a
 * replay is armed before the character is birthed, never mid-life.
 *
 * THE DEMONSTRATION LOG rides the release: from the release on, every
 * `player-command` event is logged (the engine emits it per command taken,
 * the web shell's main.ts builds the payload; the manifest's
 * `event:player-command` grant is the one capability line this adds - the
 * issue asked for `event:turn`, which does not exist in API 2 at this pin:
 * the bus has no turn event, and an `on("turn")` is refused as
 * unknown). The minimal log records the commands the owner issues from the
 * rung; #27's phase 3 deepens it into paired state snapshots. The borg's
 * own line needs no logging - the dossier IS the borg's evidence.
 */

import type { PackSetting } from "@rpgm-tools/neo-angband-mod-sdk";

/**
 * The turn the autoplayer releases at. 0 (the default) keeps the replay mode
 * off: nothing about the ordinary grind changes unless the owner arms a
 * replay deliberately.
 */
export const REPLAY_RELEASE_SETTING: PackSetting = {
  id: "borg.replayReleaseTurn",
  title: "Death replay release turn",
  description:
    "Parked optional replay release point. Requires sufficient original captured birth inputs and compatible runtime/controller data; a seed alone does not guarantee reproduction. At this game turn the Borg hands back the keyboard. Default 0 keeps this feature off; read once per page.",
  min: 0,
  max: 1000000,
  step: 1,
  default: 0,
};

/** The recorded death turn, for the banner's countdown; 0 leaves it unnamed. */
export const REPLAY_DEATH_SETTING: PackSetting = {
  id: "borg.replayDeathTurn",
  title: "Death replay death turn",
  description:
    "The recorded death turn the death-replay banner counts down from (#29): with borg.replayReleaseTurn armed, the banner names this turn and how many turns remain. Take it from the dossier's recorded-death line; 0 (the default) shows the banner without the countdown. Read once per page with borg.replayReleaseTurn.",
  min: 0,
  max: 1000000,
  step: 1,
  default: 0,
};

/** One resolved replay mode: the two settings after their declared ranges. */
export interface ReplayMode {
  /** The release boundary turn; 0 = the replay mode is off. */
  readonly release: number;
  /** The recorded death turn; 0 = unnamed. */
  readonly death: number;
}

/**
 * Resolve the stored pair into their declared ranges, snapped to their
 * steps - the SDK's own `resolveSettingValue` mirrored (the plugin bundle
 * may import that package for types only; see src/loop/stage.ts for the
 * same mirror and its rationale, and src/class/warrior/settings.ts for the
 * convention's origin). Missing or unusable values resolve to the declared
 * defaults, so the replay mode is OFF until both a value landed and it is
 * positive.
 */
export function replayModeOf(stored: { readonly release?: unknown; readonly death?: unknown }): ReplayMode {
  return {
    release: replayValue(REPLAY_RELEASE_SETTING, stored.release),
    death: replayValue(REPLAY_DEATH_SETTING, stored.death),
  };
}

/** The mirror itself: clamp by the declared min/max, snap to the step, default when unusable. */
function replayValue(setting: PackSetting, stored: unknown): number {
  const raw = typeof stored === "number" && Number.isFinite(stored) ? stored : setting.default;
  const clamped = Math.min(setting.max, Math.max(setting.min, raw));
  let snapped = setting.min + Math.round((clamped - setting.min) / setting.step) * setting.step;
  if (snapped > setting.max) snapped -= setting.step;
  const places = Math.max(decimalsOf(setting.min), decimalsOf(setting.step));
  return Number(snapped.toFixed(places));
}

/** How many digits a number carries after its point - the SDK's own helper. */
function decimalsOf(value: number): number {
  const text = String(value);
  const point = text.indexOf(".");
  return point === -1 ? 0 : text.length - point - 1;
}

/**
 * The banner the release shows (the host displays `release`'s reason in
 * place of the usual line). Pure text from the resolved settings: the same
 * mode always shows the same banner.
 */
export function replayBanner(mode: ReplayMode): string {
  if (mode.death > 0 && mode.death > mode.release) {
    return `Death replay: the recorded character died at turn ${String(mode.death)} - the keyboard is yours for the last ${String(mode.death - mode.release)} turns.`;
  }
  if (mode.death > 0) {
    return `Death replay: the release turn ${String(mode.release)} is reached (the recorded death turn ${String(mode.death)} is not after it - check borg.replayReleaseTurn) - the keyboard is yours.`;
  }
  return `Death replay: the release turn ${String(mode.release)} is reached - the keyboard is yours.`;
}
