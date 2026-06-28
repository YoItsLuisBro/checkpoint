import { CheckCircle2, Download, Info, Smartphone } from "lucide-react";
import { useState } from "react";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";

export default function InstallAppPanel() {
  const { canInstall, isInstalled, isIOS, installApp } = useInstallPrompt();
  const [status, setStatus] = useState("");

  async function handleInstall() {
    const outcome = await installApp();

    if (outcome === "accepted") {
      setStatus("install accepted");
      return;
    }

    if (outcome === "dismissed") {
      setStatus("install dismissed");
      return;
    }

    setStatus("install prompt unavailable");
  }

  return (
    <section className="cp-panel mt-8 p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl text-(--cp-accent)">$ install app</h2>
          <p className="mt-1 text-sm text-(--cp-muted)">
            // add CHECKPOINT to your home screen
          </p>
        </div>

        <Smartphone className="shrink-0 text-(--cp-accent)" size={22} />
      </div>

      {isInstalled ? (
        <div className="border border-(--cp-accent) bg-(--cp-accent-soft) p-3 text-(--cp-accent)">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span>[installed] app mode active</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleInstall}
            disabled={!canInstall}
            className={[
              "flex w-full items-center justify-center gap-2 border px-4 py-3 text-lg font-bold",
              canInstall
                ? "border-(--cp-accent) bg-(--cp-accent) text-(--cp-accent-contrast)"
                : "border-(--cp-border) bg-(--cp-panel) text-(--cp-muted) opacity-70",
            ].join(" ")}
          >
            <Download size={18} />
            install checkpoint
          </button>

          {status && (
            <p className="border border-(--cp-border) bg-(--cp-panel) px-3 py-2 text-sm text-(--cp-muted)">
              [{status}]
            </p>
          )}

          {isIOS ? (
            <div className="border border-(--cp-border) bg-(--cp-panel) p-3 text-sm text-(--cp-muted)">
              <p className="mb-2 flex items-center gap-2 text-(--cp-info)">
                <Info size={16} />
                iOS install path
              </p>

              <p>1. Open CHECKPOINT in Safari.</p>
              <p>2. Tap the Share button.</p>
              <p>3. Tap Add to Home Screen.</p>
            </div>
          ) : (
            <div className="border border-(--cp-border) bg-(--cp-panel) p-3 text-sm text-(--cp-muted)">
              <p className="mb-2 flex items-center gap-2 text-(--cp-info)">
                <Info size={16} />
                install note
              </p>

              <p>
                If the button is disabled, open the built production app in a
                supported browser, then use the browser menu to install.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
