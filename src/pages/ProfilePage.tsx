import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Download, RotateCcw, Save, Upload } from "lucide-react";

import TerminalShell from "../components/layout/TerminalShell";
import InstallAppPanel from "../components/profile/InstallAppPanel";
import TopNav, { type AppView } from "../components/layout/TopNav";
import { useCheckpointStore } from "../store/useCheckpointStore";
import type {
  AppTheme,
  CheckpointBackup,
  SettingsInput,
} from "../types/checkpoint";

type ProfilePageProps = {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
};

const themeOptions: Array<{
  value: AppTheme;
  label: string;
}> = [
  {
    value: "terminal",
    label: "terminal",
  },
  {
    value: "matrix",
    label: "matrix",
  },
  {
    value: "amber",
    label: "amber",
  },
  {
    value: "blueprint",
    label: "blueprint",
  },
];

export default function ProfilePage({
  activeView,
  onChangeView,
}: ProfilePageProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const habits = useCheckpointStore((state) => state.habits);
  const completions = useCheckpointStore((state) => state.completions);
  const settings = useCheckpointStore((state) => state.settings);
  const updateSettings = useCheckpointStore((state) => state.updateSettings);
  const resetAppData = useCheckpointStore((state) => state.resetAppData);
  const importBackup = useCheckpointStore((state) => state.importBackup);
  const shieldUses = useCheckpointStore((state) => state.shieldUses);

  const [form, setForm] = useState<SettingsInput>({
    username: settings.username,
    planLabel: settings.planLabel,
    machineName: settings.machineName,
    dailyGoalPercentage: settings.dailyGoalPercentage,
    theme: settings.theme ?? "terminal",
  });

  const [status, setStatus] = useState<string>("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    updateSettings(form);
    setStatus("settings saved");
  }

  function handleExportBackup() {
    const backup: CheckpointBackup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      habits,
      completions,
      settings,
      shieldUses,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `checkpoint-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);

    setStatus("backup exported");
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function isValidBackup(value: unknown): value is CheckpointBackup {
    if (!value || typeof value !== "object") {
      return false;
    }

    const maybeBackup = value as Partial<CheckpointBackup>;

    return (
      maybeBackup.version === 1 &&
      Array.isArray(maybeBackup.habits) &&
      Array.isArray(maybeBackup.completions) &&
      Boolean(maybeBackup.settings)
    );
  }

  async function handleImportBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!isValidBackup(parsed)) {
        setStatus("invalid backup file");
        return;
      }

      importBackup(parsed);
      setForm({
        username: parsed.settings.username,
        planLabel: parsed.settings.planLabel,
        machineName: parsed.settings.machineName,
        dailyGoalPercentage: parsed.settings.dailyGoalPercentage,
        theme: parsed.settings.theme,
      });

      setStatus("backup imported");
    } catch {
      setStatus("could not import backup");
    } finally {
      event.target.value = "";
    }
  }

  function handleReset() {
    const confirmed = window.confirm(
      "Reset CHECKPOINT? This will restore default habits and remove all completions.",
    );

    if (!confirmed) {
      return;
    }

    resetAppData();
    setForm({
      username: "user",
      planLabel: "pro",
      machineName: "checkpoint",
      dailyGoalPercentage: 60,
      theme: "terminal",
    });

    setStatus("app data reset");
  }

  return (
    <TerminalShell>
      <TopNav activeView={activeView} onChangeView={onChangeView} />

      <header className="space-y-2">
        <h1 className="text-[22px] leading-none tracking-tight">
          <span className="text-emerald-400">checkpoint</span>
          <span className="text-yellow-400">[local]</span>
          <span className="text-sky-300">@profile</span>{" "}
          <span className="text-emerald-400">#</span> <span>settings</span>
        </h1>

        <p className="text-lg leading-tight text-zinc-500">
          // tune the prompt.
          <br />
          keep your data in your hands.
        </p>
      </header>

      {status && (
        <div className="mt-6 border border-emerald-400 bg-emerald-400/10 px-3 py-2 text-emerald-400">
          [ok] {status}
        </div>
      )}

      <InstallAppPanel />

      <section className="mt-8 border border-zinc-800 bg-zinc-950 p-4">
        <div className="mb-4">
          <h2 className="text-xl text-emerald-400">$ profile config</h2>
          <p className="mt-1 text-zinc-600">
            // controls the terminal prompt on your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-zinc-500">username</span>
            <input
              value={form.username}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  username: event.target.value,
                }))
              }
              className="w-full border border-zinc-800 bg-[#0b0f17] px-3 py-3 text-zinc-100 outline-none focus:border-emerald-400"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-2">
              <span className="text-zinc-500">plan</span>
              <input
                value={form.planLabel}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    planLabel: event.target.value,
                  }))
                }
                className="w-full border border-zinc-800 bg-[#0b0f17] px-3 py-3 text-zinc-100 outline-none focus:border-emerald-400"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-zinc-500">machine</span>
              <input
                value={form.machineName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    machineName: event.target.value,
                  }))
                }
                className="w-full border border-zinc-800 bg-[#0b0f17] px-3 py-3 text-zinc-100 outline-none focus:border-emerald-400"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-2">
              <span className="text-zinc-500">daily goal %</span>
              <input
                type="number"
                min={0}
                max={100}
                value={form.dailyGoalPercentage}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    dailyGoalPercentage: Number(event.target.value),
                  }))
                }
                className="w-full border border-zinc-800 bg-[#0b0f17] px-3 py-3 text-zinc-100 outline-none focus:border-emerald-400"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-zinc-500">theme</span>
              <select
                value={form.theme ?? "terminal"}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    theme: event.target.value as AppTheme,
                  }))
                }
                className="w-full border border-zinc-800 bg-[#0b0f17] px-3 py-3 text-zinc-100 outline-none focus:border-emerald-400"
              >
                {themeOptions.map((theme) => (
                  <option key={theme.value} value={theme.value}>
                    {theme.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 border border-emerald-400 bg-emerald-400 px-4 py-3 text-lg font-bold text-black"
          >
            <Save size={18} />
            save settings
          </button>
        </form>
      </section>

      <section className="mt-8 border border-zinc-800 bg-zinc-950 p-4">
        <div className="mb-4">
          <h2 className="text-xl text-yellow-400">$ local data</h2>
          <p className="mt-1 text-zinc-600">// export before you experiment</p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex w-full items-center justify-center gap-2 border border-zinc-700 bg-[#0b0f17] px-4 py-3 text-lg text-zinc-100"
          >
            <Download size={18} />
            export backup
          </button>

          <button
            type="button"
            onClick={handleImportClick}
            className="flex w-full items-center justify-center gap-2 border border-zinc-700 bg-[#0b0f17] px-4 py-3 text-lg text-zinc-100"
          >
            <Upload size={18} />
            import backup
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportBackup}
            className="hidden"
          />

          <button
            type="button"
            onClick={handleReset}
            className="flex w-full items-center justify-center gap-2 border border-red-400 bg-red-400/10 px-4 py-3 text-lg text-red-300"
          >
            <RotateCcw size={18} />
            reset checkpoint
          </button>
        </div>
      </section>

      <section className="mt-8 border-b border-zinc-800 pb-6">
        <h2 className="text-xl text-emerald-400">$ storage report</h2>

        <div className="mt-4 space-y-2 text-zinc-400">
          <p>
            habits:{" "}
            <span className="text-zinc-100">
              {habits.filter((habit) => !habit.archivedAt).length}
            </span>
          </p>

          <p>
            archived:{" "}
            <span className="text-zinc-100">
              {habits.filter((habit) => habit.archivedAt).length}
            </span>
          </p>

          <p>
            completions:{" "}
            <span className="text-zinc-100">{completions.length}</span>
          </p>

          <p>
            storage: <span className="text-emerald-400">localStorage</span>
          </p>

          <p>shield uses: {shieldUses.length}</p>
          <p>shields held: {settings.shieldCount}/3</p>
        </div>
      </section>

      <footer className="mt-8 border-t border-zinc-800 pt-5 text-xl">
        <div className="flex items-center justify-between">
          <span>
            [<span className="text-emerald-400">✓</span>] profile
          </span>
          <span className="text-zinc-500">local-first</span>
        </div>
      </footer>
    </TerminalShell>
  );
}
