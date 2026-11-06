# Agent entry: Mandos development and integration

This repository is diegoami/mandos (local better-borg). Read RULES.md,
PLAN.md, session.json, docs/SESSION.md and the latest checkpoint36 comment.

```sh
git status --short
gh issue view 36 -R diegoami/mandos --comments
node tools/check-session.mjs
```

This session owns Mandos-only defects, its product/strategy packs, harness,
records, lab tooling and verified adoption of delivered upstream fixes.
Current gameplay feature work stays parked unless explicitly requested.
It does not implement upstream Neo Borg, Neo engine or native C repairs.

Port defects and their fix branches live in diegoami/neo-angband-borg-mod-tracker
(`../neo-angband-borg-mod-tracker`). C Borg, Angband game and Neo engine defects
live in diegoami/neo-angband-tracker (`../neo-angband-tracker`). Link the canonical
owner issue and keep Mandos integration tasks distinct, with named package/plugin/lab consumer receipts.
Transferred historical issue URLs redirect; use qualified canonical refs for
new text. docs/migrations/repository-split.json is the transfer map.

The two fork workspaces have their own AGENTS/RULES/PLAN/checkpoint. The
umbrella owns orchestration, scoped dispatch, dependency handoffs and recovery
metadata; component sessions retain code/issue ownership. Preserve the existing live lab and
pristine reference checkouts; never silently switch their branches/data.
Broad upstream reconciliation is a weekly manual batch or explicit owner task;
use targeted checks for active blockers, source applicability and closure.
Do not proactively poll/fetch borg-rs: it reports directly to our engine/C board.
At active death-session start and stop, follow docs/deaths/DISCUSSIONS.md: reread
known case/action comments including edits, record ID/updated_at/body digest and
pending dispositions, and never treat an ACK as resolution or claim unattended
monitoring. See docs/process.md for the gate and adoption loop.
