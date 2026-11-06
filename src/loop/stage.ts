/**
 * PARKED optional stage workflow. Automatic retirement is disabled unless
 * mandos.stageRetirement is explicitly enabled; historical design below is retained.
 * THE STAGE: the rung a lineage grinds toward (#25 - the purpose redirect's
 * first rail).
 *
 * The owner redirected the mod's purpose on 2026-11-03: the borg's main job
 * is the GRIND - it plays unattended, and when a run reaches a chosen stage
 * it keeps a save of that run and starts the next character. The lineage
 * iterates until the stage is reached RELIABLY, and reach-rate over a fixed
 * seed cohort - not deepest depth - is the project's number (rule 1).
 *
 * A stage is TWO thresholds, each a persisted numeric setting in the
 * established shape (`borg.stageClvl` x `borg.stageDepth`):
 *
 *   attained  <=>  character level >= borg.stageClvl
 *                  AND a first arrival at depth >= borg.stageDepth
 *
 * THE PREDICATE'S FACTS ARE STICKY, by construction: character level never
 * decreases, and `maxDepth` - the deepest level the character has stood on,
 * the same first-arrival fact the journal's milestones record
 * (src/records/journal.ts) - never decreases either. So the check needs no
 * memory of its own and no journal read: the world snapshot the tick already
 * holds answers it, and a run that once attained still attains at any later
 * decision, whatever depth it stands on now. "First-arrival depth" is
 * exactly this: a depth the character ARRIVED on, recorded as a maximum.
 *
 * NEXT-BIRTH SEMANTICS (rule 5: no mid-life policy shifts): the settings are
 * read once per page, at the same moment the birth pools are read, and the
 * resolved stage serves every decision of the character that page plays. A
 * stage change applies to the NEXT birth, never to a life in flight - a
 * mid-run retarget would be the mod moving its own goalposts.
 *
 * THE DEFAULTS ARE CALIBRATED, not guessed: the stage baseline
 * (docs/runs/2026-11-03-stage-baseline/) measured today's borg on the
 * standard seed grid and found the frontier at character level 2, depth 1
 * (attained by half the grid; one rung deeper, 0%). The owner's destination
 * - roughly character level 20 at moderate depth, "reachable in a watched
 * evening" - is where the strength work (B03 onward, upstream PR #429) is
 * headed; the settings are how the target climbs as it lands. See
 * SETTINGS.md.
 *
 * THE LIBRARY NAME is what the retire flow renames the kept save to:
 * `M s<seed> <stage>`. The host's rename seam accepts 1 to 15 characters
 * (neo-angband's `acceptedCharacterName`, charsheet.ts:250) - the owner's
 * fuller "Mandos <stage> CLVL<n> seed<n> <date>" shape cannot fit, so the
 * name carries the ladder's two keys (the seed - #26 maps its per-seed
 * cohorts by it - and the stage) under a one-letter marker, and the roster's
 * own lastPlayed column is the date. A mod cannot know the game seed (no
 * host seam carries it), so the mod-side name carries the install slot's
 * lineage counter instead - the knowable per-character identity; the
 * harness, which owns the seed, names by the seed. Deterministic either way:
 * no clock, no RNG, pure functions of their inputs (rule 5).
 */

import type { PackSetting } from "@rpgm-tools/neo-angband-mod-sdk";

export const STAGE_RETIREMENT_FLAG = "mandos.stageRetirement";

/** The character-level threshold: "reached at least this level". */
export const STAGE_CLVL_SETTING: PackSetting = {
  id: "borg.stageClvl",
  title: "Stage character level",
  description:
    "Parked optional benchmark threshold, used only when mandos.stageRetirement is explicitly enabled. Together with borg.stageDepth it selects when to save and retire a character. The historical default 2 is retained; normal play does not retire at this threshold. Read once per page for the next birth.",
  min: 0,
  max: 50,
  step: 1,
  default: 2,
};

