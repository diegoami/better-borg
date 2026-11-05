# Response to independent reorganization review

The independent verdict is **CHANGES REQUESTED**. It remains the reviewer's verdict; these corrections do not replace independent approval. Scope: R1–R5, plus the small broken-anchor correction O3. Other optional suggestions are deferred below. No gameplay bug task, release, or deployment was started.

## R1 — publishing containment

Engine proposal [PR 172](https://github.com/diegoami/neo-angband-tracker/pull/172) restricts all 11 jobs in Neo release.yml, publish-npm.yml, pages.yml, mod-canary.yml and edge.yml to `github.repository == 'neostryder/neo-angband'`. Existing job predicates are conjoined with that guard, including always(); a skipped dependency cannot bypass it. FORK comments explain the intentional change. The guard checker runs in session CI; removing the guard from the always() release job fails a negative control. All workflow YAML parses successfully.

[Active tag ruleset 26648434](https://github.com/diegoami/neo-angband-tracker/rules/26648434) additionally prevents creation, update and deletion of `refs/tags/v*`, without bypass actors. It prevents importing an older unguarded product tag; existing tags are preserved. We did not trigger an actual publication to test containment. Repository/job predicates are false for our fork on tag/manual/release/schedule events. Settings separately retain disabled edge and native-C release.yaml; that native C workflow is distinct from Neo release.yml, which had never been registered.

Record corrections: Pages deployed the same gh-pages content (`fa84e1f`) at 2026-11-05T17:59Z. Workflow-only Pages does not undo that deployment. The extra fork-only tag `v1.23.0-edge.209` points at `836b8da2a553d9a5e567d5c56476623d501a7bec`; origin unknown, retained without movement/deletion. The earlier v1.23.0-edge.1 release stays draft with its original target and four assets.

Mandos github-release.yml remains intentionally active for product tags; no release tag is being pushed here. Mandos nexus-publish.yml is registered active, but its existing job-level guard admits only `neostryder/neo-angband-mod-borg`, so it cannot upload from diegoami/mandos, including on manual dispatch. This distinction was verified from source; we did not inspect or expose secret values. Port tracker release/Nexus/redirect workflows remain disabled.

## R2 — safe Mandos entry routing

AGENTS.md now names `diegoami/neo-angband-borg-mod-tracker` (`../neo-angband-borg-mod-tracker`) and `diegoami/neo-angband-tracker` (`../neo-angband-tracker`). Protected lab/reference checkouts are not task destinations. Source session maps already identify canonical directories; historical/protected-reference names there remain deliberate. No runtime paths were modified.

## R3 — disclose and track the red default-branch run

[Engine issue 171](https://github.com/diegoami/neo-angband-tracker/issues/171) tracks the post-merge failure. [Run 42096005784](https://github.com/diegoami/neo-angband-tracker/actions/runs/42096005784) at master `81d2fc87` failed because pressing C did not change the screen; its main test job passed. [PR run 42092779990](https://github.com/diegoami/neo-angband-tracker/actions/runs/42092779990) at the identical tree `68155760` passed. Existing smoke flakiness is suspected, not proven or waived. Root cause and any fix remain future engine work. The earlier global green claim was too broad. New PR and post-merge outcomes must be recorded separately.

## R4 — durable review records and fresh-clone access

The dossier, review request, original reviewer file and this response are versioned together under Mandos `docs/migrations/reorganization-review/`. The independent review is copied byte for byte; its verdict and limits are untouched. The coordinator dossier has explicit corrections next to historical claims. [Directory index](https://github.com/diegoami/mandos/tree/main/docs/migrations/reorganization-review) provides remote access. New comments on all three checkpoint issues and engine tracker #2 use durable links rather than requiring an umbrella checkout. The original umbrella copies remain useful local entry points. The reviewer alone may issue an updated approval.

## R5 — upstream-present resolution evidence

[Port source issue 3](https://github.com/diegoami/neo-angband-borg-mod-tracker/issues/3) and [Mandos consumer 127](https://github.com/diegoami/mandos/issues/127) now explicitly cite accepted upstream source `74a017d2f695939eb2f046b7c9ff286ef1e82568`: core-api.ts:398–408 (rememberedCell), :447 (wrapped cell accessor), :549–550 (hostController), perceive.ts:177–186 (map ingestion), item/light.ts:159–169 and :254 (decision sites). Links include pinned line anchors. The correction was already upstream in cfd89df and the earlier import 1fa2f8d. The open engine report #415 is not used as proof of resolution.

The stale source-body carried line is explicitly corrected to upstream-fixed/adopted. Consumer #127 stays fixed/closed because the code is upstream-present and adopted with existing site regressions/full-gate receipts, not because a local proposal exists. Older hosts without knownFeat fall through and are outside that resolution. No new runtime/deployment claim is made.

## Optional suggestions

O3's C handoff anchor is fixed in PR 172. O1/O2/O4–O9 remain suggestions, not silently completed work. In particular keep port #25's next step as engine-bundle attribution and route a proven engine hunk to the engine tracker; no single-hunk cause has been established. Future upkeep can address native technical-doc preservation, native guard filename, source-base wording, duplicate monitor drift and push guards without reopening the architecture.

## Validation and remaining approval

Focused local checks: engine/Mandos session guards; all 8 source/intake Node tests; all 11 workflow guards; negative control rejecting an unguarded always() publisher; workflow YAML parse; diff whitespace checks. Final CI outcomes and exact merge commits belong on the three linked checkpoint issues and engine tracker #2; this response does not pre-claim their success. The independent reviewer already reran native C (965 unit + 5 frontend passed); native C/runtime source is unchanged by these corrections, so no new C gate was needed. The published port baseline's four known failures remain tracked; no claim that it is green.

Independent re-review is still required. Engine issue #2 remains open/in-review; this response is not an approval.
