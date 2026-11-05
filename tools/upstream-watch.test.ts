import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const gh = vi.hoisted(() => vi.fn());
vi.mock("node:child_process", () => ({ execFileSync: gh }));
let scratch: string;
let cache: string;
let lines: string[];
const oldExitCode = process.exitCode;

beforeEach(() => {
  scratch = mkdtempSync(join(tmpdir(), "mandos-watch-"));
  cache = join(scratch, "cache.json");
  vi.stubEnv("MANDOS_UPSTREAM_WATCH_CACHE", cache);
  lines = [];
  vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => { lines.push(args.map(String).join(" ")); });
  process.exitCode = 0;
  gh.mockReset();
});
afterEach(() => {
  process.exitCode = oldExitCode;
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  rmSync(scratch, { recursive: true, force: true });
});

const issue = (number: number, labels: string[], refs = "none yet") => ({
  number, title: "A stable defect title", labels: labels.map((name) => ({ name })), body: `**Threads**: ${refs}`,
});
async function run(issues: unknown[], endpoints: Record<string, unknown>) {
  gh.mockImplementation((_command: string, args: string[]) => {
    if (args[0] === "issue") return JSON.stringify(issues);
    const result = endpoints[args[1]!];
    if (result instanceof Error || result === undefined) throw result ?? new Error("unexpected API request");
    return JSON.stringify(result);
  });
  await vi.resetModules();
  await import(new URL("./upstream-watch.mjs", import.meta.url).href);
  return lines.join("\n");
}

describe("upstream/carry report", () => {
  it("separates upstream state from carry labels and audits C-only/no-thread candidates", async () => {
    const text = await run([
      issue(64, ["upstream", "carried"], "upstream/game#441 upstream/mod#34"),
      issue(75, ["upstream", "upstream-c", "not-carried"]),
      issue(89, ["upstream-c", "not-carried"]),
      issue(13, ["upstream"]),
      issue(43, ["upstream", "carried", "not-carried"]),
    ], {
      "repos/upstream/game/issues/441": { state: "open", comments: 0, updated_at: "today" },
      "repos/upstream/mod/issues/34": { state: "closed", comments: 0, updated_at: "today", pull_request: {} },
      "repos/upstream/mod/pulls/34": { merged_at: "today", head: { sha: "a" } },
    });
    expect(text).toMatch(/game#441 issue\s+OPEN\s+carried/);
    expect(text).toMatch(/mod#34 pr\s+MERGED\s+carried/);
    expect(text).toMatch(/#89\s+not-carried/);
    expect(text).toContain("#13: carry status MISSING");
    expect(text).toContain("#43: carry status CONFLICT");
    expect(process.exitCode).toBe(1);
    expect(gh.mock.calls.every(([command]) => command === "gh")).toBe(true);
  });

  it("detects PR-head movement without comments and retains the baseline after an API failure", async () => {
    const issues = [issue(64, ["upstream", "carried"], "upstream/mod#34")];
    const endpoints = {
      "repos/upstream/mod/issues/34": { state: "open", comments: 0, updated_at: "same", pull_request: {} },
      "repos/upstream/mod/pulls/34": { merged_at: null, head: { sha: "a" } },
    };
    expect(await run(issues, endpoints)).toContain("No upstream movement");
    endpoints["repos/upstream/mod/pulls/34"].head.sha = "b";
    expect(await run(issues, endpoints)).toContain("MOVED: upstream/mod#34");
    const before = readFileSync(cache, "utf8");
    const text = await run(issues, { ...endpoints, "repos/upstream/mod/pulls/34": new Error("offline") });
    expect(text).toContain("UNKNOWN");
    expect(text).toContain("previous baseline retained");
    expect(readFileSync(cache, "utf8")).toBe(before);
    expect(process.exitCode).toBe(1);
  });
});
