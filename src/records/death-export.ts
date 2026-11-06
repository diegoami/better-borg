/** FORK: Mandos166. Explicit operator export; downloading never acknowledges import. */
import type { Api2PanelNode, ModApi2 } from "@rpgm-tools/neo-angband-mod-sdk";
import { LIVE_EXPORT_LIMIT, packetText, type LiveRecorder } from "./live-deaths.js";
export function installDeathExport(mod: ModApi2, recorder: LiveRecorder, retryRestart: () => Promise<void>): { stop(): void; open(): Promise<void> } {
  let stopped = false, acknowledgement = "", busy = false, mounted = false;
  const panelId = "mandos-death-export";
  const log = (text: string): void => mod.meta.log(text);
  async function open(): Promise<void> {
    if (stopped) return;
    const entries = await recorder.entries();
    if (stopped) return;
    const downloads: Api2PanelNode[] = [];
    for (let i = 0; i < entries.length; i += LIVE_EXPORT_LIMIT) {
      const batch = entries.slice(i, i + LIVE_EXPORT_LIMIT);
      downloads.push({ type: "download", label: `Download pending reports ${String(i + 1)}–${String(i + batch.length)}`, name: `mandos-deaths-${batch[0]!.id.slice(0, 16)}.json`, text: packetText({ schema: "mandos/live-export@1", entries: batch }) });
    }
    const root: Api2PanelNode = { type: "column", children: [
      { type: "text", text: `${String(entries.length)} locally pending terminal reports. Analysis is pending. ${recorder.failure ?? "Storage verified when captured."}` },
      { type: "text", text: "Review downloaded facts before publication: messages, commands, equipment and terminal-revealed knowledge may be sensitive. Import into your death corpus, then paste its successful import acknowledgement. Downloading alone never removes local reports." },
      ...downloads,
      { type: "input", label: "Successful corpus import acknowledgement JSON", action: "ack-input", value: acknowledgement },
      { type: "button", label: "Acknowledge imported reports", action: "ack-import", disabled: busy },
      { type: "button", label: "Retry recording and paused rebirth", action: "retry-recording", disabled: busy },
    ] };
    try {
      const result = mounted ? await mod.ui.patch(panelId, { root }) : await mod.ui.mount({ id: panelId, title: "Mandos pending death reports", root }, (action, value) => {
        if (stopped) return;
        if (action === "ack-input") { acknowledgement = typeof value === "string" ? value : ""; return; }
        if (busy) return;
        if (action !== "ack-import" && action !== "retry-recording") return;
        busy = true;
        void (async () => {
          try {
            if (action === "ack-import") { await recorder.acknowledge(acknowledgement); acknowledgement = ""; }
            if (await recorder.retry()) await retryRestart();
          } catch (error) { log(`Mandos export action failed: ${String(error)}`); }
          finally { busy = false; if (!stopped) await open(); }
        })();
      }, () => { mounted = false; });
      if (result.ok) mounted = true;
      if (!result.ok) log(`Mandos export panel unavailable (${result.message}); locally recorded reports remain pending. Grant ui:panel.mount to use the download panel.`);
    } catch (error) { log(`Mandos export panel unavailable (${String(error)}); capture is independent of the panel grant.`); }
  }
  void mod.ui.commands.register("mandos:export-deaths", "Export Mandos deaths", open).then(r => { if (!r.ok) log(`Mandos export command unavailable: ${r.message}`); }).catch(error => log(String(error)));
  const title = mod.presentation?.title;
  if (title) void title.registerRow({ id: "mandos-death-export", label: "Export Mandos death reports", run: open }).catch(error => log(String(error)));
  return { open, stop() { stopped = true; void mod.ui.unmount(panelId).catch(() => undefined); } };
}
