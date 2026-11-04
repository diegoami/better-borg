# B54 seed provenance: warrior control

Kind: DEFECT in seed provenance and headless report forwarding.
This correction retains metadata without changing gameplay or RNG draws.

The Half-Troll Warrior cohort (seeds 20/23/34/49, cap 10000, stage c2d1)
remains 4/4 at decisions 204/582/153/343. Every per-life record equals
the B76 control except `meta.wallClockMs`. The engine pin now accurately
names the carried PR #433 alongside #429/#432.

The existing real death/archive test independently exercises seed 73's
death: it fails before the adapter correction because the archive omits
the seed, then passes after forwarding `GameState.masterSeed`.

This control proves unchanged gameplay for this cohort, not desktop
replay parity. The remaining birth/controller RNG mismatch stays in #54.
