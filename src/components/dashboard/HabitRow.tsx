import { Flame, Minus, Plus } from "lucide-react";
import type { Habit, HabitCompletion } from "../../types/checkpoint";

type HabitRowProps = {
  habit: Habit;
  completion?: HabitCompletion;
  isDone: boolean;
  streak: number;
  onToggle: () => void;
  onAdjust: (delta: number) => void;
  weeklyTargetLabel?: string | null;
};

export default function HabitRow({
  habit,
  completion,
  isDone,
  streak,
  weeklyTargetLabel,
  onToggle,
  onAdjust,
}: HabitRowProps) {
  const value = completion?.value ?? 0;
  const target = habit.target && habit.target > 0 ? habit.target : 1;
  const unit = habit.unit || (habit.mode === "timer" ? "min" : "");
  const step = habit.mode === "timer" ? 5 : 1;

  if (habit.mode === "checkbox") {
    return (
      <button
        onClick={onToggle}
        className="grid w-full grid-cols-[64px_1fr_64px] items-center gap-2 text-left text-xl"
      >
        <span className={isDone ? "text-(--cp-accent)" : "text-(--cp-text)"}>
          [{isDone ? "✓" : " "}]
        </span>

        <span
          className={[
            "truncate",
            isDone
              ? "text-(--cp-muted) line-through decoration-(--cp-dim)"
              : "text-(--cp-text)",
          ].join(" ")}
        >
          <span className="mr-2 text-(--cp-muted)">{habit.icon}</span>
          {habit.name}
          {weeklyTargetLabel && (
            <span className="ml-2 text-sm text-(--cp-muted)">
              [{weeklyTargetLabel}]
            </span>
          )}
        </span>

        <span
          className={[
            "inline-flex items-center justify-end gap-1",
            streak > 0 ? "text-(--cp-accent)" : "text-(--cp-muted)",
          ].join(" ")}
        >
          <Flame size={18} />
          {streak}
        </span>
      </button>
    );
  }

  return (
    <article
      className={[
        "border p-3",
        isDone
          ? "border-(--cp-accent) bg-(--cp-accent-soft)"
          : "border-(--cp-border) bg-(--cp-panel)",
      ].join(" ")}
    >
      <div className="grid grid-cols-[1fr_auto] items-start gap-3">
        <div className="min-w-0">
          <p
            className={[
              "truncate text-xl",
              isDone ? "text-(--cp-accent)" : "text-(--cp-text)",
            ].join(" ")}
          >
            <span className="mr-2 text-(--cp-muted)">{habit.icon}</span>
            {habit.name}
          </p>

          <p className="mt-1 text-sm text-(--cp-muted)">
            {habit.mode}: {value}/{target}
            {unit ? ` ${unit}` : ""}
            {weeklyTargetLabel ? ` · week ${weeklyTargetLabel}` : ""}
          </p>
        </div>

        <span
          className={[
            "inline-flex items-center justify-end gap-1 text-xl",
            streak > 0 ? "text-(--cp-accent)" : "text-(--cp-muted)",
          ].join(" ")}
        >
          <Flame size={18} />
          {streak}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-[44px_1fr_44px] items-center gap-3">
        <button
          type="button"
          onClick={() => onAdjust(-step)}
          className="flex h-11 items-center justify-center border border-(--cp-border) text-(--cp-text)"
          aria-label={`Decrease ${habit.name}`}
        >
          <Minus size={18} />
        </button>

        <div className="h-4 overflow-hidden border border-(--cp-border) cp-dot-bg">
          <div
            className="h-full bg-(--cp-accent) transition-all"
            style={{
              width: `${Math.min(100, Math.round((value / target) * 100))}%`,
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => onAdjust(step)}
          className="flex h-11 items-center justify-center border border-(--cp-accent) text-(--cp-accent)"
          aria-label={`Increase ${habit.name}`}
        >
          <Plus size={18} />
        </button>
      </div>
    </article>
  );
}
