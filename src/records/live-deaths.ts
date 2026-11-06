/** FORK: Mandos #166. Observation-only terminal outbox; never feeds decisions. */
import type { AgentCommand, AgentView } from "@rpgm-tools/neo-angband-core";
import type { Api2KeyValueStore, JsonValue, RunReport } from "@rpgm-tools/neo-angband-mod-sdk";
import { birthReplayDataOf } from "./birth-replay.js";

import { ACK_FORMAT, LIVE_FORMAT, LIVE_PREFIX, MAX_LIVE_BYTES, MAX_LIVE_FRAMES, LIVE_EXPORT_LIMIT, isHash, isObject as object, packetHash, packetShape, packetText } from "./live-schema.mjs";
export { ACK_FORMAT, LIVE_FORMAT, LIVE_PREFIX, MAX_LIVE_BYTES, MAX_LIVE_FRAMES, LIVE_EXPORT_LIMIT, packetHash, packetText } from "./live-schema.mjs";
type Json = Record<string, JsonValue>;
type KV = Pick<Api2KeyValueStore, "get" | "set" | "keys">;
const copy = (x: unknown): JsonValue => JSON.parse(JSON.stringify(x)) as JsonValue;
export interface DecisionFrame {
  readonly turn: number;
  readonly command: JsonValue;
  readonly player: JsonValue;
  readonly monsters: JsonValue;
  readonly map: JsonValue;
  readonly items: JsonValue;
  readonly messages: JsonValue;
  readonly precision: "character-known/health-band-derived" | "character-known+granted-monster-truth";
}
/** Read the same cached view, before submit. No host call, RNG, timer or model access. */
export function decisionFrame(view: AgentView, command: AgentCommand | null, hasTruth: boolean, deliveredMessages: readonly string[] = []): DecisionFrame {
  const p = view.player(), bounds = view.mapBounds(), cells: JsonValue[] = [];
  for (let y = p.grid.y - 3; y <= p.grid.y + 3; y++) for (let x = p.grid.x - 3; x <= p.grid.x + 3; x++) {
    const c = x >= 0 && y >= 0 && x < bounds.width && y < bounds.height ? view.cell(x, y) : null;
    cells.push(c ? copy({ x, y, feat: c.knownFeat ?? (c.known ? c.feat : -1), known: c.known, monster: c.monster }) : null);
  }
  const item = (i: ReturnType<AgentView["inventory"]>[number]) => ({ handle: i.handle, label: i.label.slice(0, 512), quantity: i.number, aware: i.aware, unknownRunes: (i as { unknownRunes?: boolean }).unknownRunes ?? null });
  const raw = command as { code: string; dir?: number; args?: unknown } | null;
  return {
    turn: view.turn(), command: copy(raw ? { code: raw.code, ...(raw.dir === undefined ? {} : { dir: raw.dir }), ...(raw.args === undefined ? {} : { args: raw.args }), submission: "not-yet-submitted" } : null),
    player: copy({ grid: p.grid, hp: p.hp, maxHp: p.maxHp, sp: p.sp, maxSp: p.maxSp, depth: p.depth, level: p.level, status: p.status }),
    monsters: copy(view.monsters().filter(m => m.visible).slice(0, 12).map(m => ({ id: m.id, name: m.race, grid: m.grid, hp: m.hp, maxHp: m.maxHp, visible: m.visible }))),
    map: cells,
    items: copy({ pack: view.inventory().slice(0, 24).map(item), equipment: view.equipment().map(i => i ? item(i) : null), home: view.stores().filter(s => s.isHome).flatMap(s => s.stock.slice(0, 24).map(item)) }),
    messages: copy(deliveredMessages.slice(-8).map(m => m.slice(0, 512))), precision: hasTruth ? "character-known+granted-monster-truth" : "character-known/health-band-derived",
  };
}
export interface LiveSource {
  readonly mod: string;
  readonly engine: string;
  readonly api: string;
  readonly codeDigest: string | null;
  readonly life?: number | null;
  readonly flags: Readonly<Record<string, boolean>>;
  readonly settings: Readonly<Record<string, number>>;
}
export interface LivePacket {
  readonly schema: typeof LIVE_FORMAT;
  readonly id: string;
  readonly terminalHash: string;
  readonly source: LiveSource;
  readonly identity: { readonly hostKey: string | null; readonly quality: "host-key" | "derived-session" };
  readonly terminal: Json;
  readonly capture: { readonly frames: readonly DecisionFrame[]; readonly decisions: number; readonly droppedFrames: number; readonly truncated: boolean; readonly gaps: readonly string[] };
  readonly pending: { readonly export: true; readonly analysis: true };
}
export interface StoredLivePacket {
  readonly schema: "mandos/death-outbox@1";
  readonly id: string;
  readonly sha256: string;
  readonly packet: LivePacket;
}
export function storedPacket(value: unknown): StoredLivePacket | null { return packetShape(value) ? value : null; }
function terminalOf(report: RunReport): Json {
  if (!["death", "winner", "retired"].includes(report.outcome) || !Number.isFinite(report.turn) || typeof report.cause !== "string") throw new Error("The host supplied an invalid terminal report");
  const clipped = (value: string, limit: number): string => value.slice(0, limit);
  return copy({ outcome: report.outcome, cause: clipped(report.cause, 256), key: report.key, race: report.race, class: report.cls, birthStats: report.birth.stats,
    level: report.level, maxLevel: report.maxLevel, depth: report.depth, maxDepth: report.maxDepth, gold: report.gold, turn: report.turn, endedAt: report.endedAt,
    ...(typeof (report as unknown as { seed?: unknown }).seed === "number" ? { seed: (report as unknown as { seed: number }).seed } : {}),
    ...birthReplayDataOf(report), knowledge: "terminal-revealed", messages: report.messages.slice(-20).map(m => ({ text: clipped(m.text, 512), count: m.count })), messagesTotal: report.messages.length,
    belongings: report.belongings.slice(0, 48).map(i => ({ name: clipped(i.name, 160), location: i.location, quantity: i.quantity })), belongingsTotal: report.belongings.length, textTruncated: report.messages.length > 20 || report.belongings.length > 48 || report.messages.some(m => m.text.length > 512) || report.belongings.some(i => i.name.length > 160) || report.cause.length > 256 }) as Json;
}
export interface LiveRecorder {
  observe(frame: DecisionFrame): void;
  capture(report: RunReport): Promise<boolean>;
  retry(): Promise<boolean>;
  entries(): Promise<readonly StoredLivePacket[]>;
  acknowledge(text: string): Promise<number>;
  readonly failure: string | null;
}
export function createLiveRecorder(deps: { store: KV; source: () => LiveSource; log(message: string): void; sessionId?: string }): LiveRecorder {
  const session = deps.sessionId ?? (globalThis.crypto?.randomUUID?.() ?? "unidentified-session");
  const acknowledged = new Map<string, string>();
  const frames: DecisionFrame[] = [], volatile = new Map<string, StoredLivePacket>();
  let count = 0, failure: string | null = null, chain = Promise.resolve();
  const enqueue = <T>(work: () => Promise<T>): Promise<T> => {
    const next = chain.then(work, work); chain = next.then(() => undefined, () => undefined); return next;
  };
  const fail = (why: unknown): false => { failure = why instanceof Error ? why.message : String(why); deps.log(`Mandos death report is NOT durable: ${failure}. Automatic rebirth stops; export the pending report before reloading.`); return false; };
  async function preserve(entry: StoredLivePacket): Promise<boolean> {
    try {
      const key = LIVE_PREFIX + entry.id, prior = await deps.store.get(key);
      if (!prior.ok) return fail(prior.message);
      if (prior.value !== null) {
        const existing = storedPacket(prior.value);
        if (!existing || existing.packet.terminalHash !== entry.packet.terminalHash) return fail("A terminal identity conflicts with an existing outbox report");
        if (await packetHash(existing.packet) !== existing.sha256) return fail("An existing outbox report failed its content hash");
        volatile.delete(entry.id); failure = null; return true;
      }
      const written = await deps.store.set(key, copy(entry));
      if (!written.ok) return fail(written.message);
      const read = await deps.store.get(key);
      if (!read.ok || packetText(read.value) !== packetText(entry)) return fail("Outbox write did not verify on read-back");
      volatile.delete(entry.id); failure = null;
      deps.log(`Mandos recorded ${String(entry.packet.terminal.outcome)} ${entry.id}; export and analysis are pending.`);
      return true;
    } catch (error) { return fail(error); }
  }
  return {
    observe(frame) { count++; frames.push(structuredClone(frame)); if (frames.length > MAX_LIVE_FRAMES) frames.shift(); },
    capture(report) {
      // Freeze input synchronously: the next input/reload cannot change the tail.
      const tail = structuredClone(frames), decisions = count, source = structuredClone(deps.source());
      const terminal = terminalOf(report);
      return enqueue(async () => {
        try {
          const terminalHash = await packetHash(terminal), hostKey = typeof report.key === "string" && report.key ? report.key : null;
          const id = await packetHash({ mod: source.mod, identity: hostKey ?? `${session}:${terminalHash}` });
          if (acknowledged.get(id) === terminalHash) return true;
          const gaps = ["no-full-fatal-save", "submission-results-not-recorded", "messages-only-as-delivered-to-controller", "controller-command-tail-only", ...(source.codeDigest === null ? ["exact-code-digest-unavailable"] : []), ...(tail.length ? [] : ["pre-decision-tail-unavailable"])];
          const packet: LivePacket = { schema: LIVE_FORMAT, id, terminalHash, source, identity: { hostKey, quality: hostKey ? "host-key" : "derived-session" }, terminal,
            capture: { frames: tail, decisions, droppedFrames: Math.max(0, decisions - tail.length), truncated: decisions > tail.length, gaps }, pending: { export: true, analysis: true } };
          while (new TextEncoder().encode(packetText(packet)).length > MAX_LIVE_BYTES && tail.length) {
            tail.shift();
            (packet.capture as { droppedFrames: number; truncated: boolean }).droppedFrames++; (packet.capture as { truncated: boolean }).truncated = true;
          }
          if (new TextEncoder().encode(packetText(packet)).length > MAX_LIVE_BYTES) return fail("Terminal packet exceeds the bounded recording size");
          const entry: StoredLivePacket = { schema: "mandos/death-outbox@1", id, sha256: await packetHash(packet), packet };
          if (!storedPacket(entry)) return fail("Host observation does not match the portable terminal packet contract");
          volatile.set(id, entry); return preserve(entry);
        } catch (error) { return fail(error); }
      });
    },
    retry: () => enqueue(async () => { let ok = true; for (const entry of [...volatile.values()]) if (!(await preserve(entry))) ok = false; return ok && failure === null; }),
    entries: () => enqueue(async () => {
      const found = new Map<string, StoredLivePacket>();
      const keys = await deps.store.keys();
      if (!keys.ok) { fail(keys.message); return [...volatile.values()]; }
      for (const key of keys.value.filter(k => k.startsWith(LIVE_PREFIX)).sort()) {
        const read = await deps.store.get(key), entry = read.ok ? storedPacket(read.value) : null;
        if (entry && await packetHash(entry.packet) === entry.sha256) found.set(entry.id, entry);
        else fail(`Outbox report ${key} is unreadable or corrupt`);
      }
      for (const entry of volatile.values()) found.set(entry.id, entry);
      return [...found.values()];
    }),
    acknowledge: text => enqueue(async () => {
      if (new TextEncoder().encode(text).length > 32768) throw new Error("Import acknowledgement is too large");
      const ack: unknown = JSON.parse(text);
      if (!object(ack) || ack.schema !== ACK_FORMAT || !Array.isArray(ack.entries) || ack.entries.length > LIVE_EXPORT_LIMIT) throw new Error("Expected a successful corpus-import acknowledgement");
      // Validate every requested deletion before any KV remove; legacy data is never addressed.
      const remove: { id: string; terminalHash: string }[] = [];
      for (const item of ack.entries) {
        if (!object(item) || !isHash(item.id) || !isHash(item.packetSha256) || !isHash(item.corpusReceiptSha256)) throw new Error("Invalid import acknowledgement identity/hash");
        const read = await deps.store.get(LIVE_PREFIX + item.id), entry = read.ok ? storedPacket(read.value) : null;
        if (read.ok && read.value === null && !volatile.has(item.id)) continue; // ACK retry is idempotent.
        const current = entry ?? volatile.get(item.id);
        if (!current || current.sha256 !== item.packetSha256 || await packetHash(current.packet) !== item.packetSha256) throw new Error("Acknowledgement does not match the current report");
        remove.push({ id: item.id, terminalHash: current.packet.terminalHash });
      }
      for (const { id, terminalHash } of remove) {
        const result = await deps.store.set(LIVE_PREFIX + id, null);
        const read = await deps.store.get(LIVE_PREFIX + id);
        if (!result.ok || !read.ok || read.value !== null) throw new Error("Imported report could not be retired; retry the same acknowledgement");
        acknowledged.set(id, terminalHash);
        volatile.delete(id);
      }
      if (volatile.size === 0) failure = null;
      deps.log(`Mandos acknowledged ${String(remove.length)} imported reports; no legacy archive or character data was removed.`);
      return remove.length;
    }),
    get failure() { return failure; },
  };
}
