#!/usr/bin/env node
/**
 * Back up the local-only state git cannot hold (docs/backup.md) to the owner's private Google Drive folder.
 * The shape is goal2's tools/artifacts.py (the owner's design): the location
 * is a committed JSON file (backup.json), the transfer is rclone.
 *
 *   node tools/backup.mjs where                where each set goes, and the remote
 *   node tools/backup.mjs push [SET...] [--dry-run]
 *   node tools/backup.mjs pull SET [--force] [--dry-run]
 *
 * push mirrors a set into <folder>/<set>/current; whatever a push would
 * overwrite or delete there moves to <folder>/<set>/archive/<UTC stamp>, so
 * no push ever loses an older copy. pull restores <set>/current into the
 * set's local directory and refuses a non-empty one without --force (a
 * restore over live data is the owner's decision).
 *
 * Only the files a set's `include` names travel: for the lab data base that
 * is the saves, graveyard and lineage (install storage, in the browser
 * profile's IndexedDB and Local Storage), restore points, settings and logs - never the
 * browser caches, and never the mod folder (a git clone of this repo).
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("./", import.meta.url)), "..");
const config = JSON.parse(readFileSync(join(ROOT, "backup.json"), "utf8"));
const { folderUrl, folderId, rcloneAccount } = config.drive;

function fail(message) {
  console.error(`backup: ${message}`);
  process.exit(1);
}

/** The rclone path of a set's subfolder: the account's login, the folder forced by id. */
function remote(path) {
  return `${rcloneAccount},root_folder_id=${folderId}:${path}`;
}

function rclone(args) {
  try {
    execFileSync("rclone", args, { stdio: "inherit" });
  } catch {
    fail(`rclone ${args[0]} failed (is rclone installed and the remote ${rcloneAccount} authorised? see backup.json)`);
  }
}

function filters(set) {
  return set.include.flatMap((pattern) => ["--include", pattern]);
}

const argv = process.argv.slice(2);
const command = argv[0];
const dryRun = argv.includes("--dry-run");
const force = argv.includes("--force");
const names = argv.slice(1).filter((a) => !a.startsWith("--"));
const sets = config.sets;
const pick = (list) => {
  for (const name of list) if (!(name in sets)) fail(`no set ${name} (sets: ${Object.keys(sets).join(", ")})`);
  return list.length > 0 ? list : Object.keys(sets);
};

if (command === "where") {
  console.log(`folder: ${folderUrl}`);
  console.log(`rclone: ${rcloneAccount} (folder forced by id ${folderId})`);
  for (const [name, set] of Object.entries(sets)) {
    console.log(`- ${name}: ${resolve(ROOT, set.local)} -> ${name}/current (${set.what})`);
  }
} else if (command === "push") {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..*$/, "Z");
  for (const name of pick(names)) {
    const set = sets[name];
    const local = resolve(ROOT, set.local);
    if (!existsSync(local)) fail(`${name}: no local directory ${local}`);
    console.log(`backup: ${name} -> ${name}/current${dryRun ? " (dry run)" : ""}`);
    rclone(["sync", local, remote(`${name}/current`), ...filters(set), "--backup-dir", remote(`${name}/archive/${stamp}`), ...(dryRun ? ["--dry-run"] : [])]);
  }
} else if (command === "pull") {
  if (names.length !== 1) fail("pull takes exactly one set");
  const [name] = pick(names);
  const local = resolve(ROOT, sets[name].local);
  if (existsSync(local) && readdirSync(local).length > 0 && !force) fail(`${local} is not empty - pass --force to restore over it`);
  console.log(`backup: ${name}/current -> ${local}${dryRun ? " (dry run)" : ""}`);
  rclone(["copy", remote(`${name}/current`), local, ...(dryRun ? ["--dry-run"] : [])]);
} else {
  console.log("usage: node tools/backup.mjs where | push [SET...] [--dry-run] | pull SET [--force] [--dry-run]");
  process.exit(command === undefined ? 0 : 1);
}
