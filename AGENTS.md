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

Port defects and their fix branches live in our neo-angband-mod-borg fork
session. C Borg, Angband game and Neo engine defects live in our neo-angband
fork's combined session. Link the canonical owner issue and keep Mandos
integration tasks distinct, with named package/plugin/lab consumer receipts.
Transferred historical issue URLs redirect; use qualified canonical refs for
new text. docs/migrations/repository-split.json is the transfer map.

The two fork workspaces have their own AGENTS/RULES/PLAN/checkpoint. The
umbrella directory only routes sessions. Preserve the existing live lab and
pristine reference checkouts; never silently switch their branches/data.
See docs/process.md for the Mandos gate and adoption loop.
