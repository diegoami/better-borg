import { afterEach, describe, expect, it, vi } from "vitest";
import type { Api2Slot, JsonValue, RunReport } from "@rpgm-tools/neo-angband-mod-sdk";
import { archiveFinishedRun, graveyardArchiveOf, GRAVEYARD_KEY } from "./journal.js";
import { mutateInstall } from "./install-mutation.js";
import { bumpLineage } from "../class/warrior/lineage.js";
import { BIRTH_FLAG_KEY, setBirthFlag, clearBirthFlag } from "../birth/flag.js";
import { installMemory } from "../../title.js";
function memory(initial: JsonValue | null = null) {
  let value = structuredClone(initial);
  const get = vi.fn(async () => ({ ok: true as const, value: structuredClone(value) }));
  const set = vi.fn(async (next: JsonValue | null) => { value = structuredClone(next); return { ok: true as const, value: null }; });
  return { slot: { get, set } satisfies Api2Slot, read: () => structuredClone(value) };
}
const report = (key: string) => ({ key, outcome: "death", cause: "synthetic control", turn: 1, maxDepth: 1 }) as RunReport;
const archives = (value: JsonValue | null) => graveyardArchiveOf((value as Record<string, JsonValue>)[GRAVEYARD_KEY] ?? null).runs.map(r => r.run).sort();
afterEach(() => { vi.unstubAllGlobals(); });
describe("cooperating install metadata mutations", () => {
  it("preserves independent archive/counter updates and unknown siblings in the Node realm", async () => {
    const state = memory({ lineage: 7, profileIds: ["p1"], foreign: { retain: true } });
    expect(await Promise.all([
      archiveFinishedRun({ archive: state.slot, log: () => {} }, report("cedar")),
      bumpLineage(state.slot),
      archiveFinishedRun({ archive: state.slot, log: () => {} }, report("birch")),
      bumpLineage(state.slot),
    ])).toEqual([true, true, true, true]);
    expect(archives(state.read())).toEqual(["birch", "cedar"]);
    expect(state.read()).toMatchObject({ lineage: 9, profileIds: ["p1"], foreign: { retain: true } });
  });
  it("initializes an empty slot, deduplicates reports and keeps mixed flag/title siblings", async () => {
    const state = memory();
    await Promise.all([
      archiveFinishedRun({ archive: state.slot, log: () => {} }, report("cedar")),
      bumpLineage(state.slot), setBirthFlag(state.slot), installMemory(state.slot).write(["p1"]),
    ]);
    expect(state.read()).toMatchObject({ lineage: 1, profileIds: ["p1"], [BIRTH_FLAG_KEY]: true });
    expect(archives(state.read())).toEqual(["cedar"]);
    await Promise.all([
      archiveFinishedRun({ archive: state.slot, log: () => {} }, report("cedar")),
      bumpLineage(state.slot), clearBirthFlag(state.slot), installMemory(state.slot).write(["p2"]),
    ]);
    expect(state.read()).toMatchObject({ lineage: 2, profileIds: ["p2"] });
    expect(state.read()).not.toHaveProperty(BIRTH_FLAG_KEY);
    expect(archives(state.read())).toEqual(["cedar"]);
  });
  it.each(["read-refusal", "read-throw", "reduce-throw", "write-refusal", "write-throw", "verify-refusal"])(
    "releases the queue after %s and lets the next writer proceed", async kind => {
      const state = memory({ lineage: 7 });
      const slot: Api2Slot = {
        get: async () => {
          if (kind === "read-refusal" || kind === "verify-refusal") return { ok: false, reason: "unavailable", message: "read refused" };
          if (kind === "read-throw") throw Error("read exploded");
          return state.slot.get();
        },
        set: async next => {
          if (kind === "write-refusal") return { ok: false, reason: "unavailable", message: "write refused" };
          if (kind === "write-throw") throw Error("write exploded");
          return state.slot.set(next);
        },
      };
      let reads = 0;
      if (kind === "verify-refusal") slot.get = async () => ++reads === 1 ? state.slot.get() : { ok: false, reason: "unavailable", message: "verify refused" };
      const result = await mutateInstall(slot, value => {
        if (kind === "reduce-throw") throw Error("reduce exploded");
        return { write: true, next: value, result: true };
      }, { accepts: () => true, message: "verify" });
      expect(result.ok).toBe(false);
      expect(await bumpLineage(state.slot)).toBe(true);
      expect(state.read()).toEqual({ lineage: 8 });
    },
  );
  it.each(["refused", "thrown"])("flag/title writers do not erase unreadable siblings after a %s read", async mode => {
    const initial = { lineage: 7, profileIds: ["old"], foreign: { retain: true } };
    const state = memory(initial);
    const unreadable: Api2Slot = {
      get: async () => {
        if (mode === "thrown") throw Error("read unavailable");
        return { ok: false, reason: "unavailable", message: "read unavailable" };
      },
      set: state.slot.set,
    };
    expect(await setBirthFlag(unreadable)).toBe(false);
    const logs: string[] = [];
    const title = installMemory(unreadable, m => logs.push(m));
    await title.write(["new"]);
    expect(await title.read()).toEqual(["new"]); // Existing session-only fallback remains.
    expect(logs.join(" ")).toContain("could not persist");
    expect(state.slot.set).not.toHaveBeenCalled();
    expect(state.read()).toEqual(initial);
  });
  it.each(["denied-lock", "refused-write"])("title memory makes no false fallback claim after %s with a readable old list", async mode => {
    const initial = { lineage: 7, profileIds: ["old"], foreign: { retain: true } };
    const state = memory(initial);
    let slot: Api2Slot = state.slot;
    if (mode === "denied-lock") {
      vi.stubGlobal("window", {});
      vi.stubGlobal("navigator", { locks: { request: async () => { throw Error("denied"); } } });
    } else {
      slot = { get: state.slot.get, set: async () => ({ ok: false, reason: "unavailable", message: "write refused" }) };
    }
    const logs: string[] = [];
    const title = installMemory(slot, message => logs.push(message));
    await title.write(["new"]);
    expect(await title.read()).toEqual(["old"]); // Preserve readable persisted-list preference.
    expect(logs.join(" ")).toContain("could not persist");
    expect(logs.join(" ")).not.toContain("kept for this session only");
    expect(state.read()).toEqual(initial);
  });
  it("keeps read refusal ahead of malformed report reduction and never writes", async () => {
    const state = memory({ foreign: "keep" });
    const unreadable: Api2Slot = {
      get: async () => ({ ok: false, reason: "unavailable", message: "read refused" }),
      set: state.slot.set,
    };
    const logs: string[] = [];
    await expect(archiveFinishedRun({ archive: unreadable, log: m => logs.push(m) }, null as unknown as RunReport)).resolves.toBe(false);
    expect(logs.join(" ")).toContain("could not read");
    expect(state.slot.set).not.toHaveBeenCalled();
  });
  it("prefers browser coordination even when Node-like process globals exist", async () => {
    const state = memory({ lineage: 7 });
    vi.stubGlobal("window", {});
    vi.stubGlobal("navigator", {});
    const logged: string[] = [];
    expect(await bumpLineage(state.slot)).toBe(false);
    expect(await archiveFinishedRun({ archive: state.slot, log: m => logged.push(m) }, report("cedar"))).toBe(false);
    await installMemory(state.slot, m => logged.push(m)).write(["p1"]);
    expect(logged.join(" ")).toContain("Web Locks unavailable");
    expect(state.slot.get).not.toHaveBeenCalled(); expect(state.slot.set).not.toHaveBeenCalled();
    expect(state.read()).toEqual({ lineage: 7 });
  });
  it("does not write on a denied browser lock and succeeds after the provider recovers", async () => {
    const state = memory({ lineage: 7 });
    vi.stubGlobal("window", {});
    vi.stubGlobal("navigator", { locks: { request: async () => { throw Error("denied"); } } });
    expect(await bumpLineage(state.slot)).toBe(false); expect(state.slot.get).not.toHaveBeenCalled();
    let acquired = 0;
    vi.stubGlobal("navigator", { locks: { request: async (_name: string, _options: unknown, work: () => Promise<unknown>) => { acquired++; return work(); } } });
    expect(await bumpLineage(state.slot)).toBe(true); expect(acquired).toBe(1); expect(state.read()).toEqual({ lineage: 8 });
  });
  it("does not infer browser semantics from Node26's native locks property", async () => {
    const request = vi.fn(async () => { throw Error("Node native locks are not the browser fallback"); });
    vi.stubGlobal("navigator", { locks: { request } });
    const state = memory({ lineage: 7 });
    expect(await Promise.all([bumpLineage(state.slot), bumpLineage(state.slot)])).toEqual([true, true]);
    expect(state.read()).toEqual({ lineage: 9 }); expect(request).not.toHaveBeenCalled();
  });
});
