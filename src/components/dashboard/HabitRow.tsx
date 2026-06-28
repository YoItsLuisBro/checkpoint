import { Flame, Minus, Plus, StickyNote } from "lucide-react";
import type { Habit, HabitCompletion } from "../../types/checkpoint";

type HabitRowProps = {
  habit: Habit;
  completion?: HabitCompletion;
  isDone: boolean;
  streak: number;
  weeklyTargetLabel?: string | null;
  onToggle: () => void;
  onAdjust: (delta: number) => void;
  onOpenNote: () => void;
};

export default function HabitRow({
  habit,
  completion,
  isDone,
  streak,
  weeklyTargetLabel,
  onToggle,
  onAdjust,
  onOpenNote,
}: HabitRowProps) {
  const value = completion?.value ?? 0;
  const note = completion?.note;
  const target = habit.target && habit.target > 0 ? habit.target : 1;
  const unit = habit.unit || (habit.mode === "timer" ? "min" : "");
  const step = habit.mode === "timer" ? 5 : 1;

  const noteButtonClassName = [
    "flex h-9 w-9 items-center justify-center border",
    note
      ? "border-[var(--cp-accent)] text-[var(--cp-accent)]"
      : "border-[var(--cp-border)] text-[var(--cp-muted)]",
  ].join(" ");

  if (habit.mode === "checkbox") {
    return (
      <article className="grid grid-cols-[1fr_40px] items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          className="grid w-full grid-cols-[64px_1fr_64px] items-center gap-2 text-left text-xl"
        >
          <span
            className={
              isDone ? "text-(--cp-accent)" : "text-(--cp-text)"
            }
          >
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

        <button
          type="button"
          onClick={onOpenNote}
          className={noteButtonClassName}
          aria-label={`Open note for ${habit.name}`}
          title={note ? "Note saved" : "Add note"}
        >
          <StickyNote size={16} />
        </button>
      </article>
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenNote}
            className={noteButtonClassName}
            aria-label={`Open note for ${habit.name}`}
            title={note ? "Note saved" : "Add note"}
          >
            <StickyNote size={16} />
          </button>

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

        <div className="cp-dot-bg h-4 overflow-hidden border border-(--cp-border)">
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

      {note && (
        <p className="mt-3 border-t border-(--cp-border) pt-3 text-sm text-(--cp-muted)">
          // note saved
        </p>
      )}
    </article>
  );
}
