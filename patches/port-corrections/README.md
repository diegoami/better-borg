# Independent faithful-port correction units

These are source/test provenance units, not pnpm engine patches. The source
tracker owns the Neo Borg defect; Mandos consumer issues own carry/adoption
state. A stored patch or work-branch commit is not a carried main correction.

- [port41](https://github.com/diegoami/neo-angband-borg-mod-tracker/issues/41),
  reviewed source2ee4f82f7f845674e6c12575afbcc7837ae713db:
  [Mandos196](https://github.com/diegoami/mandos/issues/196),
  [source41-light-base.patch](source41-light-base.patch). Start BI_LIGHT from
  the C zero base, avoiding a second addition of already-derived player light.
  The source also corrects beam/recovery unit-fixture model inputs without
  changing assertions. It deliberately preserves C238's duplicate modifier,
  whose independent Mandos unit belongs in c-translations.

Retire only after an equivalent accepted upstream TS correction is imported
and independently verified in Mandos. Keep unrelated C and engine units.
