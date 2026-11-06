#!/usr/bin/env node
/** Cold private-data transport. See docs/backup.md. Credentials stay in rclone. */
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, lstatSync, readFileSync, readlinkSync, readdirSync, realpathSync, statSync } from "node:fs";
import { hostname } from "node:os";
import { basename, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../", import.meta.url)));
const LIMITS = Object.freeze({ deletedFiles: 10, deletedFraction: 0.2, retainedBytes: 0.5 });
const LOCKS = ["SingletonLock", "SingletonCookie", "SingletonSocket"];
const browser = name => /electron|chrom(?:e|ium)|neo[-_ ]?angband/i.test(name);
const within = (path, root) => { const rel = relative(root, path); return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel)); };
const canonical = path => { try { return realpathSync(path); } catch { return resolve(path); } };
const present = path => { try { return lstatSync(path); } catch (error) { if (error.code === "ENOENT") return null; throw error; } };
export const filters = set => set.include.flatMap(pattern => ["--include", pattern]);

/** Process identity/cwd only. Never read argv, environment, or credential files. */
export function processSnapshot() {
  if (process.platform === "win32") {
    return execFileSync("tasklist", ["/FO", "CSV", "/NH"], { encoding: "utf8" }).split(/\r?\n/).flatMap(line => {
      const match = /^"([^"]+)","(\d+)"/.exec(line);
      return match ? [{ name: match[1], pid: Number(match[2]), cwd: null }] : [];
    });
  }
  return execFileSync("ps", ["-A", "-o", "pid=,comm="], { encoding: "utf8" }).split("\n").flatMap(line => {
    const match = /^\s*(\d+)\s+(.+?)\s*$/.exec(line);
    if (!match) return [];
    const pid = Number(match[1]), name = basename(match[2]);
    let cwd = null;
    if (browser(name)) {
      try { cwd = readlinkSync(`/proc/${pid}/cwd`); } catch { /* Unavailable cwd is uncertain, not proof of coldness. */ }
    }
    return [{ pid, name, cwd }];
  });
}

export function coldProfile(local, set, { root, processes, confirmCold = false, log }) {
  const profile = set.preflight?.profileDirectory;
  if (!profile) return;
  const profileRoot = join(local, profile);
  const scopes = [canonical(local), ...(set.preflight.processDirectory ? [canonical(resolve(root, set.preflight.processDirectory))] : [])];
  let rows = [], uncertain = false;
  try {
    rows = processes();
    if (!Array.isArray(rows) || rows.some(row => !Number.isInteger(row.pid) || typeof row.name !== "string" || (row.cwd !== null && typeof row.cwd !== "string"))) throw Error("Invalid process evidence");
  } catch { rows = []; uncertain = true; }
  const candidates = rows.filter(row => browser(row.name));
  if (candidates.some(row => row.cwd && scopes.some(scope => within(canonical(row.cwd), scope)))) {
    throw Error("lab profile is in use (configured lab/profile process); close it normally before retrying");
  }
  const markers = LOCKS.filter(name => present(join(profileRoot, name)));
  const lock = join(profileRoot, "SingletonLock");
  if (present(lock)?.isSymbolicLink()) {
    const owner = readlinkSync(lock), prefix = `${hostname()}-`;
    if (owner.startsWith(prefix) && /^\d+$/.test(owner.slice(prefix.length))) {
      const pid = Number(owner.slice(prefix.length));
      if (candidates.some(row => row.pid === pid)) throw Error("lab profile is in use (live SingletonLock owner); close it normally before retrying");
    }
  }
  // DevToolsActivePort and persistent LevelDB LOCK files alone are not live locks.
  // Known unrelated process cwd is ignored; unreadable cwd remains uncertain.
  uncertain ||= candidates.some(row => row.cwd === null) || markers.length > 0;
  if (uncertain && !confirmCold) throw Error("lab cold state is uncertain (lock marker/process evidence); inspect without clearing locks, then explicitly --confirm-cold-profile only after confirming it is closed");
  if (confirmCold) log("backup: EXCEPTION --confirm-cold-profile: operator confirms configured profile is closed; known live owners remain forbidden");
}

function inventory(run, path, extra = [], missing = false) {
  let result;
  try { result = run(["lsjson", path, "--recursive", "--files-only", ...extra]); }
  catch (error) { if (missing && error.status === 3) return []; throw Error("cannot read backup inventory; refusing before sync (check rclone availability/access separately)"); }
  let rows;
  try { rows = JSON.parse(result); } catch { throw Error("invalid backup inventory; refusing before sync"); }
  if (!Array.isArray(rows) || rows.some(row => typeof row.Path !== "string" || !row.Path || row.Path.split("/").some(part => part === ".." || !part) || isAbsolute(row.Path) || row.IsDir || !Number.isSafeInteger(row.Size) || row.Size < 0)) throw Error("invalid backup file metadata; refusing before sync");
  return rows;
}
const bytes = rows => rows.reduce((sum, row) => sum + row.Size, 0);
const fingerprint = rows => JSON.stringify(rows.map(row => [row.Path, row.Size, row.ModTime ?? ""]).sort((a, b) => a[0].localeCompare(b[0])));

