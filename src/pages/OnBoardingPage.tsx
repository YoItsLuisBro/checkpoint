import { useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, ChevronRight, Terminal } from "lucide-react";

import TerminalShell from "../components/layout/TerminalShell";
import { onboardingTemplates } from "../lib/onboardingTemplates";
import { useCheckpointStore } from "../store/useCheckpointStore";
import type { AppTheme, OnboardingInput } from "../types/checkpoint";

const themeOptions: Array<{
  value: AppTheme;
  label: string;
}> = [
  { value: "terminal", label: "terminal" },
  { value: "matrix", label: "matrix" },
  { value: "amber", label: "amber" },
  { value: "blueprint", label: "blueprint" },
];

export default function OnboardingPage() {
  const completeOnboarding = useCheckpointStore(
    (state) => state.completeOnboarding,
  );
  const finishOnboarding = useCheckpointStore(
    (state) => state.finishOnboarding,
  );
  const existingHabits = useCheckpointStore((state) => state.habits);

  const [form, setForm] = useState<OnboardingInput>({
    username: "user",
    planLabel: "local",
    machineName: "checkpoint",
    dailyGoalPercentage: 60,
    theme: "terminal",
    templateId: "minimal",
  });

  const selectedTemplate = useMemo(() => {
    return (
      onboardingTemplates.find((template) => template.id === form.templateId) ??
      onboardingTemplates[0]
    );
  }, [form.templateId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    completeOnboarding(form);
  }

  return (
    <TerminalShell>
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 border border-(--cp-border) bg-(--cp-panel) px-3 py-2 text-sm text-(--cp-muted)">
          <Terminal size={16} />
          checkpoint boot sequence
        </div>

        <h1 className="text-4xl font-bold leading-none tracking-tight text-(--cp-text)">
          CHECKPOINT
        </h1>

        <p className="text-lg leading-tight text-(--cp-muted)">
          // local-first habit tracking.
          <br />
          initialize your daily system.
        </p>
      </header>

      <section className="mt-8 border border-(--cp-border) bg-(--cp-panel) p-4">
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-(--cp-accent)">[ok]</span>{" "}
            <span className="text-(--cp-text)">localStorage mounted</span>
          </p>
          <p>
            <span className="text-(--cp-accent)">[ok]</span>{" "}
            <span className="text-(--cp-text)">offline shell ready</span>
          </p>
          <p>
            <span className="text-(--cp-warn)">[init]</span>{" "}
            <span className="text-(--cp-text)">waiting for user config</span>
          </p>
        </div>
      </section>

      {existingHabits.length > 0 && (
        <section className="mt-6 border border-(--cp-border) bg-(--cp-panel) p-4">
          <h2 className="text-xl text-(--cp-warn)">$ existing data found</h2>

          <p className="mt-2 text-sm text-(--cp-muted)">
            You already have local habits saved. You can keep them and skip the
            starter template.
          </p>

          <button
            type="button"
            onClick={finishOnboarding}
            className="mt-4 flex w-full items-center justify-center gap-2 border border-(--cp-border) px-4 py-3 text-(--cp-text)"
          >
            <CheckCircle2 size={18} />
            continue with current data
          </button>
        </section>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <section className="cp-panel p-4">
          <h2 className="text-xl text-(--cp-accent)">$ profile</h2>
          <p className="mt-1 text-sm text-(--cp-muted)">
            // this creates your terminal prompt
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
                placeholder="luis"
              />
            </label>

            <div className="border border-(--cp-border) bg-(--cp-surface) px-3 py-3 text-sm">
              <p className="text-(--cp-muted)">app name</p>
              <p className="mt-1 text-lg text-(--cp-text)">CHECKPOINT</p>
              <p className="mt-1 text-xs text-(--cp-muted)">
                // fixed system identity
              </p>
            </div>
          </div>
        </section>

        <section className="cp-panel p-4">
          <h2 className="text-xl text-(--cp-accent)">$ template</h2>
          <p className="mt-1 text-sm text-(--cp-muted)">
            // choose your starting routine
          </p>

          <div className="mt-4 space-y-3">
            {onboardingTemplates.map((template) => {
              const selected = form.templateId === template.id;

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      templateId: template.id,
                    }))
                  }
                  className={[
                    "w-full border p-3 text-left transition",
                    selected
                      ? "border-(--cp-accent) bg-(--cp-accent-soft)"
                      : "border-(--cp-border) bg-(--cp-panel)",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p
                        className={
                          selected ? "text-(--cp-accent)" : "text-(--cp-text)"
                        }
                      >
                        {template.label}
                      </p>

                      <p className="mt-1 text-xs text-(--cp-muted)">
                        {template.command}
                      </p>
                    </div>

                    {selected && (
                      <CheckCircle2 size={18} className="text-(--cp-accent)" />
                    )}
                  </div>

                  <p className="mt-3 text-sm text-(--cp-muted)">
                    {template.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-5 border border-(--cp-border) bg-(--cp-surface) p-3">
            <p className="text-sm text-(--cp-muted)">selected habits:</p>

            <div className="mt-3 space-y-2">
              {selectedTemplate.habits.map((habit) => (
                <p key={`${habit.category}-${habit.name}`} className="text-sm">
                  <span className="text-(--cp-muted)">[{habit.category}]</span>{" "}
                  <span className="text-(--cp-text)">
                    {habit.icon} {habit.name}
                  </span>
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="cp-panel p-4">
          <h2 className="text-xl text-(--cp-accent)">$ preferences</h2>
          <p className="mt-1 text-sm text-(--cp-muted)">
            // tune difficulty and appearance
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
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
                value={form.theme}
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
        </section>

        <button type="submit" className="cp-primary-btn">
          start checkpoint
          <ChevronRight size={18} />
        </button>
      </form>

      <footer className="mt-8 border-t border-(--cp-border) pt-5 text-xl">
        <div className="flex items-center justify-between">
          <span>
            [<span className="text-(--cp-accent)">✓</span>] init
          </span>
          <span className="text-(--cp-muted)">local-first</span>
        </div>
      </footer>
    </TerminalShell>
  );
}