/** The depth threshold: "made a first arrival at least this deep". */
export const STAGE_DEPTH_SETTING: PackSetting = {
  id: "borg.stageDepth",
  title: "Stage depth",
  description:
    "Parked optional benchmark depth, used only when mandos.stageRetirement is explicitly enabled. Together with borg.stageClvl it selects when to save and retire a character. The historical default 1 is retained; normal play continues past it. Read once per page for the next birth.",
  min: 0,
  max: 100,
  step: 1,
  default: 1,
};

/** One resolved stage: the two thresholds a run is measured against. */
export interface StageDefinition {
  /** Character level at least this. */
  readonly clvl: number;
  /** First arrival at depth at least this (0 is the town). */
  readonly depth: number;
}

/** The sticky facts the predicate reads: both maxima, never where anyone stands now. */
export interface StageFacts {
  /** The character's level. */
  readonly clvl: number;
  /** The deepest depth the character has stood on (the max first arrival). */
  readonly maxDepth: number;
}

/**
 * Pull both stored values into their declared ranges, snapped to their steps
 * - the SDK's own `resolveSettingValue` mirrored (the plugin bundle may
 * import that package for types only; see warrior/settings.ts for the same
 * mirror and its rationale). Missing or unusable values resolve to the
 * declared defaults, so a host that carries no stored stage plays the
 * calibrated default.
 */
export function stageOf(stored: { readonly clvl?: unknown; readonly depth?: unknown }): StageDefinition {
  return { clvl: stageValue(STAGE_CLVL_SETTING, stored.clvl), depth: stageValue(STAGE_DEPTH_SETTING, stored.depth) };
}

/** The mirror itself: clamp by the declared min/max, snap to the step, default when unusable. */
function stageValue(setting: PackSetting, stored: unknown): number {
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
 * Whether the facts attain the stage. Pure and memoryless: the facts are
 * maxima, so the same stage and the same facts always answer the same, at
 * any decision, in any order the facts arrived in.
 */
export function stageAttained(stage: StageDefinition, facts: StageFacts): boolean {
  return facts.clvl >= stage.clvl && facts.maxDepth >= stage.depth;
}

/** The stage's compact label, e.g. `c2d1` - the thresholds, not a sequence number. */
export function stageLabel(stage: StageDefinition): string {
  return `c${String(stage.clvl)}d${String(stage.depth)}`;
}

/**
 * The longest name the host's rename seam accepts (neo-angband's
 * acceptedCharacterName refuses anything longer, charsheet.ts:250) - and a
 * refused rename must never be the thing that ends a run, so every name
 * this module builds fits it.
 */
export const STAGE_NAME_LIMIT = 15;

/**
 * The library name a retired run's save takes: `M s<seed> <stage>` when the
 * caller knows the game seed (the harness does; the ladder's per-seed
 * cohorts are mapped by it, #26), `M n<lineage> <stage>` when it knows only
 * the install slot's birth counter (the mod - no host seam carries the
 * seed), `M <stage>` when it knows neither. The leading M marks the library
 * in the picker: graveyard for failures, library for successes.
 *
 * Degradation is deterministic and ranked: the identity outranks the stage
 * (a stage can be re-derived from a save; a seed cannot), and a pathological
 * identity that still cannot fit is truncated at the limit rather than
 * refused - a name that is merely shorter beats a retire that never lands.
 */
export function librarySlotName(
  stage: StageDefinition,
  identity: { readonly seed?: number | null; readonly lineage?: number | null },
): string {
  const label = stageLabel(stage);
  const tag = identity.seed !== undefined && identity.seed !== null
    ? `s${String(identity.seed)}`
    : identity.lineage !== undefined && identity.lineage !== null
      ? `n${String(identity.lineage)}`
      : null;
  const full = tag === null ? `M ${label}` : `M ${tag} ${label}`;
  if (full.length <= STAGE_NAME_LIMIT) return full;
  const identityOnly = tag === null ? `M ${label}` : `M ${tag}`;
  return identityOnly.length <= STAGE_NAME_LIMIT ? identityOnly : identityOnly.slice(0, STAGE_NAME_LIMIT);
}
