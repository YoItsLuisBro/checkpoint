import { useEffect, useState, type ChangeEvent } from "react";
import { Download, Save, Trash2, Upload } from "lucide-react";

import TerminalShell from "../components/layout/TerminalShell";
import TopNav, { type AppView } from "../components/layout/TopNav";
import InstallAppPanel from "../components/profile/InstallAppPanel";
import { useCheckpointStore } from "../store/useCheckpointStore";
import type { AppTheme, CheckpointBackup } from "../types/checkpoint";

type ProfilePageProps = {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
};

type SettingsForm = {
  username: string;
  dailyGoalPercentage: number;
  theme: AppTheme;
};

const themeOptions: Array<{
  value: AppTheme;
  label: string;
}> = [
  { value: "terminal", label: "terminal" },
  { value: "matrix", label: "matrix" },
  { value: "amber", label: "amber" },
  { value: "blueprint", label: "blueprint" },
];

export default function ProfilePage({
  activeView,
  onChangeView,
}: ProfilePageProps) {
  const habits = useCheckpointStore((state) => state.habits);
  const completions = useCheckpointStore((state) => state.completions);
  const shieldUses = useCheckpointStore((state) => state.shieldUses);
  const settings = useCheckpointStore((state) => state.settings);

  const updateSettings = useCheckpointStore((state) => state.updateSettings);
  const resetAppData = useCheckpointStore((state) => state.resetAppData);
  const importBackup = useCheckpointStore((state) => state.importBackup);

  const [form, setForm] = useState<SettingsForm>({
    username: settings.username,
    dailyGoalPercentage: settings.dailyGoalPercentage,
    theme: settings.theme ?? "terminal",
  });

  const [status, setStatus] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      username: settings.username,
      dailyGoalPercentage: settings.dailyGoalPercentage,
      theme: settings.theme ?? "terminal",
    });
  }, [settings]);

  function handleSaveSettings() {
    updateSettings({
      username: form.username,
      planLabel: settings.planLabel ?? "local",
      machineName: "checkpoint",
      dailyGoalPercentage: form.dailyGoalPercentage,
      theme: form.theme,
    });

    setStatus("profile saved");
  }

  function handleExportBackup() {
    const backup: CheckpointBackup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      habits,
      completions,
      shieldUses,
      settings: {
        ...settings,
        machineName: "checkpoint",
      },
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `checkpoint-backup-${backup.exportedAt.slice(0, 10)}.json`;
    link.click();

    URL.revokeObjectURL(url);
    setStatus("backup exported");
  }

  async function handleImportBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsedBackup = JSON.parse(text) as CheckpointBackup;

      importBackup({
        ...parsedBackup,
        settings: {
          ...parsedBackup.settings,
          machineName: "checkpoint",
        },
      });

      setStatus("backup imported");
    } catch {
      setStatus("backup import failed");
    } finally {
      event.target.value = "";
    }
  }

  function handleResetData() {
    const confirmed = window.confirm(
      "Reset CHECKPOINT? This removes local habits, completions, notes, shields, and settings.",
    );

    if (!confirmed) {
      return;
    }

    resetAppData();
    setStatus("local data reset");
  }

  return (
    <TerminalShell>
      <TopNav activeView={activeView} onChangeView={onChangeView} />

      <header className="mt-6">
        <p className="text-sm text-(--cp-muted)">$ checkpoint profile</p>

        <div className="mt-3">
          <h1 className="text-4xl font-bold leading-none tracking-tight text-(--cp-text)">
            profile
          </h1>

          <p className="mt-2 text-sm text-(--cp-muted)">
            // identity, difficulty, theme, backup, and local storage
          </p>
        </div>
      </header>

      {status && (
        <div className="mt-6 border border-(--cp-accent) bg-(--cp-accent-soft) px-3 py-2 text-(--cp-accent)">
          [ok] {status}
        </div>
      )}

      <InstallAppPanel />

      <section className="cp-panel mt-8 p-4">
        <h2 className="text-xl text-(--cp-accent)">$ profile config</h2>

        <p className="mt-1 text-sm text-(--cp-muted)">
          // CHECKPOINT is the fixed app name
        </p>

        <div className="mt-4 space-y-4">
          <label className="block space-y-2">
            <span className="text-(--cp-muted)">username</span>
            <input
              value={form.username}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  username: event.target.value,
                }))
              }
              className="cp-input"
              placeholder="user"
            />
          </label>

          <div className="border border-(--cp-border) bg-(--cp-surface) px-3 py-3 text-sm">
            <p className="text-(--cp-muted)">app name</p>
            <p className="mt-1 text-lg text-(--cp-text)">CHECKPOINT</p>
            <p className="mt-1 text-xs text-(--cp-muted)">
              // fixed system identity, not editable
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-2">
              <span className="text-(--cp-muted)">daily goal %</span>
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
                className="cp-input"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-(--cp-muted)">theme</span>
              <select
                value={form.theme ?? "terminal"}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    theme: event.target.value as AppTheme,
                  }))
                }
                className="cp-input"
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
            type="button"
            onClick={handleSaveSettings}
            className="cp-primary-btn"
          >
            <Save size={18} />
            save profile
          </button>
        </div>
      </section>

      <section className="cp-panel mt-8 p-4">
        <h2 className="text-xl text-(--cp-accent)">$ backup</h2>

        <p className="mt-1 text-sm text-(--cp-muted)">
          // export or import local CHECKPOINT data
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={handleExportBackup}
            className="cp-primary-btn"
          >
            <Download size={18} />
            export backup
          </button>

          <label className="flex cursor-pointer items-center justify-center gap-2 border border-(--cp-border) px-4 py-3 text-(--cp-text)">
            <Upload size={18} />
            import backup
            <input
              type="file"
              accept="application/json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </section>

      <section className="cp-panel mt-8 p-4">
        <h2 className="text-xl text-(--cp-accent)">$ storage report</h2>

        <div className="mt-4 space-y-2 text-sm text-(--cp-muted)">
          <p>
            active habits: {habits.filter((habit) => !habit.archivedAt).length}
          </p>
          <p>
            archived habits: {habits.filter((habit) => habit.archivedAt).length}
          </p>
          <p>completion records: {completions.length}</p>
          <p>notes saved: {completions.filter((item) => item.note).length}</p>
          <p>shield uses: {shieldUses.length}</p>
          <p>shields held: {settings.shieldCount}/3</p>
          <p>daily goal: {settings.dailyGoalPercentage}%</p>
          <p>theme: {settings.theme ?? "terminal"}</p>
        </div>
      </section>

      <section className="mt-8 border border-(--cp-danger) bg-(--cp-panel) p-4">
        <h2 className="text-xl text-(--cp-danger)">$ danger zone</h2>

        <p className="mt-1 text-sm text-(--cp-muted)">
          // reset all local CHECKPOINT data
        </p>

        <button
          type="button"
          onClick={handleResetData}
          className="mt-4 flex w-full items-center justify-center gap-2 border border-(--cp-danger) px-4 py-3 text-(--cp-danger)"
        >
          <Trash2 size={18} />
          reset local data
        </button>
      </section>
    </TerminalShell>
  );
}
