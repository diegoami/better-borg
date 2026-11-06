# Live terminal reports and manual export

Mandos #166 records each delivered terminal report into its own install-wide
public API2 KV outbox before automatic rebirth. Death, victory and retirement
remain different outcomes. Stalls, caps and aborted harness runs do not become
deaths. A verified KV write is required before the death restart may set its
birth flag. A refusal, quota failure or swallowed write pauses rebirth visibly;
its in-memory pending packet can still be downloaded before a page reload.
A packet that failed storage is **not durable**. Reloading can lose that packet.

This requires a host delivering the full first-party run report and granting
`store:kv`. Our committed lab launcher uses `--lab-trust=mandos`. Public-tier
API2 gives only `{key, report: null}`: no outcome or cause is available. Mandos
logs that missing report and starts no next character. Meaningful public-tier
capture would need a separately reviewed engine producer enhancement. There is
no hidden-state fallback, newly deployed lab, or claim that all public installs
capture every death.

Each packet contains a composite stable host terminal key (or explicitly weaker
session-derived identity), engine/API versions, resolved flags/settings,
optional accepted birth inputs, terminal facts and a bounded tail of decisions.
Exact plugin/source digest is currently unknown, not inferred from a version.
The last twelve attempted commands carry nearby remembered terrain, known
player/item state, perceived monsters and messages already consumed by the
controller. Granted monster truth is labelled separately. Frames are copied
before submission, after loadout settling; they do not claim command acceptance
or actual fatal HP. Terminal item revelation never changes earlier frames.
Missing input, dropped frames and truncation are explicit.

There is no full fatal save, cheat death, delayed game turn, automatic diagnosis,
model call, network request, or repository publication. The old graveyard is
preserved separately; it is not the new outbox's source of durability.

## Operator workflow

1. Open **Export Mandos death reports** on the title page or invoke the
   **Export Mandos deaths** command. Download pending reports. The panel grant
   `ui:panel.mount` is optional for capture; a refusal leaves stored reports
   pending. Review the JSON before publication. Messages, commands, belongings
   and revealed terminal information may be private.
2. Import the reviewed download into a local corpus, keeping larger packet
   evidence outside the small versioned report tree:

   ```sh
   node tools/live-deaths.mjs import --input reviewed-export.json \
     --corpus docs/deaths/local-corpus --evidence artifacts/death-packets \
     --reviewed yes --ack artifacts/death-import-ack.json
   ```

   External evidence directories need a portable `--artifact-base` locator.
   Inputs, evidence and corpus must be separate, without symlink ancestors.
   The importer never follows/fetches artifact links. Every packet and terminal
   SHA-256 is verified, immutable external files are read back, and the existing
   corpus ingestion/index verifies before an acknowledgement is returned.
   Unknown builds/birth positions remain unknown. Diagnosis starts pending.
   Keep the original transport bytes intact for hash verification/ACK. For public
   sharing, publish selected small reports or a separately labelled redacted
   derivative; retain the original packet privately and mark its locator local-only.
   Editing a transport packet invalidates its ACK identity/content hash.
3. Paste the successful import acknowledgement JSON into the panel and choose
   **Acknowledge imported reports**. Only matching new packet IDs/hashes are
   retired with public `kv.set(key,null)`. Legacy archives and character data
   are never removed. Download alone is not an acknowledgement or proof of a
   backup on another computer. ACK imports are an explicit operator assertion,
   not an online corpus verification service.
4. If storage paused rebirth, import/acknowledge existing packets to free space,
   then choose **Retry recording and paused rebirth**. A successful verified
   capture (or acknowledged in-memory report) releases that one pending restart.
   Nothing retries unattended. A stopped mod cannot resume its old restart.
5. Review the pending corpus report and append an attributed diagnosis with
   `tools/deaths.mjs analyse`; aggregate with `index`. Existing
   [diagnosis/evidence rules](README.md) apply. Publication of selected small
   reports and artifact links remains an explicit reviewed Git operation.

The host limits the whole mod KV store to 256 keys / 1 MiB. Packets are at most
48 KiB and exports group at most ten. Nothing silently evicts reports. Regular
verified import/ACK is necessary for continuous capture; exhaustion pauses
rebirth and says so. Existing unrelated KV data also counts toward that quota.

## Headless runs

`tools/runs.mjs` now requests the optional bounded decision tail and awaits an
immutable per-life `*-terminal-outbox/life-NNNN/runs.json` before another life
boots. `decision-tail.json` is written first. These normal `better-borg/runs@1`
records are directly ingestible with `tools/deaths.mjs ingest`; surviving slices
and stalls remain non-death events. A later session failure leaves previous
terminal receipts intact. There is still a final whole-session record, and
neither outbox is automatically committed or uploaded. A process killed before
an ended-life callback runs cannot manufacture a terminal report afterward.

## Verification and limits

See [the public proof receipt](../runs/2026-11-06-live-death-export-166/README.md).
The real published-Core game and pinned frontend report/broker/KV/API2 panel
contract are exercised with temporary persistent backing and fresh host state.
This verifies the bridge ABI with explicit driver publication, not an entire
Electron installation or the existing running lab. No owner's data was read.
Issue166 remains the canonical task for deployment/public-tier producer gaps
and extending capture beyond these report-delivering profiles.
