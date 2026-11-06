/** FORK Mandos20: cooperative install-metadata RMW; persistence stays on SDK slots. */
import type { Api2Slot, JsonValue } from "@rpgm-tools/neo-angband-mod-sdk";

type Slot = Pick<Api2Slot, "get" | "set">;
type FailurePhase = "coordination" | "read" | "reduce" | "write" | "verify";
export type InstallMutationResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly phase: FailurePhase; readonly message: string };
export type InstallMutation<T> =
  | { readonly write: true; readonly next: JsonValue | null; readonly result: T }
  | { readonly write: false; readonly result: T };

export const INSTALL_MUTATION_LOCK = "mandos:install-metadata";
const NODE_QUEUE = Symbol.for("mandos.install-metadata.single-realm-queue.v1");
interface LockProvider {
  request<T>(name: string, options: { mode: "exclusive" }, callback: () => Promise<T>): Promise<T>;
}
interface Environment {
  readonly window?: unknown;
  readonly WorkerGlobalScope?: unknown;
  readonly navigator?: { readonly locks?: LockProvider };
  readonly process?: { readonly release?: { readonly name?: string }; readonly versions?: { readonly node?: string } };
  [key: symbol]: { tail: Promise<void> } | undefined;
}
const message = (error: unknown): string => error instanceof Error ? error.message : String(error);
const failure = (phase: FailurePhase, text: string) => ({ ok: false as const, phase, message: text });

/** No browser fallback: separate pages cannot share a JavaScript promise queue. */
async function coordinate<T>(work: () => Promise<InstallMutationResult<T>>): Promise<InstallMutationResult<T>> {
  const env = globalThis as unknown as Environment;
  const browser = env.window !== undefined || env.WorkerGlobalScope !== undefined;
  if (browser) {
    try {
      const locks = env.navigator?.locks;
      if (typeof locks?.request !== "function") return failure("coordination", "Web Locks unavailable; install metadata was not written");
      return await locks.request(INSTALL_MUTATION_LOCK, { mode: "exclusive" }, work);
    } catch (error) {
      return failure("coordination", `Install metadata lock refused: ${message(error)}`);
    }
  }
  if (env.process?.release?.name === "node" && typeof env.process.versions?.node === "string") {
    // Node22 harness MemorySlots: one realm, including cooperating bundle copies.
    // This does not coordinate separate processes or arbitrary persistent backends.
    const state = env[NODE_QUEUE] ?? (env[NODE_QUEUE] = { tail: Promise.resolve() });
    const result = state.tail.then(work, work);
    state.tail = result.then(() => undefined, () => undefined);
    return result;
  }
  return failure("coordination", "No supported install metadata coordinator; nothing was written");
}

/** Fresh get -> synchronous field reducer -> set/readback, all inside acquisition. */
export async function mutateInstall<T>(
  slot: Slot,
  reduce: (current: JsonValue | null) => InstallMutation<T>,
  verification?: { readonly accepts: (current: JsonValue | null) => boolean; readonly message: string },
): Promise<InstallMutationResult<T>> {
  return coordinate(async () => {
    let read: Awaited<ReturnType<Slot["get"]>>;
    try { read = await slot.get(); }
    catch (error) { return failure("read", message(error)); }
    if (!read.ok) return failure("read", read.message);
    let change: InstallMutation<T>;
    try { change = reduce(read.value); }
    catch (error) { return failure("reduce", message(error)); }
    if (!change.write) return { ok: true, value: change.result };
    try {
      const written = await slot.set(change.next);
      if (!written.ok) return failure("write", written.message);
    } catch (error) { return failure("write", message(error)); }
    if (verification) {
      try {
        const checked = await slot.get();
        if (!checked.ok) return failure("verify", checked.message);
        if (!verification.accepts(checked.value)) return failure("verify", verification.message);
      } catch (error) { return failure("verify", message(error)); }
    }
    return { ok: true, value: change.result };
  });
}
