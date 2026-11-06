/** FORK Mandos166: versioned observation windows, not gameplay or native-C timing. */
export interface WindowProfile {
  readonly id: string;
  readonly baseProfile: string;
  readonly units: "neo-core-game-turns";
  readonly boundary: "first-live-decision-at-or-after-target";
  readonly preStart: "unavailable" | "legacy-first-boundary";
  readonly offsets: readonly number[];
  readonly earlierAnchors: "separate-labelled-events-not-captured-by-this-profile";
}
const common = {
  units: "neo-core-game-turns",
  boundary: "first-live-decision-at-or-after-target",
  earlierAnchors: "separate-labelled-events-not-captured-by-this-profile",
} as const;
export const LEGACY_WINDOW_PROFILE: WindowProfile = Object.freeze({
  ...common,
  id: "mandos-death-windows-v1",
  baseProfile: "mandos-death-windows-v1",
  offsets: Object.freeze([5, 10, 15, 20]),
  preStart: "legacy-first-boundary",
});
export const DEFAULT_WINDOW_PROFILE: WindowProfile = Object.freeze({
  ...common,
  id: "mandos-death-windows-v2",
  baseProfile: "mandos-death-windows-v2",
  offsets: Object.freeze([5, 12, 25, 40, 60, 82, 105]),
  preStart: "unavailable",
});
export function normalizeOffsets(offsets: readonly number[]): number[] {
  const clean = [...new Set(offsets.filter(n => Number.isInteger(n) && n > 0))].sort((a, b) => a - b);
  if (!clean.length) throw new Error("the replay ladder needs at least one positive whole-number offset");
  return clean;
}
export function windowProfile(name = "v2", offsets?: readonly number[]): WindowProfile {
  const base = name === "v2" || name === DEFAULT_WINDOW_PROFILE.id ? DEFAULT_WINDOW_PROFILE
    : name === "legacy-v1" || name === LEGACY_WINDOW_PROFILE.id ? LEGACY_WINDOW_PROFILE : null;
  if (!base) throw new Error(`unknown replay window profile: ${name}`);
  if (offsets === undefined) return base;
  return Object.freeze({
    ...base,
    id: "mandos-death-windows-custom-v1",
    baseProfile: base.id,
    offsets: Object.freeze(normalizeOffsets(offsets)),
  });
}
export interface WindowTarget {
  readonly offset: number;
  readonly targetTurn: number;
}
/** One consuming schedule over the existing live visit hook; no synthetic/trailing visit. */
export function windowSchedule(deathTurn: number, startTurn: number, profile: WindowProfile) {
  const targets = profile.offsets
    .map(offset => ({ offset, targetTurn: deathTurn - offset }))
    .sort((a, b) => a.targetTurn - b.targetTurn);
  const preStart = profile.preStart === "unavailable" ? targets.filter(t => t.targetTurn < startTurn) : [];
  const pending = targets.filter(t => !preStart.includes(t));
  let index = 0;
  return {
    preStart,
    take(turn: number): WindowTarget[] {
      const due: WindowTarget[] = [];
      while (index < pending.length && turn >= pending[index]!.targetTurn) {
        due.push(pending[index++]!);
      }
      return due;
    },
    remaining: (): readonly WindowTarget[] => pending.slice(index),
  };
}

/** Missing observation is not a claim that the final command stopped before its target. */
export function missingBoundaryReason(end: "death" | "stall" | "cap", turn: number, target: number): string {
  const label = end === "death" ? "died" : end === "stall" ? "stalled" : "reached its cap";
  return `the replay ${label} at turn ${String(turn)} without a subsequent live decision boundary at or after target turn ${String(target)}`;
}
