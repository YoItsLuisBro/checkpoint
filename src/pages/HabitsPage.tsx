import { useMemo, useState, type FormEvent } from "react";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";

import TerminalShell from "../components/layout/TerminalShell";
import EmptyState from "../components/ui/EmptyState";
import TopNav, { type AppView } from "../components/layout/TopNav";
import { useCheckpointStore } from "../store/useCheckpointStore";
import {
  getDefaultHabitSchedule,
  getScheduleLabel,
  normalizeHabitSchedule,
  scheduleTypeOptions,
  weekdayOptions,
} from "../lib/schedules";
import type {
  Habit,
  HabitCategory,
  HabitInput,
  HabitMode,
  HabitScheduleType,
} from "../types/checkpoint";

import { habitTemplates, type HabitTemplate } from "../lib/habitTemplates";

type HabitsPageProps = {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
};

const categoryLabels: Record<HabitCategory, string> = {
  morning: "Morning",
  day: "Daily",
  night: "Night",
};

const categoryOptions: HabitCategory[] = ["morning", "day", "night"];

const modeOptions: HabitMode[] = ["checkbox", "counter", "number", "timer"];

function getEmptyForm(): HabitInput {
  return {
    name: "",
    icon: "□",
    category: "day",
    mode: "checkbox",
    target: undefined,
    unit: "",
    schedule: getDefaultHabitSchedule(),
  };
}

