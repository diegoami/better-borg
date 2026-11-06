import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { DEFAULT_WINDOW_PROFILE as v2, LEGACY_WINDOW_PROFILE as v1, normalizeOffsets, windowProfile, windowSchedule, missingBoundaryReason } from "./windows.js";
describe("versioned Neo replay windows", () => {
  it("keeps machine-readable profiles aligned and historical offsets explicit", () => {
    for (const [name, profile] of [["v1", v1], ["v2", v2]] as const) {
      const path = new URL(`../../docs/deaths/window-profile-${name}.json`, import.meta.url);
      expect(JSON.parse(readFileSync(path, "utf8")).profile).toEqual(profile);
    }
    expect(v2.offsets).toEqual([5, 12, 25, 40, 60, 82, 105]);
    expect(v1.offsets).toEqual([5, 10, 15, 20]);
    expect(windowProfile("legacy-v1")).toBe(v1);
    expect(windowProfile()).toBe(v2);
  });
  it("records custom offsets under a distinct ID and retains their base boundary policy", () => {
    expect(windowProfile("v2", [12, 5, 12, 0, 1.5])).toMatchObject({
      id: "mandos-death-windows-custom-v1",
      baseProfile: v2.id,
      offsets: [5, 12],
      preStart: "unavailable",
    });
    expect(normalizeOffsets([20, 5, 5])).toEqual([5, 20]);
    expect(() => windowProfile("unknown")).toThrow(/unknown/);
    expect(() => normalizeOffsets([0])).toThrow(/positive/);
  });
  it("keeps pre-start targets unavailable, allowing an exactly-at-start window", () => {
    const schedule = windowSchedule(110, 100, windowProfile("v2", [5, 10, 12, 25]));
    expect(schedule.preStart.map(t => t.offset)).toEqual([25, 12]);
    expect(schedule.take(100)).toEqual([{ offset: 10, targetTurn: 100 }]);
    expect(schedule.remaining()).toEqual([{ offset: 5, targetTurn: 105 }]);
  });
  it("preserves v1's first-boundary behavior for pre-start targets", () => {
    const schedule = windowSchedule(110, 100, windowProfile("legacy-v1"));
    expect(schedule.preStart).toEqual([]);
    expect(schedule.take(100).map(t => t.offset)).toEqual([20, 15, 10]);
  });
  it("coalesces crossed targets at the same observed live boundary without consuming twice", () => {
    const schedule = windowSchedule(200, 100, windowProfile("v2", [5, 12, 25]));
    expect(schedule.take(174)).toEqual([]);
    expect(schedule.take(190).map(t => t.offset)).toEqual([25, 12]);
    expect(schedule.take(190)).toEqual([]);
    expect(schedule.take(199)).toEqual([{ offset: 5, targetTurn: 195 }]);
    expect(schedule.remaining()).toEqual([]);
  });
  it("leaves fatal-crossed or capped windows missed instead of creating postmortem state", () => {
    const schedule = windowSchedule(200, 100, windowProfile("v2", [5, 12, 25]));
    schedule.take(180); // Next command ends the life; no trailing living visit.
    expect(schedule.remaining()).toEqual([{ offset: 12, targetTurn: 188 }, { offset: 5, targetTurn: 195 }]);
  });
  it("describes cap-crossed targets as missing observations, not unpassed turns", () => {
    expect(missingBoundaryReason("cap", 250, 188)).toBe(
      "the replay reached its cap at turn 250 without a subsequent live decision boundary at or after target turn 188",
    );
    expect(missingBoundaryReason("death", 250, 188)).toContain("without a subsequent live decision boundary");
  });
});
