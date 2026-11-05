# Carried engine fixes and internal C proposals

GitHub tracker carry labels describe applied main/consumer coverage. A stored
patch can still be not-carried. Read each issue for the latest deployment and
release adoption; this index identifies the source and the removal unit.

The single pnpm patch for core1.23.0-beta.2 contains independent marked groups:

| Source | Tracker | Patched component | Remove only when |
| --- | --- | --- | --- |
| Neo PR429 / issue428 | #13 | live setFeat noteSpot | adopted published implementation passes the door scenario |
| Neo PR432 / issue414 | #41 | disturb input-flush | adopted implementation passes input reset tests |
| Neo PR433 / issue431 | #42 | original seed and accepted birth input, save/load | adopted implementation reproduces recorded births/replays |
| Neo commit0cc75b4af | #100 | player/bind actual spell count | adopted package resolves every class-wide spell index correctly |

Authoritative PR branches remain in diegoami/neo-angband. The last row is
already on Neo master and needs no duplicate PR. The pnpm package and our lab
branch are separate consumers; a public merge alone updates neither.
New records name PRs and accepted non-PR commits through tools/engine-pin.mjs.

C proposals under upstream-c/ affect the original C game only. The B94
map-dump guard has a native C reproduction in docs/audit/c-reports/B94/ and
is internal pending owner approval. It is not applied to a maintained C
consumer or to the TypeScript engine/Borg. The B87 lighting proposal is
still held on its draft branch because meaningful impact remains unproven.
