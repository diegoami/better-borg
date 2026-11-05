# Independent review request: repository reorganization

Owner requests an independent assessment of all three managed repositories and
the combined repository's native C worktree. The coordinator has implemented
and merged the rework, performed a consistency pass and written the complete
context in [REPOSITORY-REORGANIZATION.md](REPOSITORY-REORGANIZATION.md).
That document is evidence/claims to verify, **not an approval to copy**.

## Scope and reviewed state

- `<ANGBAND_WORKSPACE>/neo-angband-tracker` — master `81d2fc873472014e3ba870b4e115bf4bfa0cf484`; C Borg/C Angband + Neo engine source tracker.
- `<ANGBAND_WORKSPACE>/neo-angband-tracker/.worktrees/angband-c` — workbench/c-borg `23aaf89aea93592227ff807f647fb3e68ad81998`; same repository/session, native C source.
- `<ANGBAND_WORKSPACE>/neo-angband-borg-mod-tracker` — master `33552ab8504f5431d02f63a3b340757a47739661`; fidelity-only Neo Borg port source tracker.
- `<ANGBAND_WORKSPACE>/better-borg` — main `a783c2535cf4eee7bc61f2e1cfda329543ed0ee3`; Mandos development and consumer adoption/C→TS translation.

If a head has advanced, state the actual head and diff reviewed; do not silently
assume the old evidence proves later changes. Read umbrella AGENTS/SESSIONS and
each repository's AGENTS/RULES/PLAN/session.json/checkpoint. Explicit owner-
authorized cross-repository review may operate from this umbrella without
starting a component implementation queue.

## Mandatory reviewer-owned output

Write a new file in **this same directory**:
`<ANGBAND_WORKSPACE>/REPOSITORY-REORGANIZATION-REVIEW.md`.
If another reviewer already owns that file, use
`REPOSITORY-REORGANIZATION-REVIEW-<reviewer>.md` and name it in your response.
Do not overwrite another review or edit the coordinator report into an approval.

The review must contain:

1. **Verdict:** exactly APPROVED, CHANGES REQUESTED or BLOCKED, with a short reason.
2. **Scope:** repository/branch/commit heads actually inspected and whether all
   three repositories plus the native C mode were covered.
3. **Findings:** stable IDs (R1,etc), severity/blocking level, precise file/line,
   config/API or canonical issue evidence, consequence and a concrete requested
   correction. Separate required changes from optional suggestions.
4. **Verification:** commands/tests/API/links/receipts checked, actual outcomes,
   and things deliberately not verified. Do not imply native baseline unit
   success proves all C candidates or a patched bundle proves one hunk.
5. **Consistency assessment:** whether source ownership, consumer lifecycle,
   translation/fidelity boundaries, workspaces/bases and source ingestion form
   a coherent operational model.
6. **Change-request acceptance criteria:** what must be shown before each
   blocker is considered resolved; no source edits performed by the reviewer.
7. **Residual risks/open questions:** inherited failures versus rework issues,
   ambiguous historical references, future automation/intake limits and any
   optional better-borg-c design concerns. Clearly distinguish implemented
   structure from the future product convention that was only discussed.

APPROVED is appropriate only if no blocking correctness/ownership/bootstrap/
safety/evidence gap remains. Optional suggestions may accompany approval.
CHANGES REQUESTED is for actionable blockers. BLOCKED is for unavailable access
or evidence preventing a sound verdict; explain exactly what is missing.

## Particular checks the owner needs

- Does the combined README clearly own original C Angband (especially the Borg)
  **and** Neo engine proper, without conflating the mod or product consumer?
- Is the native C tree actually in the same fork but at the correct C base,
  with working native commands and no proposal accidentally based on Neo master?
- Does the mod tracker repair C fidelity rather than translate proposed C fixes?
- Does Mandos own applicable C Borg→TS correction translation under declared
  APIs, while engine implementation stays in the engine tracker and Rust stays
  independent/no-Neo? Are not-applicable cases treated honestly?
- Are source issues free of carried/fixed/partial/not-carried/patch-active tags?
  Do linked Mandos consumers remain carried/open until upstream correction AND
  verified downstream adoption, and fixed/closed only then? Are own-only bugs
  free from a fictional upstream dependency?
- Were47 actual transfers/history/redirects and26 bidirectional consumer links
  preserved? Are152 finding links distinct, with provenance/confidence intact,
  and the C landing page pointing to issues instead of a duplicate live list?
- Does borg-rs intake support file/issues/direct posts, dedup and C-vs-Rust-only
  classification without automatic promotion/application or Rust code changes?
- Can fresh independent sessions bootstrap from default branches/remotes,
  including the native worktree, hooks and the correct Node/pnpm/C toolchains?
- Are active publishing/deployment/redirect automations contained while CI works?
  Verify the unintended edge draft/tag/assets account rather than ignoring it.
- Do the eight original source PRs still have correct unchanged heads/bases and
  appropriate targets after renames/default docs? Does the fix workflow exclude
  our owned bootstrap commits from upstream proposals?
- Were runtime source and protected lab/save/data left unchanged? Are published
  port failures, patched-control limits, inherited skips and original doc/test
  contracts reported honestly rather than waived?

## Review permissions and exclusions

This is read-only with respect to repositories, issue histories/labels,
workflows, releases, tags and deployment. You may write your review file and
isolated ephemeral scratch evidence; do not implement fixes, transfer issues,
merge PRs, publish, mutate Rust or touch owner lab/browser/save data. Do not
run the one-off migration scripts. Safe static checks and receipt inspection
are listed in the main report; live watches need isolated cache paths if used.
The reviewer may use read-only gh/API access. No messages/posts to other people
or official Angband submissions are requested by this review prompt.

An independent model/reviewer is owner-selected. The coordinator's consistency
pass and merged PRs do not preselect your verdict. Return the exact filename
written and a concise verdict/findings summary when finished.
