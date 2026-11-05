import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
// The renderer is JavaScript so the same check runs in offline pnpm verify.
// @ts-expect-error no declaration file for the local ESM validator
import { validateSourceSnapshot } from "./c-bugs-source.mjs";
const source = "## 1. Example\n* A reported defect.\n* Rust: retained.\n";
function data(text = source) {
  return { sources: { borg_rs: { commit: "pin", snapshot: { commit: "pin", sha256: createHash("sha256").update(text).digest("hex") } } },
    groups: [{ number: 1 }], findings: [{ id: "example", reported_sources: [{ reference: { commit: "pin", start: 2, end: 2 }, text: "A reported defect." }] }],
    report_coverage: { leaf_reports: 1, source_claims: [{ start: 2, end: 2 }], non_report_bullets: [{ line: 3, text: "* Rust: retained.", reason: "Rust note" }] } };
}
describe("discovery snapshot coverage", () => {
  it("accepts explicitly mapped reports and provenance notes", () => {
    expect(() => validateSourceSnapshot(data(), source)).not.toThrow();
  });
  it("rejects a newly appended group absent from the catalogue", () => {
    const changed = source + "## 2. Newly appended\n* Another report.\n";
    expect(() => validateSourceSnapshot(data(changed), changed)).toThrow(/source groups/);
  });
  it("rejects a new bullet even within an already catalogued group", () => {
    const changed = source + "* Another report.\n";
    expect(() => validateSourceSnapshot(data(changed), changed)).toThrow(/unclassified source bullet/);
  });
  it("rejects stale pins, bytes and excerpt ranges", () => {
    const stale = data(); stale.sources.borg_rs.commit = "new-pin";
    expect(() => validateSourceSnapshot(stale, source)).toThrow(/snapshot pin/);
    expect(() => validateSourceSnapshot(data(), source + "changed")).toThrow(/digest/);
    const excerpt = data(); excerpt.findings[0]!.reported_sources[0]!.reference.start = 3;
    expect(() => validateSourceSnapshot(excerpt, source)).toThrow(/reported text/);
  });
});