export default function HabitsPage({
  activeView,
  onChangeView,
}: HabitsPageProps) {
  const habits = useCheckpointStore((state) => state.habits);
  const addHabit = useCheckpointStore((state) => state.addHabit);
  const updateHabit = useCheckpointStore((state) => state.updateHabit);
  const archiveHabit = useCheckpointStore((state) => state.archiveHabit);
  const restoreHabit = useCheckpointStore((state) => state.restoreHabit);
  const deleteHabit = useCheckpointStore((state) => state.deleteHabit);
  const moveHabit = useCheckpointStore((state) => state.moveHabit);
  const applyHabitTemplate = useCheckpointStore(
    (state) => state.applyHabitTemplate,
  );

  const [form, setForm] = useState<HabitInput>(() => getEmptyForm());
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    habitTemplates[0]?.id ?? "",
  );
  const [templateStatus, setTemplateStatus] = useState("");
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);

  const activeHabits = useMemo(() => {
    return habits
      .filter((habit) => !habit.archivedAt)
      .sort((a, b) => a.order - b.order);
  }, [habits]);

  const archivedHabits = useMemo(() => {
    return habits
      .filter((habit) => habit.archivedAt)
      .sort((a, b) => a.order - b.order);
  }, [habits]);

  const groupedHabits = useMemo(() => {
    return {
      morning: activeHabits.filter((habit) => habit.category === "morning"),
      day: activeHabits.filter((habit) => habit.category === "day"),
      night: activeHabits.filter((habit) => habit.category === "night"),
    };
  }, [activeHabits]);

  const selectedTemplate = useMemo(() => {
    return (
      habitTemplates.find((template) => template.id === selectedTemplateId) ??
      habitTemplates[0]
    );
  }, [selectedTemplateId]);

  const isEditing = Boolean(editingHabitId);

  function resetForm() {
    setForm(getEmptyForm());
    setEditingHabitId(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    const cleanedSchedule = normalizeHabitSchedule(form.schedule);

    if (
      cleanedSchedule.type === "specific-days" &&
      (cleanedSchedule.days?.length ?? 0) === 0
    ) {
      window.alert("Pick at least one scheduled day.");
      return;
    }

    const cleanedTarget =
      form.mode === "checkbox"
        ? undefined
        : form.target && form.target > 0
          ? form.target
          : 1;

    const cleanedUnit =
      form.mode === "timer"
        ? form.unit?.trim() || "min"
        : form.unit?.trim() || undefined;

    const cleanedInput: HabitInput = {
      ...form,
      name: form.name.trim(),
      icon: form.icon.trim() || "□",
      target: cleanedTarget,
      unit: cleanedUnit,
      schedule: cleanedSchedule,
    };

    if (editingHabitId) {
      updateHabit(editingHabitId, cleanedInput);
    } else {
      addHabit(cleanedInput);
    }

    resetForm();
  }

  function startEditing(habit: Habit) {
    setEditingHabitId(habit.id);

    setForm({
      name: habit.name,
      icon: habit.icon,
      category: habit.category,
      mode: habit.mode,
      target: habit.target,
      unit: habit.unit ?? "",
      schedule: normalizeHabitSchedule(habit.schedule),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleArchiveHabit(habit: Habit) {
    const confirmed = window.confirm(`Archive "${habit.name}"?`);

    if (!confirmed) {
      return;
    }

    archiveHabit(habit.id);
  }

  function handleRestoreHabit(habit: Habit) {
    restoreHabit(habit.id);
  }

  function handleDeleteHabit(habit: Habit) {
    const confirmed = window.confirm(
      `Permanently delete "${habit.name}"? This will also delete its completion history.`,
    );

    if (!confirmed) {
      return;
    }

    deleteHabit(habit.id);
  }

  function handleApplyTemplate(template: HabitTemplate) {
    const confirmed = window.confirm(
      `Add "${template.label}"? This will append ${template.habits.length} habits to your current setup.`,
    );

    if (!confirmed) {
      return;
    }

    applyHabitTemplate(template.id);
    setTemplateStatus(`template applied: ${template.label}`);
  }

  return (
    <TerminalShell>
      <TopNav activeView={activeView} onChangeView={onChangeView} />

      <header className="space-y-2">
        <h1 className="text-[22px] leading-none tracking-tight">
          <span className="text-(--cp-accent)">checkpoint</span>
          <span className="text-(--cp-warn)">[local]</span>
          <span className="text-(--cp-info)">@habits</span>{" "}
          <span className="text-(--cp-accent)">#</span>{" "}
          <span className="text-(--cp-text)">manage</span>
        </h1>

        <p className="text-lg leading-tight text-(--cp-muted)">
          // edit your daily loop.
          <br />
          keep the system lightweight.
        </p>
      </header>

      <section className="cp-panel mt-8 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl text-(--cp-accent)">
            {isEditing ? "$ edit habit" : "$ add habit"}
          </h2>

          {isEditing && (
            <button
              onClick={resetForm}
              className="inline-flex items-center gap-1 text-(--cp-muted)"
              type="button"
            >
              <X size={16} />
              cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-(--cp-muted)">name</span>
            <input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Study"
              className="cp-input"
            />
          </label>

          <div className="grid grid-cols-[88px_1fr] gap-3">
            <label className="block space-y-2">
              <span className="text-(--cp-muted)">icon</span>
              <input
                value={form.icon}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    icon: event.target.value,
                  }))
                }
                maxLength={2}
                className="cp-input"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-(--cp-muted)">routine</span>
              <select
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value as HabitCategory,
                  }))
                }
                className="cp-input"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {categoryLabels[category]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-(--cp-muted)">schedule</span>
            <select
              value={form.schedule.type}
              onChange={(event) => {
                const nextType = event.target.value as HabitScheduleType;

                setForm((current) => {
                  if (nextType === "specific-days") {
                    return {
                      ...current,
                      schedule: {
                        type: nextType,
                        days:
                          current.schedule.days &&
                          current.schedule.days.length > 0
                            ? current.schedule.days
                            : [1, 2, 3, 4, 5],
                      },
                    };
                  }

                  if (nextType === "weekly-target") {
                    return {
                      ...current,
                      schedule: {
                        type: nextType,
                        days: [],
                        weeklyTarget: current.schedule.weeklyTarget ?? 3,
                      },
                    };
                  }

                  return {
                    ...current,
                    schedule: {
                      type: nextType,
                      days: [],
                    },
                  };
                });
              }}
              className="cp-input"
            >
              {scheduleTypeOptions.map((schedule) => (
                <option key={schedule.value} value={schedule.value}>
                  {schedule.label}
                </option>
              ))}
            </select>
          </label>

          {form.schedule.type === "specific-days" && (
            <div className="space-y-2">
              <span className="text-(--cp-muted)">days</span>

              <div className="grid grid-cols-7 gap-2">
                {weekdayOptions.map((day) => {
                  const selected =
                    form.schedule.days?.includes(day.value) ?? false;

                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() =>
                        setForm((current) => {
                          const currentDays = current.schedule.days ?? [];

                          const nextDays = selected
                            ? currentDays.filter((value) => value !== day.value)
                            : [...currentDays, day.value];

                          return {
                            ...current,
                            schedule: {
                              type: "specific-days",
                              days: nextDays,
                            },
                          };
                        })
                      }
                      className={[
                        "border px-2 py-2 text-sm",
                        selected
                          ? "border-(--cp-accent) bg-(--cp-accent) text-(--cp-accent-contrast)"
                          : "border-(--cp-border) text-(--cp-muted)",
                      ].join(" ")}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {form.schedule.type === "weekly-target" && (
            <label className="block space-y-2">
              <span className="text-(--cp-muted)">times per week</span>
              <input
                type="number"
                min={1}
                max={7}
                value={form.schedule.weeklyTarget ?? 3}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    schedule: {
                      type: "weekly-target",
                      days: [],
                      weeklyTarget: Number(event.target.value),
                    },
                  }))
                }
                className="cp-input"
              />
            </label>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-2">
              <span className="text-(--cp-muted)">mode</span>
              <select
                value={form.mode}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    mode: event.target.value as HabitMode,
                    target:
                      event.target.value === "checkbox"
                        ? undefined
                        : (current.target ?? 1),
                    unit:
                      event.target.value === "timer"
                        ? current.unit || "min"
                        : current.unit,
                  }))
                }
                className="cp-input"
              >
                {modeOptions.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-(--cp-muted)">target</span>
              <input
                value={form.target ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    target: event.target.value
                      ? Number(event.target.value)
                      : undefined,
                  }))
                }
                type="number"
                min={0}
                placeholder={form.mode === "checkbox" ? "-" : "1"}
                disabled={form.mode === "checkbox"}
                className={[
                  "cp-input",
                  form.mode === "checkbox" ? "opacity-50" : "",
                ].join(" ")}
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-(--cp-muted)">unit</span>
            <input
              value={form.unit ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  unit: event.target.value,
                }))
              }
              placeholder="pages, liters, minutes..."
              className="cp-input"
            />
          </label>

          <button type="submit" className="cp-primary-btn">
            {isEditing ? <Save size={18} /> : <Plus size={18} />}
            {isEditing ? "save habit" : "add habit"}
          </button>
        </form>
      </section>

      <section className="cp-panel mt-8 p-4">
        <div className="mb-4">
          <h2 className="text-xl text-(--cp-accent)">$ templates</h2>
          <p className="mt-1 text-sm text-(--cp-muted)">
            // apply a routine pack without replacing current habits
          </p>
        </div>

        {templateStatus && (
          <div className="mb-4 border border-(--cp-accent) bg-(--cp-accent-soft) px-3 py-2 text-sm text-(--cp-accent)">
            [ok] {templateStatus}
          </div>
        )}

        <div className="space-y-3">
          {habitTemplates.map((template) => {
            const selected = selectedTemplateId === template.id;

            return (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedTemplateId(template.id)}
                className={[
                  "w-full border p-3 text-left transition",
                  selected
                    ? "border-(--cp-accent) bg-(--cp-accent-soft)"
                    : "border-(--cp-border) bg-(--cp-panel)",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
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

                  <span className="text-sm text-(--cp-muted)">
                    [{template.habits.length}]
                  </span>
                </div>

                <p className="mt-3 text-sm text-(--cp-muted)">
                  {template.description}
                </p>
              </button>
            );
          })}
        </div>

        {selectedTemplate && (
          <div className="mt-5 borde border-(--cp-border) bg-(--cp-surface) p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-(--cp-muted)">preview</p>

              <button
                type="button"
                onClick={() => handleApplyTemplate(selectedTemplate)}
                className="border border-(--cp-accent) bg-(--cp-accent) px-3 py-2 text-sm font-bold text-(--cp-accent-contrast)"
              >
                apply
              </button>
            </div>

            <div className="space-y-1">
              {selectedTemplate.habits.map((habit) => (
                <p key={`${habit.category}-${habit.name}`} className="text-sm">
                  <span className="text-(--cp-muted)">[{habit.category}]</span>{" "}
                  <span className="text-(--cp-text)">
                    {habit.icon} {habit.name}
                  </span>
                  <span className="text-(--cp-muted)">
                    {" "}
                    · {habit.mode}
                    {habit.target ? ` ${habit.target}` : ""}
                    {habit.unit ? ` ${habit.unit}` : ""}
                  </span>
                </p>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mt-8 flex-1 space-y-6">
        {activeHabits.length === 0 ? (
          <EmptyState
            command="$ habits --active"
            title="no active habits"
            message="your routine list is empty. add a custom habit or apply a template to start logging."
            action={
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="border border-(--cp-accent) bg-(--cp-accent) px-4 py-3 text-sm font-bold text-(--cp-accent-contrast)"
              >
                create first habit
              </button>
            }
          />
        ) : (
          categoryOptions.map((category) => {
            const habitsForCategory = groupedHabits[category];

            return (
              <div
                key={category}
                className="border-b border-(--cp-border) pb-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-(--cp-accent)">
                    {categoryLabels[category]}
                  </h2>

                  <span className="text-(--cp-muted)">
                    [{habitsForCategory.length}]
                  </span>
                </div>

                {habitsForCategory.length === 0 ? (
                  <EmptyState
                    command={`$ habits --routine ${category}`}
                    title={`no ${categoryLabels[category].toLowerCase()} habits`}
                    message="this routine has no active checkpoints yet."
                  />
                ) : (
                  <div className="space-y-3">
                    {habitsForCategory.map((habit) => (
                      <article key={habit.id} className="cp-panel p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-xl text-(--cp-text)">
                              <span className="mr-2 text-(--cp-muted)">
                                {habit.icon}
                              </span>
                              {habit.name}
                            </p>

                            <p className="mt-1 text-sm text-(--cp-muted)">
                              mode: {habit.mode}
                              {habit.target ? ` · target: ${habit.target}` : ""}
                              {habit.unit ? ` ${habit.unit}` : ""}
                            </p>

                            <p className="mt-1 text-sm text-(--cp-muted)">
                              schedule: {getScheduleLabel(habit.schedule)}
                            </p>
                          </div>

                          <div className="grid shrink-0 grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => moveHabit(habit.id, "up")}
                              className="border border-(--cp-border) p-2 text-(--cp-muted)"
                              aria-label={`Move ${habit.name} up`}
                            >
                              <ArrowUp size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => moveHabit(habit.id, "down")}
                              className="border border-(--cp-border) p-2 text-(--cp-muted)"
                              aria-label={`Move ${habit.name} down`}
                            >
                              <ArrowDown size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => startEditing(habit)}
                              className="border border-(--cp-border) p-2 text-(--cp-text)"
                              aria-label={`Edit ${habit.name}`}
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleArchiveHabit(habit)}
                              className="border border-(--cp-border) p-2 text-(--cp-muted)"
                              aria-label={`Archive ${habit.name}`}
                            >
                              <Archive size={16} />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      <section className="mt-8 border-b border-(--cp-border) pb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-(--cp-warn)">$ archived</h2>

          <span className="text-(--cp-muted)">[{archivedHabits.length}]</span>
        </div>

        {archivedHabits.length === 0 ? (
          <EmptyState
            command="$ habits --archived"
            title="archive is clean"
            message="archived habits will appear here when you remove them from your active routine."
          />
        ) : (
          <div className="space-y-3">
            {archivedHabits.map((habit) => (
              <article
                key={habit.id}
                className="border border-(--cp-border) bg-(--cp-panel) p-3 opacity-80"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xl text-(--cp-text)">
                      <span className="mr-2 text-(--cp-muted)">
                        {habit.icon}
                      </span>
                      {habit.name}
                    </p>

                    <p className="mt-1 text-sm text-(--cp-muted)">
                      mode: {habit.mode}
                      {habit.target ? ` · target: ${habit.target}` : ""}
                      {habit.unit ? ` ${habit.unit}` : ""}
                    </p>

                    <p className="mt-1 text-sm text-(--cp-muted)">
                      schedule: {getScheduleLabel(habit.schedule)}
                    </p>

                    {habit.archivedAt && (
                      <p className="mt-1 text-sm text-(--cp-muted)">
                        archived:{" "}
                        {new Date(habit.archivedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRestoreHabit(habit)}
                      className="border border-(--cp-border) p-2 text-(--cp-accent)"
                      aria-label={`Restore ${habit.name}`}
                    >
                      <RotateCcw size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteHabit(habit)}
                      className="border border-(--cp-danger) p-2 text-(--cp-danger)"
                      aria-label={`Delete ${habit.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="mt-8 border-t border-(--cp-border) pt-5 text-xl">
        <div className="flex items-center justify-between">
          <span>
            [<span className="text-(--cp-accent)">✓</span>] habits
          </span>
          <span className="text-(--cp-muted)">editable</span>
        </div>
      </footer>
    </TerminalShell>
  );
}
