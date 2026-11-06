# Issue20: external native Web Locks platform control

This qualifies a candidate coordination primitive, **not an implemented fix**.
The production journal, lineage, birth/title writers, plugin and dependencies
are unchanged. See [the uncoordinated before proof](../20-storage-before/README.md).
Baseline03fcb3fc storage modules are byte-equivalent in47's delivered05ea56fc.

## Actual platform outcomes

| Platform | Origin | Sequential | Independent facades | Independent pages/windows | Lost updates |
| --- | --- | --- | --- | --- | --- |
| Chromium153.0.8010.12 | HTTP loopback, secure context |4/4 |4/4 |8/8 |0 |
| Electron43.2.0 / Chromium150.0.7871.129 | neo-angband://game, standard+secure |4/4 |4/4 |8/8 |0 |

These are bounded controls on current cooperating callers, not a population
failure-rate estimate or proof against older/noncooperating writers. The actual
archiveFinishedRun and bumpLineage execute unchanged **inside a native exclusive
Web Lock callback**. Their fresh SDK get/merge/set occurs after acquisition.
No get/set shim, private storage access, CAS, controller, random birth ID,
engine patch or new manifest grant was introduced. Fresh third-facade/page reads
confirm both archive keys/counter increments and unrelated siblings.

Native lifecycle checks pass on both platforms:

- Throwing inside the acquired callback rejects/releases it; the next actual
  counter write acquires and succeeds.
- A held lock makes an ifAvailable request return null; no metadata work runs.
- An actually queued AbortSignal request rejects AbortError; its callback does
  not run, storage remains unchanged, and a later writer acquires normally.
- Actual opaque-origin contexts report the feature unsupported and execute no
  callback. A separately labelled absent-provider negative contract refuses
  without mutation; it is not a claim the tested secure origins lack Web Locks.
- Query after lifecycle checks reports no held fixture lock.

Full snapshots, lifecycle/opaque results and versions are in
[chromium.json](chromium.json), [electron.json](electron.json) and
[receipt.json](receipt.json). The Electron fixture exits0. Node22 is not locally
installed and was **not run**; final required hosted Node22 must qualify any
single-realm harness fallback. Node26 exposes a native locks property too, so
future platform detection must not infer browser-origin semantics from property
presence alone.

## Actual isolated Electron scope

The fixture uses the checked unmodified installed Electron binary, not the Neo
application. It creates fresh userData/session/cache/crash/log paths and a new
persistent test partition under an owned temporary tree. It loads only the
synthetic fixture and the actual pinned API2 host/store source, then closes its
windows/browser/server and removes only that temporary tree. No owner profile,
Neo app, lab, game or controller is loaded.

The standard+secure scheme and its supportFetchAPI/cors/stream/codeCache flags
come from the unmodified official97ce app-origin module. No service-worker
privilege is added. Source97ce storage and published beta.3 SDK/Core are the
same basis as the before proof. Build-only unused Vite discovery is empty and
DEV/PROD constants are production values. The explicit disposable Xvfb launch
uses --no-sandbox; this is not a stock-app deployment/security qualification.
It does establish actual native acquisition and cross-window coordination on
the custom origin, rather than relabelling the HTTP Chromium proof as Electron.

Setup incident is retained in the receipt: initial Electron package-path lookup
required its index module, which automatically ran the ignored dependency
installer/path setup. No tracked engine/lock or owner-profile change occurred.
No shared dependency files were deleted. The proof thereafter resolves an
existing path file/binary explicitly and never invokes that installer.

## Reproduce

Use an installed public engine tracker for immutable source objects and existing
Playwright/Electron/fflate tooling, with Xvfb available:

```sh
flock /tmp/angband-validation.lock node tools/proofs/issue20-platform.mjs \
  --frontend-repository /path/to/neo-angband-tracker \
  --out artifacts/fresh-issue20-platform
```

Existing output is refused. Missing Electron is recorded as a blocker rather
than auto-installed by this runner. Source/input and binary hashes are retained.

## Minimal proposed production boundary

After parent approval, use one small metadata mutation coordinator around all
install read/modify/write sites: archive, lineage, birth-flag set/clear/consume
and title profile memory. Browser/Electron uses the origin-scoped native lock;
unsupported/denied browser coordination must fail visibly before writing, not
silently fall back to an unsafe page-local queue. All persistence remains the
declared SDK slot get/set. Keep UI/game work outside the critical section.

A shared Promise queue may serve a positively identified Node single-realm
MemorySlot harness; it cannot promise cross-process or arbitrary backend atomicity.
Do not change the intentional field-replacement/dedup/birth protocol while
protecting unrelated siblings. Cached class/race draws may still repeat across
pages independently of correct persisted-counter increments. This control has
not yet integrated such a helper into production; no PR, closure or full gate
is claimed here. Implementation starts separately from47's resulting main.
