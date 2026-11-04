# C Borg fixes carried for upstream review

These patches target the official Angband C source, not the published
TypeScript engine package. Each candidate is tracked on a Mandos issue
labelled `upstream-c`; process section 6 requires real C engine/C Borg
validation, duplicate checking, an internal report and explicit owner OK
before external submission.

## B87 west-side light coverage

- Internal proposal: [#89](https://github.com/diegoami/mandos/issues/89).
- Mandos correction: [#87](https://github.com/diegoami/mandos/issues/87).
- [Patch](B87-west-light.patch): only the two west-arm y offsets in
  `src/borg/borg-cave-light.c`; no observation hooks.
- Tested official base: `e473720ed88a0f0c7ca66815cef3000eb4a38bc3`.
- [C report and reproduction commands](../../docs/audit/c-reports/B87/README.md).
- Credit: [borg-rs's C bug catalogue, entry 4](https://github.com/diegoami/borg-rs/blob/613227bc53c4f0e77ec457d5721febe9cf8bfe03/docs/c-bugs.md#4-west-of-the-player-lights-the-wrong-grids).

From a clean checkout of the tested official C revision:

```sh
git apply --check /path/to/mandos/patches/upstream-c/B87-west-light.patch
git apply /path/to/mandos/patches/upstream-c/B87-west-light.patch
```

The patch was verified to produce the tested corrected C source, with the
separate observer removed. The equivalent Mandos change is in
`src/perceive.ts`; this C patch is not wired into pnpm's TypeScript package
patching. Do not remove the carried correction merely because a report or
PR is posted; record adoption of an upstream revision that includes it.
