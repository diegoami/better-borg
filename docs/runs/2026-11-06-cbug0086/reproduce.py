#!/usr/bin/env python3
"""Repeat the pinned Mandos CBUG-0086 public-message comparison in fresh trees."""
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile

BASE = "2690ae09c4166332fa9f5ff8f032e0fb52327bcc"
FIX = "81600f90ab4e780a05333eb4aa4a988ed431c518"
TEST = "src/perceive-unseen-name.test.ts"
FIXTURE_SHA = "3e3665158d6748cced1ce094d8e9288d03bc84b19446fc9fe4586b20a4a9bc92"


def git(root, *args):
    return subprocess.check_output(["git", "-C", str(root), *args])


def main():
    root = Path(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip())
    if not (root / "node_modules").is_dir():
        raise SystemExit("Run pnpm install --frozen-lockfile in the matching Mandos checkout first")
    for file in ("package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml"):
        if (root / file).read_bytes() != git(root, "show", f"{BASE}:{file}"):
            raise SystemExit(f"Dependency declaration differs from pinned profile: {file}")
    version = subprocess.check_output(["node", "--version"], text=True).strip()
    if version != "v24.21.0":
        raise SystemExit("Select measured Node24.21.0 before running this comparison")
    pnpm = subprocess.check_output(["pnpm", "--version"], text=True).strip()
    if pnpm != "12.16.1":
        raise SystemExit("Use pnpm12.16.1 from the pinned package manifest")
    fixture = git(root, "show", f"{FIX}:{TEST}")
    if hashlib.sha256(fixture).hexdigest() != FIXTURE_SHA:
        raise SystemExit("Pinned fixture hash differs")
    result = Path(tempfile.mkdtemp(prefix="mandos-cbug0086-replay-"))
    env = os.environ.copy()
    env.pop("NEO_ANGBAND_LOCAL_CORE", None)
    env.pop("NEO_ANGBAND_REPO", None)
    env.update(CI="1", NO_COLOR="1")
    records = {}
    for label, pin, expected in (("before", BASE, 1), ("after", FIX, 0)):
        tree = result / label
        subprocess.run(["git", "-C", str(root), "worktree", "add", "--detach", str(tree), pin], check=True)
        (tree / TEST).write_bytes(fixture)
        (tree / "node_modules").symlink_to((root / "node_modules").resolve(), target_is_directory=True)
        output = result / f"{label}.json"
        env["CBUG0086_OUTPUT"] = str(output)
        with (result / f"{label}.log").open("w") as log:
            run = subprocess.run(["flock", "/tmp/angband-validation.lock", "pnpm", "exec", "vitest", "run", TEST], cwd=tree, env=env, stdout=log, stderr=subprocess.STDOUT)
        (result / f"{label}.exit").write_text(str(run.returncode) + "\n")
        if run.returncode != expected:
            raise SystemExit(f"Unexpected {label} exit {run.returncode}; inspect {result}")
        text = re.sub(r"\x1b\[[0-9;]*m", "", (result / f"{label}.log").read_text())
        expected_summary = "2 failed | 4 passed (6)" if label == "before" else "6 passed (6)"
        if expected_summary not in text:
            raise SystemExit(f"Unexpected {label} summary; inspect {result}")
        records[label] = json.loads(output.read_text())
    before, after = records["before"], records["after"]
    assert len(before) == len(after) == 6
    assert before[2:] == after[2:], "A complete control observation changed"
    assert all(case["spent"] == 1 and case["stamp"] == 100 for case in before[:2])
    assert all(case["spent"] == 0 and case["stamp"] == 0 for case in after[:2])
    manifest = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in result.iterdir() if p.is_file()}
    (result / "SHA256SUMS.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print("Before:2 expected failures/4 controls; after:6 passes; complete four controls unchanged")
    print(f"Full logs, observation JSON, exit codes and hashes: {result}")
    print("No world turns, monster attack, HP-loss or survival claim; full consumer gate is separate")


if __name__ == "__main__":
    main()
