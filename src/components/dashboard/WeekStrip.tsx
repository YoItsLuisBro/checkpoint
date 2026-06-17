import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
} from "date-fns";

type WeekStripProps = {
  selectedDate: Date;
  goalPercentage: number;
  getDayPercent: (dateKey: string) => number;
  onSelectDate: (date: Date) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
};

export default function WeekStrip({
  selectedDate,
  goalPercentage,
  getDayPercent,
  onSelectDate,
  onPreviousWeek,
  onNextWeek,
}: WeekStripProps) {
  const days = eachDayOfInterval({
    start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
    end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
  });

  return (
    <section className="mt-8">
      <div className="grid grid-cols-[24px_repeat(7,1fr)_24px] items-end gap-2 text-center">
        <button
          type="button"
          onClick={onPreviousWeek}
          className="text-2xl text-(--cp-accent)"
          aria-label="Previous week"
        >
          &lt;
        </button>

        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const isActive = isSameDay(day, selectedDate);
          const percent = getDayPercent(dateKey);
          const metGoal = percent >= goalPercentage;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(day)}
              className="space-y-2 text-center"
            >
              <div
                className={[
                  "text-lg",
                  isActive
                    ? "text-(--cp-accent)"
                    : "text-(--cp-muted)",
                ].join(" ")}
              >
                {format(day, "EEE")}
              </div>

              <div
                className={[
                  "mx-auto flex h-9 w-full max-w-12 items-center justify-center rounded-md text-xl",
                  isActive
                    ? "bg-(--cp-accent) text-(--cp-accent-contrast)"
                    : "text-(--cp-text)",
                ].join(" ")}
              >
                {isActive ? `*${format(day, "d")}` : format(day, "d")}
              </div>

              <div className="cp-dot-bg mx-auto h-4 w-full max-w-12 overflow-hidden opacity-90">
                <div
                  className={[
                    "h-full transition-all",
                    metGoal ? "bg-(--cp-accent)" : "bg-(--cp-dim)",
                  ].join(" ")}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onNextWeek}
          className="text-2xl text-(--cp-accent)"
          aria-label="Next week"
        >
          &gt;
        </button>
      </div>
    </section>
  );
}