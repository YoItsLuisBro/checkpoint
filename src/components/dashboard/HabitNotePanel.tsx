import { useEffect, useState } from "react";
import { Save, Trash2, X } from "lucide-react";

import type { Habit, HabitCompletion } from "../../types/checkpoint";

type HabitNotePanelProps = {
  habit: Habit;
  completion?: HabitCompletion;
  dateLabel: string;
  onSave: (note: string) => void;
  onClose: () => void;
};

export default function HabitNotePanel({
  habit,
  completion,
  dateLabel,
  onSave,
  onClose,
}: HabitNotePanelProps) {
  const [note, setNote] = useState(completion?.note ?? "");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNote(completion?.note ?? "");
  }, [completion?.note, habit.id]);

  function handleSave() {
    onSave(note);
    onClose();
  }

  function handleClear() {
    onSave("");
    setNote("");
    onClose();
  }

  return (
    <section className="mt-6 border border-(--cp-accent) bg-(--cp-accent-soft) p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-xl text-(--cp-accent)">
            $ note --habit
          </h2>

          <p className="mt-1 text-sm text-(--cp-muted)">
            {habit.icon} {habit.name} · {dateLabel}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 border border-(--cp-border) p-2 text-(--cp-muted)"
          aria-label="Close note editor"
        >
          <X size={16} />
        </button>
      </div>

      <label className="block space-y-2">
        <span className="text-sm text-(--cp-muted)">daily note</span>

        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={5}
          placeholder="What happened? Add context, wins, blockers, or details..."
          className="cp-input resize-none leading-relaxed"
        />
      </label>

      <div className="mt-4 grid grid-cols-[1fr_auto] gap-3">
        <button type="button" onClick={handleSave} className="cp-primary-btn">
          <Save size={18} />
          save note
        </button>

        <button
          type="button"
          onClick={handleClear}
          className="border border-(--cp-danger) px-4 text-(--cp-danger)"
          aria-label="Clear note"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </section>
  );
}
