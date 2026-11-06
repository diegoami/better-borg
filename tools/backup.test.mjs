import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, readlinkSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { devNull, hostname, tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { backup, coldProfile, reductionGuard } from "./backup.mjs";

const localEnv = { PATH: process.env.PATH ?? "", LANG: "C", TMPDIR: tmpdir(), ...(process.env.SystemRoot ? { SystemRoot: process.env.SystemRoot } : {}) };
const committed = JSON.parse(readFileSync(new URL("../backup.json", import.meta.url), "utf8"));
const row = (Path, Size = 10) => ({ Path, Size, IsDir: false, ModTime: "2026-01-01T00:00:00Z" });
const anchors = [row("user/settings.json"), row("chromium/IndexedDB/db/data.ldb")];
function file(root, path, text = "synthetic fixture") {
  const full = join(root, path); mkdirSync(resolve(full, ".."), { recursive: true }); writeFileSync(full, text); return full;
}
function files(root) {
  if (!existsSync(root)) return {};
  const out = {};
  const walk = (base, prefix = "") => { for (const entry of readdirSync(base, { withFileTypes: true })) {
    const path = prefix + entry.name;
    if (entry.isDirectory()) walk(join(base, entry.name), path + "/");
    else if (entry.isFile()) out[path] = readFileSync(join(base, entry.name), "utf8");
  } };
  walk(root); return out;
}
function fixture(runTest) {
  const root = mkdtempSync(join(tmpdir(), "mandos-backup155-test-"));
  const config = structuredClone(committed);
  config.sets["mandos-lab-data"].local = "lab";
  config.sets["mandos-lab-data"].preflight.processDirectory = "engine";
  config.sets["mandos-evidence"].local = "evidence";
  mkdirSync(join(root, "lab")); mkdirSync(join(root, "evidence"));
  try { return runTest({ root, config }); } finally { rmSync(root, { recursive: true, force: true }); }
}
function fake(f) {
  const calls = [], logs = [];
  const inventories = new Map([[join(f.root, "lab"), anchors], [join(f.root, "evidence"), [row("lab-build.json")]]]);
  return { calls, logs, inventories, options: { ...f, processes: () => [], log: line => logs.push(line), remote: path => join(f.root, "remote", path), run: args => {
    calls.push(args); if (args[0] === "lsjson") return JSON.stringify(inventories.get(args[1]) ?? []); return "";
  } } };
}
const writes = fake => fake.calls.filter(args => ["sync", "copy", "move", "delete", "purge"].includes(args[0]));

// Always execute: a missing fixture dependency is a failed gate, never a skipped proof.
const rcloneVersion = () => execFileSync("rclone", ["--config", devNull, "version"], { encoding: "utf8", env: localEnv, stdio: ["ignore", "pipe", "pipe"] }).split("\n")[0];
function real(f) {
  const calls = [], logs = [];
  const run = args => {
    // Every source/destination is inside this test's disposable tree. No named
    // remote and no user's rclone config can be consulted by this fixture.
    const paths = args[0] === "sync" || args[0] === "copy" || args[0] === "check" ? args.slice(1, 3) : args.slice(1, 2);
    if (args.includes("--backup-dir")) paths.push(args[args.indexOf("--backup-dir") + 1]);
    for (const path of paths) expect(path.startsWith(f.root + "/")).toBe(true);
    calls.push(args);
    return execFileSync("rclone", ["--config", devNull, "--retries", "1", "--low-level-retries", "1", "--stats", "0", ...args], { encoding: "utf8", env: localEnv, stdio: ["ignore", "pipe", "pipe"] });
  };
  return { calls, logs, run, options: { ...f, run, log: line => logs.push(line), processes: () => [], remote: path => join(f.root, "remote", path), now: () => new Date("2026-01-01T00:00:00Z") } };
}
function populate(f) {
  const included = ["user/settings.json", "user/saves/history.json", "logs/run.log", "chromium/IndexedDB/db/data.ldb", "chromium/Local Storage/leveldb/data.ldb", "chromium/WebStorage/QuotaManager", "chromium/Preferences", "chromium/Local State", "chromium/blob_storage/blob", "chromium/Session Storage/data", "restore-points/a/chromium/IndexedDB/snapshot", "restore-points/a/game/user/save"];
  for (const path of included) file(join(f.root, "lab"), path, "selected " + path);
  for (const path of ["mods/mandos/.git/config", "mods/mandos/plugin.js", "chromium/Cache/item", "chromium/Code Cache/item", "chromium/GPUCache/item", "chromium/Network/Cookies", "trust.json", "chromium/DevToolsActivePort"]) file(join(f.root, "lab"), path, "excluded synthetic");
  const evidence = ["lab-build.json", "reorganization-review-fixture.json", "retained-worktree-evidence/old-receipt.log", "workspace-backup-fixture.txt"];
  for (const path of evidence) file(join(f.root, "evidence"), path);
  for (const path of ["scratch.log", "node_modules/cache", "build/cache"]) file(join(f.root, "evidence"), path);
  return { included, evidence };
}

describe("backup preflight without a remote", () => {
  it("validates every selected set before the first write, including a later empty selection", () => fixture(f => {
    const t = fake(f); t.inventories.set(join(f.root, "evidence"), []);
    expect(() => backup(["push"], t.options)).toThrow(/empty selected/); expect(writes(t)).toEqual([]);
  }));
  it("refuses absent directories, excluded-only/zero-byte selections and missing anchors even with reduction override", () => fixture(f => {
    const t = fake(f); rmSync(join(f.root, "lab"), { recursive: true });
    expect(() => backup(["push"], t.options)).toThrow(/no local directory/); mkdirSync(join(f.root, "lab"));
    for (const rows of [[], [row("user/empty", 0)], [row("logs/log")]]) {
      t.inventories.set(join(f.root, "lab"), rows);
      expect(() => backup(["push", "--allow-large-reduction"], t.options)).toThrow(/empty selected|anchor/);
    }
    expect(writes(t)).toEqual([]);
  }));
  it("refuses a configured live process and resolved live lock owner even with cold confirmation", () => fixture(f => {
    const t = fake(f); const set = f.config.sets["mandos-lab-data"];
    t.options.processes = () => [{ pid: 123, name: "electron", cwd: join(f.root, "engine") }];
    expect(() => backup(["push", "--confirm-cold-profile"], t.options)).toThrow(/in use/);
    mkdirSync(join(f.root, "lab/chromium")); symlinkSync(`${hostname()}-123`, join(f.root, "lab/chromium/SingletonLock"));
    t.options.processes = () => [{ pid: 123, name: "electron", cwd: join(f.root, "unrelated") }];
    expect(() => coldProfile(join(f.root, "lab"), set, { root: f.root, processes: t.options.processes, confirmCold: true, log: () => {} })).toThrow(/live SingletonLock owner/);
    expect(writes(t)).toEqual([]);
  }));
  it("accepts cold stale DevTools/LevelDB non-lock files and known unrelated Electron/C processes", () => fixture(f => {
    const t = fake(f); file(join(f.root, "lab"), "chromium/DevToolsActivePort"); file(join(f.root, "lab"), "chromium/IndexedDB/db/LOCK", "");
    t.options.processes = () => [{ pid: 12, name: "electron", cwd: join(f.root, "unrelated") }, { pid: 13, name: "angband", cwd: join(f.root, "native-c") }];
    backup(["push", "--dry-run"], t.options); expect(writes(t)).toHaveLength(2);
    expect(writes(t).every(args => args.includes("--dry-run"))).toBe(true);
  }));
  it("requires explicit logged cold attestation for stale markers/unavailable process evidence without clearing them", () => fixture(f => {
    const t = fake(f); mkdirSync(join(f.root, "lab/chromium")); const lock = join(f.root, "lab/chromium/SingletonLock"); symlinkSync("stale-other-host-123", lock);
    expect(() => backup(["push"], t.options)).toThrow(/uncertain/); expect(writes(t)).toEqual([]);
    backup(["push", "--confirm-cold-profile"], t.options); expect(readlinkSync(lock)).toBe("stale-other-host-123"); expect(t.logs.some(line => line.includes("EXCEPTION --confirm-cold-profile"))).toBe(true);
  }));
  it("refuses uncertainty by default; an explicit confirmation is recorded and does not bypass hot/anchor checks", () => fixture(f => {
    const t = fake(f); t.options.processes = () => { throw Error("process metadata unavailable"); };
    expect(() => backup(["push"], t.options)).toThrow(/uncertain/); expect(writes(t)).toEqual([]);
    t.options.processes = () => [{ pid: 99, name: "electron", cwd: null }];
    expect(() => backup(["push"], t.options)).toThrow(/uncertain/); expect(writes(t)).toEqual([]);
    backup(["push", "--confirm-cold-profile"], t.options); expect(t.logs.some(line => line.includes("EXCEPTION --confirm-cold-profile"))).toBe(true);
  }));
  it("bounds missing-file count/fraction and byte reduction; override stays finite and explicit", () => {
    const current = Array.from({ length: 100 }, (_, n) => row(`user/${n}`, 100));
    expect(() => reductionGuard("lab", current.slice(11), current)).toThrow(/suspicious/);
    expect(() => reductionGuard("lab", current.map(x => ({ ...x, Size: 1 })), current)).toThrow(/suspicious/);
    expect(reductionGuard("lab", current.slice(1), current).budget).toBe(10);
    expect(reductionGuard("lab", current.slice(99), current, true).budget).toBe(100);
    expect(() => reductionGuard("small", [row("a")], [row("a"), row("b")])).toThrow(/suspicious/);
  });
  it("checks all remote reduction plans and refreshed source metadata before any set writes", () => fixture(f => {
    const t = fake(f); t.inventories.set(join(f.root, "remote/mandos-evidence/current"), [row("old-a"), row("old-b")]);
    expect(() => backup(["push"], t.options)).toThrow(/suspicious/); expect(writes(t)).toEqual([]);
    t.inventories.delete(join(f.root, "remote/mandos-evidence/current")); const run = t.options.run; let localReads = 0;
    t.options.run = args => { if (args[0] === "lsjson" && args[1] === join(f.root, "lab") && ++localReads === 2) return JSON.stringify(anchors.map(x => ({ ...x, Size: 99 }))); return run(args); };
    expect(() => backup(["push"], t.options)).toThrow(/changed during preflight/); expect(writes(t)).toEqual([]);
  }));
  it("requires populated remote anchors for empty-staging pull and traces exceptional overlays", () => fixture(f => {
    const t = fake(f); const config = structuredClone(f.config); config.sets["mandos-lab-data"].local = "staging";
    const options = { ...t.options, config };
    expect(() => backup(["pull", "mandos-lab-data"], options)).toThrow(/empty selected/); expect(writes(t)).toEqual([]);
    t.inventories.set(join(f.root, "remote/mandos-lab-data/current"), anchors);
    backup(["pull", "mandos-lab-data"], options); expect(writes(t)).toHaveLength(1);
    file(join(f.root, "staging"), "existing"); expect(() => backup(["pull", "mandos-lab-data"], options)).toThrow(/not empty/);
    backup(["pull", "mandos-lab-data", "--force"], options); expect(t.logs.some(line => line.includes("EXCEPTION --force"))).toBe(true);
    options.processes = () => [{ pid: 55, name: "electron", cwd: join(f.root, "engine") }];
    expect(() => backup(["pull", "mandos-lab-data", "--force", "--confirm-cold-profile"], options)).toThrow(/in use/);
    expect(writes(t)).toHaveLength(2);
  }));
  it("fails closed on inaccessible inventory or unknown options and refuses a nonempty restore target", () => fixture(f => {
    const t = fake(f); t.options.run = () => { const error = Error("hidden transport detail"); error.status = 5; throw error; };
    expect(() => backup(["push"], t.options)).toThrow(/cannot read backup inventory/);
    expect(() => backup(["push", "--typo"], t.options)).toThrow(/unknown option/);
    file(join(f.root, "lab"), "existing"); expect(() => backup(["pull", "mandos-lab-data"], t.options)).toThrow(/not empty/);
    expect(writes(t)).toEqual([]);
  }));
});

describe("real rclone, synthetic local data only (--config null device)", () => {
  it("reproduces the old empty-current and ignored-hot-marker bugs using only remapped local transport", () => fixture(f => {
    expect(rcloneVersion()).toMatch(/^rclone v/);
    const original = execFileSync("git", ["show", "9db5a5c37207ec582c047a965884e67175a7dd04:tools/backup.mjs"], { encoding: "utf8" });
    const mapper = 'return `${rcloneAccount},root_folder_id=${folderId}:${path}`;';
    expect(original).toContain(mapper);
    const legacy = original.replace(mapper, 'return join(ROOT, "remote", path);').replace('execFileSync("rclone", args,', `execFileSync("rclone", ["--config", ${JSON.stringify(devNull)}, ...args],`);
    file(f.root, "tools/backup.mjs", legacy); file(f.root, "backup.json", JSON.stringify(f.config));
    const current = join(f.root, "remote/mandos-lab-data/current");
    file(current, "user/settings.json", "prior synthetic"); file(current, "chromium/IndexedDB/db/data.ldb", "prior synthetic");
    execFileSync(process.execPath, [join(f.root, "tools/backup.mjs"), "push", "mandos-lab-data"], { env: localEnv, stdio: ["ignore", "pipe", "pipe"] });
    expect(files(current)).toEqual({}); expect(Object.keys(files(join(f.root, "remote/mandos-lab-data/archive")))).toHaveLength(2);
    file(join(f.root, "lab"), "user/settings.json", "hot synthetic"); file(join(f.root, "lab"), "chromium/IndexedDB/db/data.ldb", "hot synthetic"); file(join(f.root, "lab"), "chromium/SingletonLock", "hot synthetic marker");
    execFileSync(process.execPath, [join(f.root, "tools/backup.mjs"), "push", "mandos-lab-data"], { env: localEnv, stdio: ["ignore", "pipe", "pipe"] });
    expect(readFileSync(join(current, "user/settings.json"), "utf8")).toBe("hot synthetic");
  }), 60000);
  it("keeps filters/evidence/restore points, archives replacement/deletion without timestamp collisions, and rejects corrupted staged restoration", () => fixture(f => {
    expect(rcloneVersion()).toMatch(/^rclone v/); const expected = populate(f); const t = real(f);
    backup(["push", "--dry-run"], t.options); expect(files(join(f.root, "remote"))).toEqual({});
    backup(["push"], t.options);
    const labCurrent = join(f.root, "remote/mandos-lab-data/current"), evidenceCurrent = join(f.root, "remote/mandos-evidence/current");
    expect(Object.keys(files(labCurrent)).sort()).toEqual(expected.included.sort()); expect(Object.keys(files(evidenceCurrent)).sort()).toEqual(expected.evidence.sort());
    t.run(["check", join(f.root, "lab"), labCurrent, ...committed.sets["mandos-lab-data"].include.flatMap(x => ["--include", x]), "--download"]);
    const original = readFileSync(join(labCurrent, "user/settings.json"), "utf8"); const deleted = readFileSync(join(labCurrent, "logs/run.log"), "utf8");
    file(join(f.root, "lab"), "user/settings.json", original + " changed"); unlinkSync(join(f.root, "lab/logs/run.log")); backup(["push"], t.options);
    file(join(f.root, "lab"), "user/settings.json", original + " changed again"); backup(["push"], t.options);
    const archived = Object.entries(files(join(f.root, "remote/mandos-lab-data/archive")));
    expect(archived.some(([path, text]) => path.endsWith("/user/settings.json") && text === original)).toBe(true);
    expect(archived.some(([path, text]) => path.endsWith("/user/settings.json") && text === original + " changed")).toBe(true);
    expect(archived.some(([path, text]) => path.endsWith("/logs/run.log") && text === deleted)).toBe(true);
    const staging = structuredClone(f.config); staging.sets["mandos-lab-data"].local = "staging";
    backup(["pull", "mandos-lab-data"], { ...t.options, config: staging }); const stage = join(f.root, "staging");
    t.run(["check", labCurrent, stage, "--download"]);
    expect(() => backup(["pull", "mandos-lab-data"], { ...t.options, config: staging })).toThrow(/not empty/);
    file(stage, "user/settings.json", "deliberate synthetic corruption"); expect(() => t.run(["check", labCurrent, stage, "--download"])).toThrow();
    expect(readFileSync(join(labCurrent, "user/settings.json"), "utf8")).toBe(original + " changed again");
  }), 60000);
  it("refuses actual excluded-only/empty, hot, bad-anchor and reduced selections before any local-remote mutation", () => fixture(f => {
    expect(rcloneVersion()).toMatch(/^rclone v/); const t = real(f); const remoteRoot = join(f.root, "remote");
    file(remoteRoot, "mandos-lab-data/current/user/settings.json", "prior synthetic save"); file(remoteRoot, "mandos-lab-data/current/chromium/IndexedDB/db/data.ldb", "prior synthetic history");
    const before = files(remoteRoot); file(join(f.root, "lab"), "mods/mandos/excluded", "not selected");
    expect(() => backup(["push"], t.options)).toThrow(/empty selected/); expect(files(remoteRoot)).toEqual(before);
    file(join(f.root, "lab"), "user/settings.json", "selected"); expect(() => backup(["push"], t.options)).toThrow(/anchor/); expect(files(remoteRoot)).toEqual(before);
    file(join(f.root, "lab"), "chromium/IndexedDB/db/data.ldb", "selected history"); file(join(f.root, "lab"), "chromium/SingletonLock", "uncertain synthetic owner");
    expect(() => backup(["push"], t.options)).toThrow(/uncertain/); expect(files(remoteRoot)).toEqual(before); unlinkSync(join(f.root, "lab/chromium/SingletonLock"));
    // A later empty evidence set cannot let the otherwise valid first lab sync.
    expect(() => backup(["push"], t.options)).toThrow(/empty selected/); expect(files(remoteRoot)).toEqual(before);
    file(join(f.root, "evidence"), "lab-build.json", "synthetic identity");
    for (let n = 0; n < 12; n++) file(remoteRoot, `mandos-lab-data/current/user/old-${n}`, "older selected data");
    const reducedBefore = files(remoteRoot); expect(() => backup(["push"], t.options)).toThrow(/suspicious/); expect(files(remoteRoot)).toEqual(reducedBefore);
    expect(writes(t)).toEqual([]);
    backup(["push", "--allow-large-reduction"], t.options); expect(t.logs.some(line => line.includes("EXCEPTION --allow-large-reduction"))).toBe(true);
    expect(Object.keys(files(join(remoteRoot, "mandos-lab-data/archive"))).filter(path => /user\/old-/.test(path))).toHaveLength(12);
  }), 60000);
});
