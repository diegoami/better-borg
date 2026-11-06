import { describe, expect, it } from "vitest";
import { makeScenarioView } from "../harness.js";
import { decisionFrame } from "./live-deaths.js";
import { createHash } from "node:crypto";
import type { Api2KeyValueStore, JsonValue, RunReport } from "@rpgm-tools/neo-angband-mod-sdk";
import { createLiveRecorder, packetHash, packetText, ACK_FORMAT, LIVE_PREFIX } from "./live-deaths.js";
function report(key = "cedar", outcome: RunReport["outcome"] = "death"): RunReport {
  return { outcome, cause: "a novice mage", key, name: "PRIVATE NAME", race: "Half-Troll", cls: "Warrior", level: 3, maxLevel: 4, maxDepth: 4, depth: 4, gold: 12, turn: 340, score: 56, scored: true, endedAt: 0, history: [], messages: [], belongings: [], sheet: null, birth: { race: "Half-Troll", cls: "Warrior", name: "PRIVATE NAME", stats: [18, 10, 10, 10, 17] } };
}
function storage() {
  const data = new Map<string, JsonValue>(); let swallowed = false, quota = false;
  const api: Api2KeyValueStore = {
    get: async k => ({ ok: true, value: structuredClone(data.get(k) ?? null) }),
    keys: async () => ({ ok: true, value: [...data.keys()] }),
    set: async (k, v) => { if (quota) throw new Error("quota"); if (!swallowed) { if (v === null) data.delete(k); else data.set(k, structuredClone(v)); } return { ok: true, value: null }; },
  };
  return { data, api, swallow: (v: boolean) => { swallowed = v; }, quota: (v: boolean) => { quota = v; } };
}
const source = () => ({ mod: "mandos", engine: "beta.2", api: "2.0.0", codeDigest: null, flags: {}, settings: {} });
const recorder = (s: ReturnType<typeof storage>) => createLiveRecorder({ store: s.api, source, log: () => {}, sessionId: "public-test" });
describe("Mandos live terminal outbox", () => {
  it("seals known pre-decision facts before terminal revelation without draining messages", async () => {
    const s = storage(), r = recorder(s);
    const unknown = { handle: 1, label: "a cloudy potion", number: 1, aware: false, unknownRunes: true };
    const base = makeScenarioView(); let reads = 0;
    const view = { ...base, inventory: () => [unknown] as unknown as ReturnType<typeof base.inventory>, messages: () => { reads++; throw new Error("Recorder must never drain the feed"); } };
    const frame = decisionFrame(view, { code: "hold" }, false, ["already delivered to controller"]);
    r.observe(frame); unknown.label = "Potion of Poison"; unknown.aware = true; unknown.unknownRunes = false;
    const terminal = { ...report(), belongings: [{ name: "Potion of Poison", color: "white", location: "pack" as const, quantity: 1, recall: null }] };
    expect(await r.capture(terminal)).toBe(true); terminal.belongings[0]!.name = "later mutation";
    const entry = (await r.entries())[0]!;
    expect(packetText(entry.packet.capture.frames)).toContain("a cloudy potion"); expect(packetText(entry.packet.capture.frames)).not.toContain("Potion of Poison");
    expect(packetText(entry.packet.terminal)).toContain("Potion of Poison"); expect(packetText(entry)).not.toContain("later mutation"); expect(reads).toBe(0);
  });
  it("browser canonical SHA-256 matches Node and excludes player identity/sheet", async () => {
    const s = storage(), r = recorder(s); expect(await r.capture(report())).toBe(true);
    const e = (await r.entries())[0]!;
    expect(await packetHash(e.packet)).toBe(createHash("sha256").update(packetText(e.packet)).digest("hex"));
    expect(packetText(e)).not.toContain("PRIVATE NAME"); expect(e.packet.capture.gaps).toContain("exact-code-digest-unavailable");
  });
  it("survives a fresh recorder and deduplicates report redelivery without replacing the first tail", async () => {
    const s = storage(), r = recorder(s); await r.capture(report()); const first = packetText(await r.entries());
    const fresh = recorder(s); expect(await fresh.capture(report())).toBe(true); expect(packetText(await fresh.entries())).toBe(first);
  });
  it("preserves conflicting existing report and makes failure visible", async () => {
    const s = storage(), r = recorder(s); await r.capture(report()); const original = structuredClone([...s.data]);
    const old = (await r.entries())[0]!;
    expect(await r.capture({ ...report(), turn: 341 })).toBe(false); expect([...s.data]).toEqual(original); expect(r.failure).toMatch(/conflict/);
    await expect(r.acknowledge(packetText({ schema: ACK_FORMAT, entries: [{ id: old.id, packetSha256: old.sha256, corpusReceiptSha256: "1".repeat(64) }] }))).rejects.toThrow(/conflicting unrecorded/);
    expect([...s.data]).toEqual(original);
  });
  it.each(["swallowed", "quota"])("halts on %s storage and exports volatile report; retry verifies it", async mode => {
    const s = storage(), r = recorder(s); if (mode === "quota") s.quota(true); else s.swallow(true);
    expect(await r.capture(report())).toBe(false); expect(r.failure).not.toBeNull(); expect(await r.entries()).toHaveLength(1); expect(s.data.size).toBe(0);
    s.quota(false); s.swallow(false); expect(await r.retry()).toBe(true); expect(s.data.size).toBe(1);
  });
  it.each(["refused", "malformed"])("ACK cannot delete a stored conflict after a %s read", async mode => {
    const s = storage(), r = recorder(s); s.data.set("legacy-control", { untouched: true });
    await r.capture(report()); expect(await r.capture({ ...report(), turn: 341 })).toBe(false);
    const pending = (await r.entries())[0]!;
    if (mode === "refused") s.api.get = async () => ({ ok: false, reason: "unavailable", message: "transient read failure" });
    else s.data.set(LIVE_PREFIX + pending.id, { invalidUnimported: true });
    const before = structuredClone([...s.data]);
    await expect(r.acknowledge(packetText({ schema: ACK_FORMAT, entries: [{ id: pending.id, packetSha256: pending.sha256, corpusReceiptSha256: "1".repeat(64) }] }))).rejects.toThrow(mode === "refused" ? /read failed/ : /invalid stored/);
    expect([...s.data]).toEqual(before); expect(s.data.get("legacy-control")).toEqual({ untouched: true });
  });
  it("preserves a valid large Unicode death within its byte budget with honest original/kept totals", async () => {
    const s = storage(), r = recorder(s), unicode = "😀".repeat(10000);
    const terminal = { ...report(), cause: "foe " + unicode, messages: Array.from({ length: 40 }, () => ({ text: unicode, count: 1 })),
      belongings: Array.from({ length: 100 }, () => ({ name: unicode, color: "white", location: "pack" as const, quantity: 1, recall: null })) };
    expect(await r.capture(terminal)).toBe(true);
    const e = (await recorder(s).entries())[0]!;
    expect(new TextEncoder().encode(packetText(e.packet)).length).toBeLessThanOrEqual(49152);
    expect(e.packet.terminal.outcome).toBe("death"); expect(String(e.packet.terminal.cause)).toMatch(/^foe /);
    expect(e.packet.terminal.textTruncated).toBe(true); expect(Number(e.packet.terminal.textBytesKept)).toBeLessThan(Number(e.packet.terminal.textBytesOriginal));
    expect(e.packet.terminal.messagesTotal).toBe(40); expect(e.packet.terminal.belongingsTotal).toBe(100);
    expect(e.packet.terminal.messagesKept).toBe((e.packet.terminal.messages as unknown[]).length);
    expect(await packetHash(e.packet.terminal)).toBe(e.packet.terminalHash);
  });
  it("rejects ACK mismatch before deletion, then removes only verified new packets; ACK retry is harmless", async () => {
    const s = storage(), r = recorder(s); s.data.set("legacy-graveyard", { untouched: true });
    await r.capture(report()); await r.capture(report("second")); const [e] = await r.entries();
    const ack = { schema: ACK_FORMAT, entries: [{ id: e!.id, packetSha256: "0".repeat(64), corpusReceiptSha256: "1".repeat(64) }] };
    await expect(r.acknowledge(JSON.stringify(ack))).rejects.toThrow(/match/); expect(s.data.size).toBe(3);
    ack.entries[0]!.packetSha256 = e!.sha256;
    expect(await r.acknowledge(JSON.stringify(ack))).toBe(1); expect(await r.acknowledge(JSON.stringify(ack))).toBe(0);
    expect(s.data.has("legacy-graveyard")).toBe(true); expect(s.data.size).toBe(2);
    expect(await r.capture(report())).toBe(true); expect(s.data.has(LIVE_PREFIX + e!.id)).toBe(false);
  });
  it("keeps victory and retirement separate from deaths", async () => {
    const s = storage(), r = recorder(s); await r.capture(report("win", "winner")); await r.capture(report("retire", "retired"));
    expect((await r.entries()).map(e => e.packet.terminal.outcome)).toEqual(expect.arrayContaining(["winner", "retired"]));
  });
});
