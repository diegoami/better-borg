/** FORK: Mandos166. Explicit first-party overlay export; download never acknowledges import. */
import type { Api2DomPanel, ModApi2 } from "@rpgm-tools/neo-angband-mod-sdk";
import { LIVE_EXPORT_LIMIT, packetText, type LiveRecorder } from "./live-deaths.js";
export function installDeathExport(mod: ModApi2, recorder: LiveRecorder, retryRestart: () => Promise<void>): { stop(): void; open(): Promise<void> } {
  let stopped = false, acknowledgement = "", busy = false, panel: Api2DomPanel | null = null;
  const panelId = "mandos-death-export";
  const log = (text: string): void => mod.meta.log(text);
  async function open(): Promise<void> {
    if (stopped) return;
    const entries = await recorder.entries();
    if (stopped) return;
    // Declarative download.text is capped at4096 characters by this frontend.
    // The already-required first-party profile exposes this declared ShadowRoot API.
    if (!mod.ui.overlay) {
      log("Mandos export needs the first-party overlay API; locally recorded reports remain pending.");
      return;
    }
    try {
      if (panel === null || !panel.open) {
        const opened = await mod.ui.overlay({ id: panelId, label: "Mandos pending death reports", modal: true });
        if (!opened.ok) { log(`Mandos export overlay unavailable (${opened.message}); locally recorded reports remain pending. Grant ui:panel.mount to export.`); return; }
        if (stopped) { opened.value.close(); return; }
        panel = opened.value;
      }
      const root = panel.root, doc = root.ownerDocument;
      const text = (value: string): HTMLParagraphElement => { const p = doc.createElement("p"); p.textContent = value; return p; };
      const nodes: Node[] = [text(`${String(entries.length)} locally pending terminal reports. Analysis is pending. ${recorder.failure ?? "Storage verified when captured."}`),
        text("Review downloaded facts before publication: messages, commands, equipment and terminal-revealed knowledge may be sensitive. Import into your death corpus, then paste its successful import acknowledgement. Downloading alone never removes reports.")];
      for (let i = 0; i < entries.length; i += LIVE_EXPORT_LIMIT) {
        const batch = entries.slice(i, i + LIVE_EXPORT_LIMIT), button = doc.createElement("button");
        button.type = "button"; button.textContent = `Download pending reports ${String(i + 1)}–${String(i + batch.length)}`;
        button.addEventListener("click", () => {
          if (stopped) return;
          const url = URL.createObjectURL(new Blob([packetText({ schema: "mandos/live-export@1", entries: batch })], { type: "application/json" }));
          const anchor = doc.createElement("a"); anchor.href = url; anchor.download = `mandos-deaths-${batch[0]!.id.slice(0, 16)}.json`;
          anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 0);
        });
        nodes.push(button);
      }
      const label = doc.createElement("label"), input = doc.createElement("textarea");
      label.textContent = "Successful corpus import acknowledgement JSON"; input.value = acknowledgement;
      input.setAttribute("aria-label", label.textContent); input.addEventListener("input", () => { acknowledgement = input.value; }); label.append(input); nodes.push(label);
      const action = (name: string, work: () => Promise<void>): void => {
        const button = doc.createElement("button"); button.type = "button"; button.textContent = name; button.disabled = busy;
        button.addEventListener("click", () => {
          if (stopped || busy) return;
          busy = true; button.disabled = true;
          void (async () => {
            try { await work(); if (await recorder.retry()) await retryRestart(); }
            catch (error) { log(`Mandos export action failed: ${String(error)}`); }
            finally { busy = false; if (!stopped) await open(); }
          })();
        }); nodes.push(button);
      };
      action("Acknowledge imported reports", async () => { await recorder.acknowledge(acknowledgement); acknowledgement = ""; });
      action("Retry recording and paused rebirth", async () => {});
      root.replaceChildren(...nodes);
    } catch (error) { log(`Mandos export overlay unavailable (${String(error)}); capture is independent of the optional UI grant.`); }
  }
  void mod.ui.commands.register("mandos:export-deaths", "Export Mandos deaths", open).then(r => { if (!r.ok) log(`Mandos export command unavailable: ${r.message}`); }).catch(error => log(String(error)));
  const title = mod.presentation?.title;
  if (title) void title.registerRow({ id: "mandos-death-export", label: "Export Mandos death reports", run: open }).catch(error => log(String(error)));
  return { open, stop() { stopped = true; panel?.close(); panel = null; } };
}
