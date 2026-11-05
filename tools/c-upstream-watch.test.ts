import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const gh = vi.hoisted(() => vi.fn());
vi.mock("node:child_process", () => ({ execFileSync: gh }));
let scratch: string;
let cache: string;
let lines: string[];
const oldExit = process.exitCode;
beforeEach(() => {
  scratch = mkdtempSync(join(tmpdir(), "mandos-c-watch-"));
  cache = join(scratch, "cache.json");
  vi.stubEnv("MANDOS_C_WATCH_CACHE", cache);
  lines = [];
  vi.spyOn(console, "log").mockImplementation((...args) => { lines.push(args.join(" ")); });
  vi.spyOn(console, "error").mockImplementation((...args) => { lines.push(args.join(" ")); });
  process.exitCode = 0;
});
afterEach(() => {
  process.exitCode = oldExit;
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  rmSync(scratch, { recursive: true, force: true });
});
async function run(incomplete = false, offline = false) {
  gh.mockImplementation((_command: string, args: string[]) => {
    if (offline) throw new Error("offline");
    if (args[0] === "issue") return "[]";
    if (args[1]?.includes("watch-index.json")) return JSON.stringify({ encoding: "base64", content: Buffer.from(JSON.stringify({ sources: { c: { commit: "e473720ed88a0f0c7ca66815cef3000eb4a38bc3" } }, findings: [] })).toString("base64") });
    if (args[1]?.includes("commits/master")) return JSON.stringify({ sha: "e473720ed88a0f0c7ca66815cef3000eb4a38bc3" });
    if (args[1]?.startsWith("search/issues")) return JSON.stringify({ items: [], total_count: 230, incomplete_results: incomplete });
    throw new Error("Unexpected API read");
  });
  vi.resetModules();
  await import(new URL("./c-upstream-watch.mjs", import.meta.url).href);
  return lines.join("\n");
}
it("reports the discovery window without treating source equality as bug resolution", async () => {
  const text = await run();
  expect(text).toContain("Official source still equals");
  expect(text).toContain("not a complete historical duplicate search");
  expect(text).toContain("does not apply a local correction");
  expect(JSON.parse(readFileSync(cache, "utf8")).head).toBeTruthy();
  expect(process.exitCode).toBe(0);
});
it.each(["incomplete", "offline"])("retains the last successful baseline on %s reads", async (failure) => {
  const baseline = JSON.stringify({ head: "previous", recent: {}, threads: {} });
  writeFileSync(cache, baseline);
  expect(await run(failure === "incomplete", failure === "offline")).toContain("Previous successful watch baseline retained");
  expect(readFileSync(cache, "utf8")).toBe(baseline);
  expect(process.exitCode).toBe(1);
});
