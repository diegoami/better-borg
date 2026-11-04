# Reproduce B87 in the C engine and C Borg

Run from a Mandos checkout containing this report and its separate carry
patch. This uses a new temporary directory and never touches a live profile.
Needs git, Python venv/pip, GCC, make, X11 development files (the default
CMake configuration enables that frontend), xz and cmp. It runs headlessly.

```sh
set -eu
MANDOS_B87_SOURCE=$PWD
MANDOS_B87_WORK=$(mktemp -d /tmp/mandos-b87-reproduce.XXXXXX)

git clone --depth 1 --branch claude/serene-ramanujan-8hzsfm \
  https://github.com/diegoami/borg-rs.git "$MANDOS_B87_WORK/source"
cd "$MANDOS_B87_WORK/source"
git fetch --depth 1 origin 613227bc53c4f0e77ec457d5721febe9cf8bfe03
git checkout --detach 613227bc53c4f0e77ec457d5721febe9cf8bfe03
git fetch --depth 100 https://github.com/angband/angband.git \
  e473720ed88a0f0c7ca66815cef3000eb4a38bc3
git diff --exit-code FETCH_HEAD:src/borg HEAD:angband/src/borg

python3 -m venv "$MANDOS_B87_WORK/tools"
"$MANDOS_B87_WORK/tools/bin/python" -m pip install cmake==4.4.4
"$MANDOS_B87_WORK/tools/bin/cmake" -S angband -B build/c \
  -DCMAKE_BUILD_TYPE=Release -DSUPPORT_BORG_HARNESS=ON \
  -DCMAKE_EXPORT_COMPILE_COMMANDS=ON -DBORG_IMPL=c
timeout 600s "$MANDOS_B87_WORK/tools/bin/cmake" --build build/c --parallel 2

timeout 120s env BORG_IMPL=c harness/run.sh \
  "$MANDOS_B87_WORK/baseline" 1000 0 0 100000
xz -dc harness/reference/full/full-0-warrior-0/keys.log.xz | \
  cmp - "$MANDOS_B87_WORK/baseline/keys.log"

git apply \
  "$MANDOS_B87_SOURCE/docs/audit/c-reports/B87/observation-only.patch"
timeout 120s "$MANDOS_B87_WORK/tools/bin/cmake" --build build/c --parallel 2
timeout 120s env BORG_IMPL=c harness/run.sh \
  "$MANDOS_B87_WORK/before" 1000 0 0 100000
cmp "$MANDOS_B87_WORK/baseline/keys.log" "$MANDOS_B87_WORK/before/keys.log"

git apply --directory=angband \
  "$MANDOS_B87_SOURCE/patches/upstream-c/B87-west-light.patch"
timeout 120s "$MANDOS_B87_WORK/tools/bin/cmake" --build build/c --parallel 2
timeout 120s env BORG_IMPL=c harness/run.sh \
  "$MANDOS_B87_WORK/after" 1000 0 0 100000

grep '^B87 ' "$MANDOS_B87_WORK/before/stderr.log"
grep '^B87 ' "$MANDOS_B87_WORK/after/stderr.log"
```

The recorded validation used the same source/configuration/seed/run
commands; its artifacts live in `artifacts/b87-c-validation/`. The official
carry patch was separately checked to produce byte-identical corrected
source to that tested after build, with the observer held fixed. The
observation-plus-carry apply sequence above was checked in a fresh copy of
the original C source.

Expected witnesses: both at turn 71, depth 0, `(x,y)=(32,8)`, radius 2,
equipped light quantity 1. Before: west 0/0, east 1/1, 21 entries/19 distinct.
After: west 1/1, east 1/1, 21 entries/21 distinct. Baseline and observation-only
key logs match all 180,210 bytes of the original C reference. The corrected
run's later key stream may differ and is not expected to match that reference.