export function validateSelection(name, rows, set) {
  if (!rows.length || !rows.some(row => row.Size > 0)) throw Error(`${name}: empty selected source (included nonempty files are required)`);
  for (const prefix of set.preflight?.requiredPrefixes ?? []) {
    if (!rows.some(row => row.Path.startsWith(prefix) && row.Size > 0)) throw Error(`${name}: missing nonempty selected anchor ${prefix}`);
  }
}
export function reductionGuard(name, source, current, allowReduction = false) {
  const paths = new Set(source.map(row => row.Path));
  const deleted = current.filter(row => !paths.has(row.Path)).length;
  const budget = allowReduction ? current.length : Math.min(LIMITS.deletedFiles, Math.floor(current.length * LIMITS.deletedFraction));
  if (!allowReduction && (deleted > budget || (bytes(current) > 0 && bytes(source) < bytes(current) * LIMITS.retainedBytes))) throw Error(`${name}: suspicious backup reduction (${deleted}/${current.length} missing files; ${bytes(source)}/${bytes(current)} bytes); inspect source and current before explicit --allow-large-reduction`);
  return { budget, deleted, sourceFiles: source.length, currentFiles: current.length };
}

/** Injectable transport/process metadata keeps fixtures entirely local and secret-free. */
export function backup(argv, options = {}) {
  const root = options.root ?? ROOT;
  const config = options.config ?? JSON.parse(readFileSync(join(root, "backup.json"), "utf8"));
  const run = options.run ?? (args => execFileSync("rclone", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] }));
  const log = options.log ?? console.log;
  const remote = options.remote ?? (path => `${config.drive.rcloneAccount},root_folder_id=${config.drive.folderId}:${path}`);
  const processes = options.processes ?? processSnapshot;
  const [command, ...args] = argv;
  const allowed = command === "push" ? ["--dry-run", "--confirm-cold-profile", "--allow-large-reduction"] : command === "pull" ? ["--dry-run", "--force", "--confirm-cold-profile"] : [];
  for (const arg of args) if (arg.startsWith("--") && !allowed.includes(arg)) throw Error(`unknown option ${arg}`);
  const names = args.filter(arg => !arg.startsWith("--"));
  const dryRun = args.includes("--dry-run"), confirmCold = args.includes("--confirm-cold-profile"), allowReduction = args.includes("--allow-large-reduction");
  for (const name of names) if (!Object.hasOwn(config.sets, name)) throw Error(`no backup set ${name}`);
  const chosen = [...new Set(names.length ? names : Object.keys(config.sets))];
  const cold = (local, set) => coldProfile(local, set, { root, processes, confirmCold, log });
  if (command === "where") {
    log(`folder: ${config.drive.folderUrl}`);
    for (const [name, set] of Object.entries(config.sets)) log(`- ${name}: ${resolve(root, set.local)} -> ${name}/current (${set.what})`);
    return;
  }
  if (command === "push") {
    // ALL local sets, anchors and cold states are validated before any remote write.
    const plans = chosen.map(name => {
      const set = config.sets[name], local = resolve(root, set.local);
      if (!existsSync(local) || !statSync(local).isDirectory()) throw Error(`${name}: no local directory`);
      cold(local, set);
      const selected = inventory(run, local, filters(set));
      validateSelection(name, selected, set);
      return { name, set, local, selected };
    });
    for (const plan of plans) {
      const current = inventory(run, remote(`${plan.name}/current`), [], true);
      plan.reduction = reductionGuard(plan.name, plan.selected, current, allowReduction);
    }
    // Catch a source/profile changed during remote inventory, still before ANY sync.
    for (const plan of plans) {
      cold(plan.local, plan.set);
      const fresh = inventory(run, plan.local, filters(plan.set));
      validateSelection(plan.name, fresh, plan.set);
      if (fingerprint(fresh) !== fingerprint(plan.selected)) throw Error(`${plan.name}: selected source changed during preflight; close/quiesce it before retrying`);
    }
    const stamp = `${(options.now?.() ?? new Date()).toISOString().replace(/[-:]/g, "").replace(/\..*$/, "Z")}-${randomUUID()}`;
    if (allowReduction) log("backup: EXCEPTION --allow-large-reduction: reviewed reduction accepted; empty/anchor/cold checks remain mandatory");
    for (const { name, set, local, reduction } of plans) {
      log(`backup: ${name} -> ${name}/current (${reduction.sourceFiles} selected; ${reduction.deleted} missing; delete ceiling ${reduction.budget})${dryRun ? " (dry run)" : ""}`);
      try { run(["sync", local, remote(`${name}/current`), ...filters(set), "--backup-dir", remote(`${name}/archive/${stamp}`), "--check-first", "--max-delete", String(reduction.budget), ...(dryRun ? ["--dry-run"] : [])]); }
      catch { throw Error(`${name}: rclone sync failed; inspect current/archive and verify before retrying`); }
    }
    return { sets: plans.length };
  }
  if (command === "pull") {
    if (names.length !== 1) throw Error("pull takes exactly one set");
    const name = names[0], set = config.sets[name], local = resolve(root, set.local);
    if (existsSync(local) && readdirSync(local).length > 0 && !args.includes("--force")) throw Error("restore target is not empty; use empty staging (explicit --force is exceptional)");
    cold(local, set);
    validateSelection(name, inventory(run, remote(`${name}/current`)), set);
    if (args.includes("--force")) log("backup: EXCEPTION --force: operator explicitly requested a restore overlay; verify staging before live use");
    log(`backup: ${name}/current -> staging${dryRun ? " (dry run)" : ""}`);
    try { run(["copy", remote(`${name}/current`), local, ...(dryRun ? ["--dry-run"] : [])]); }
    catch { throw Error(`${name}: rclone copy failed; verify staging before any live use`); }
    return;
  }
  throw Error("usage: node tools/backup.mjs where | push [SET...] [--dry-run] [--confirm-cold-profile] [--allow-large-reduction] | pull SET [--force] [--dry-run] [--confirm-cold-profile]");
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { backup(process.argv.slice(2)); }
  catch (error) { console.error(`backup: ${error.message}`); process.exitCode = 1; }
}
