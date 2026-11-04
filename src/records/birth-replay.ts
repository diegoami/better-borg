/** FORK: Mandos #54. Optional end-report inputs needed to recreate the accepted birth. */
import type { RngState } from "@rpgm-tools/neo-angband-core";

export interface BirthReplayData {
  readonly birthRngState?: RngState;
  readonly birthOptions?: Readonly<Record<string, boolean>>;
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function uint32(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 0xffffffff;
}

/** Validate and copy optional metadata; never infer a missing birth position from the seed. */
export function birthReplayDataOf(value: unknown): BirthReplayData {
  if (!record(value)) return {};
  const s = value["birthRngState"];
  const birthRngState: RngState | undefined = record(s)
    && typeof s["quick"] === "boolean" && typeof s["fixed"] === "boolean"
    && uint32(s["value"]) && uint32(s["stateI"]) && s["stateI"] < 32 && uint32(s["fixval"])
    && Array.isArray(s["state"]) && s["state"].length === 32 && s["state"].every(uint32)
    ? { quick: s["quick"], fixed: s["fixed"], value: s["value"], stateI: s["stateI"],
      fixval: s["fixval"], state: [...s["state"]] } : undefined;
  const options = value["birthOptions"];
  const birthOptions = record(options)
    && Object.entries(options).every(([name, enabled]) => name.startsWith("birth_") && typeof enabled === "boolean")
    ? { ...options } as Record<string, boolean> : undefined;
  return {
    ...(birthRngState === undefined ? {} : { birthRngState }),
    ...(birthOptions === undefined ? {} : { birthOptions }),
  };
}
