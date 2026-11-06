# Mandos working rules

1. Scope is Mandos-only development/integration, harness/lab and owner work.
   Upstream port fixes belong in diegoami/neo-angband-borg-mod-tracker; C Borg/C game/
   Neo engine fixes belong in diegoami/neo-angband-tracker. Do not fix a different
   repository silently or duplicate its authoritative defect state here.
2. Read AGENTS/PLAN/session.json and checkpoint36 before acting. Reconcile
   boards/source/current bug state first, then triage/list maintenance, then
   implementation. Use qualified cross-repo refs and canonical issue URLs.
3. A bug outranks a new feature. Current new strategies/learning/fatal-state
   snapshots/unattended stage-resume features stay parked unless the owner
   explicitly authorizes them. Restoring C parity is a defect, not a strategy.
4. Mandos remains class-agnostic; class/build policy belongs under src/class.
   Every behavior change names its reach-rate stage/cohort or relevant proxy.
   Mark intentional divergence FORK with source reference and what/why.
5. The mod obeys declared APIs; no privileged engine reads or network/wall
   clock in its controller. Determinism is required. Offline tools produce
   frozen data; do not sneak new gameplay policy into an integration fix.
6. Full changes use pnpm verify as the merge gate: typecheck, session check,
   tests and committed plugin currency. The narrow prose-only gate in docs/CI.md
   checks metadata/docs/privacy; unknown and workflow changes stay full.
   Relevant tests must execute; CI missing content fails.
   Use the pinned published engine plus named carried patches by default.
   Local-core testing is an explicit opt-in and must not masquerade as published.
7. Adopt upstream corrections with local changes, rebuild and verify actual
   package/plugin/harness/lab consumers before closing an adoption task. A
   source merge is not a running-app deployment. No release wait alone.
   Source forks do not have consumer carry/fixed/patch-active tags. Linked
   Mandos issues own those states: carried means fixed on our side and OPEN
   until the correction is fixed upstream AND adopted downstream, rebuilt and
   verified. Then fixed/CLOSED. Partial scope stays open; patch-active remains
   on required consumer backports independently of closure. A file/proposal is
   not applied.
   Close the original resolved scope once the accepted upstream correction is
   adopted and normal required consumer checks pass. Do not keep it open for
   hypothetical residual concerns. Partial requires an identified unapplied or
   unverified component; a concrete post-adoption failure gets a new linked bug.
8. Keep C defect catalogue, native evidence and active C proposals canonical
   in the engine/C fork. Historical Mandos evidence/patch copies stay immutable
   for old links. No angband/angband issues, PRs or comments from us; C posting
   pause persists. A faithful inherited C defect is not a Neo port omission.
9. Git history/tags/credit remain intact. No amend/force-push. Owned default
   branches now contain session docs; integrate upstream without resetting
   those commits. Isolated source proposals start from correct pristine bases
   in their owning session, excluding bootstrap docs. Preserve topic heads.
10. Committed docs/runs records and evidence are append-only. Preserve owner
    saves, browser profiles and mandos-lab-data. Keep old lab/reference trees
    untouched unless the owner task explicitly requires their update.
11. Coordinate one heavy local gate across sessions with flock
    /tmp/angband-validation.lock; log/watch background gates. Do not start
    background agents without owner direction. Reviews are read-only. No
    AI-attribution trailers; retain AI_USAGE_POLICY and upstream licences.
12. Checkpoint36 and owner issues hold durable decisions/receipts. Update
    monitors, patch ledger, affected docs and consumer state at merge/stop.
    A question alone is not an edit request; explicit owner tasks override
    local process defaults. Current source/issue evidence overrides old history.

13. C correction translation is Mandos work: link the canonical C issue,
    establish applicability, translate into TS under declared Neo APIs and
    prove matching legal scenarios/controls on our runtime. No counterpart
    means not applicable, not an invented patch. Keep the change marked as
    a Mandos divergence from an unchanged C baseline until upstream alignment.
    Do not send it to the fidelity-only port tracker as a port omission.
    carried stays open until the C source correction is fixed upstream and
    adopted/verified downstream; Rust translation is borg-rs's independent work.
