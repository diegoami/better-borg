# Active-session death discussion reads

**PARKED / OPTIONAL — advanced feedback workflow.**
The [current consumer scope](../MANDOS-SCOPE.md) supersedes this as routine
startup work. Read current bug/source/action comments for active fixes, but do
not launch a per-death feedback pilot, expand166, or make this protocol a default
upgrade gate. The contract/code/receipts below are preserved reference for a
separately authorized optional investigation. No daemon or task migration exists.

This is the manual session contract for Mandos166. It does not install a
watcher, create per-case investigations or implement the later feedback pilot.
Existing corpus facts and reports remain immutable. The parent comparison is
[the approved three-slice plan](https://github.com/diegoami/angband-workspace/blob/459a5d2621674178be7b8bf773bae8047ac99e5c/docs/coordination/MANDOS-DEATH-WORKFLOW-COMPARISON.md).

At the **start and stop of an active death-analysis session**, read the current
canonical investigation/discussion and linked action threads for that case.
Until a per-case investigation exists, record that gap and use the explicit
owner task (currently166), rather than claiming every death thread is covered.
Read known source links only as needed for applicability/closure; broad upstream
reconciliation is a weekly manual batch or an explicit owner request.

Fetch all comments on each known thread, including older comments which may
have been edited. For example:

```sh
gh api repos/diegoami/mandos/issues/166/comments --paginate
```

Keep an append-only, small read receipt under `docs/deaths/feedback-reads/` or
on the canonical task/checkpoint. Record the thread URL, observation time,
comment ID, `updated_at`, SHA-256 of the UTF-8 body, author, a manually assigned
actor role, and the disposition/pending action. Compare with the previous read
by **ID + updated_at + body digest**; a highest-ID cursor alone misses edits.
If a fetch fails, record incomplete coverage and retry during the active
session. Do not call an unread thread current. Preserve earlier receipts.

An agent must label its own replies **Agent receipt** or **Agent findings**.
The shared GitHub login cannot distinguish an agent from the owner: use the
marked reply and conversation context, not account name alone. Retain ambiguous
items as needing triage. Agent receipts are not automatically new owner requests.

For each new/edited owner item: record it, acknowledge it without claiming it
solved, triage against actual evidence and existing issues, link the canonical
bug/action or explicitly unresolved question, reply with findings/evidence and
remaining gaps, then update the current assessment/aggregate. A read, an ACK,
a patch proposal, an endpoint match or a policy hypothesis is **not resolution**
or a verified fix. Keep observation, hypothesis, policy proposal and verified
correction separate. Reusable original-C defects route to the engine/C tracker;
TS behavior remains Mandos-owned. Bugs outrank discretionary analysis.

At stop, reread the targeted threads, identify edits/new items since start,
record pending dispositions and hand off uncompleted work on166/checkpoint36.
This contract promises reads only at active-session boundaries, not unattended
monitoring between sessions. One-case Discuss links, feedback events and derived
current views remain slice2, with fidelity/attempt accounting in slice3.
