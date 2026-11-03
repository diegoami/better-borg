/**
 * THE BIRTH FLAG: the one-shot install-slot key that marks a birth as the
 * Borg's own.
 *
 * Ported from neowarrior-borg's src/birth/presenter.ts (T03, reviewed
 * through #34/#35; v0.1.0 e1ec1b7) into a core module of its own at the M2
 * unification (#15): the flag is shared protocol between the three writers
 * that set it - the restart loop (src/loop/restart.ts), the title row
 * (title.ts) - and whichever strategy pack's presenter consumes it
 * (src/class/warrior/presenter.ts today). It belongs to none of them, so it
 * lives here and they all import it. The KEY STRING is unchanged from the
 * archived fork ("warriorBirth"): it is storage, not prose, and a rename
 * would buy nothing but a diff.
 *
 * THE PROTOCOL, fail-closed end to end. The flag is a sibling key inside the
 * install slot's shared JSON object - a SIBLING of the title row's
 * profileIds, the lineage counter and the graveyard archive - so every write
 * here is a read-modify-write that carries the other keys forward (#26's
 * discipline, as the archived fork learned it). The writers set it and then
 * leave the page (saves.create and the profile action both reload); the host
 * builds the presenter at mod registration on every page, so the prepare
 * that reads the flag starts there and settles long before any birth is
 * offered. NO FLAG is the human path. A set flag is DURABLY CONSUMED by the
 * presenter's own prepare (re-read, write-back minus ours, read again to
 * verify - a slot answers ok to a set whose backing write was swallowed,
 * #25, so only the read-back proves anything). This module owns the two
 * writer-side operations: set (answered, not verified - the caller verifies
 * when the next action depends on it) and clear (VERIFIED, read-back
 * included, because a clear that did not land is the stranded-flag hazard).
 */

import type { Api2Slot, JsonValue } from "@rpgm-tools/neo-angband-mod-sdk";

/**
 * The install-slot key that marks a birth as ours. The value is exactly true;
 * anything else reads as "not ours". The name is the archived fork's, kept so
 * the slot shape has one owner and one history.
 */
export const BIRTH_FLAG_KEY = "warriorBirth";

/** The install slot's get/set, the half of Api2Slot this protocol uses. */
type Slot = Pick<Api2Slot, "get" | "set">;

/** Whether a slot value carries the flag. A non-object, or true's absence, is no. */
function flagIsSet(value: JsonValue | null): boolean {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  return (value as Record<string, unknown>)[BIRTH_FLAG_KEY] === true;
}

/** The slot value with our key removed, so the consume keeps its siblings. */
function withoutFlag(value: JsonValue | null): JsonValue | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return null;
  const kept: Record<string, JsonValue> = {};
  let any = false;
  for (const [key, entry] of Object.entries(value)) {
    if (key === BIRTH_FLAG_KEY) continue;
    kept[key] = entry as JsonValue;
    any = true;
  }
  return any ? kept : null;
}

/**
 * Set the one-shot birth flag, preserving the slot's other keys (the title
 * row's profileIds, the lineage counter, the graveyard archive). Returns
 * whether the slot took the write: a false means the flag is not set at all -
 * the presenter reads only the slot, so a write the slot refused is a birth
 * that will not be ours, which the caller (the restart loop, the title row)
 * needs to know before it reloads into one.
 */
export async function setBirthFlag(slot: Slot): Promise<boolean> {
  const current = await slot.get().catch(() => null);
  const base = current !== null && current.ok && current.value !== null &&
      typeof current.value === "object" && !Array.isArray(current.value)
    ? (current.value as Record<string, JsonValue>)
    : {};
  const written = await slot.set({ ...base, [BIRTH_FLAG_KEY]: true }).catch(() => undefined);
  return written !== undefined && written.ok;
}

/**
 * Durably clear the one-shot birth flag, preserving the slot's other keys, and
 * prove it gone by reading the slot again - the same verified standard the
 * presenter's consume holds itself to (a slot answers ok to a set whose
 * backing write was swallowed, #25, so only the read-back proves anything).
 * For the restart loop (src/loop/restart.ts), on the one path where it set
 * the flag and then could not leave the page: a flag left standing would take
 * the NEXT birth on any later reload, whoever started it. A flag that is
 * already gone counts as cleared - the read itself is the proof.
 */
export async function clearBirthFlag(slot: Slot): Promise<boolean> {
  try {
    const current = await slot.get();
    if (!current.ok) return false;
    if (!flagIsSet(current.value)) return true;
    const written = await slot.set(withoutFlag(current.value));
    if (!written.ok) return false;
    const check = await slot.get();
    return check.ok && !flagIsSet(check.value);
  } catch {
    return false;
  }
}
