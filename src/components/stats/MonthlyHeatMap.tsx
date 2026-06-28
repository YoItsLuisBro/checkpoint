import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
} from "date-fns";

import EmptyState from "../ui/EmptyState";
import type { Habit, HabitCompletion } from "../../types/checkpoint";
import { getDayProgressPercent, toDateKey } from "../../lib/streaks";

type MonthlyHeatmapProps = {
  selectedMonth: Date;
  habits: Habit[];
  completions: HabitCompletion[];
  goalPercentage: number;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
};

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMondayStartOffset(date: Date) {
  const day = getDay(date);

  return day === 0 ? 6 : day - 1;
}

function getCellStyle(percent: number, total: number, goalPercentage: number) {
  if (total === 0) {
    return {
      backgroundColor: "transparent",
      borderColor: "var(--cp-border)",
      color: "var(--cp-dim)",
    };
  }

  if (percent === 100) {
    return {
      backgroundColor: "var(--cp-accent)",
      borderColor: "var(--cp-accent)",
      color: "var(--cp-accent-contrast)",
    };
  }

  if (percent >= goalPercentage) {
    return {
      backgroundColor: "var(--cp-accent-soft)",
      borderColor: "var(--cp-accent)",
      color: "var(--cp-accent)",
    };
  }

  if (percent > 0) {
    return {
      backgroundColor: "var(--cp-dim)",
      borderColor: "var(--cp-border)",
      color: "var(--cp-text)",
    };
  }

  return {
    backgroundColor: "var(--cp-panel)",
    borderColor: "var(--cp-border)",
    color: "var(--cp-muted)",
  };
}

export default function MonthlyHeatmap({
  selectedMonth,
  habits,
  completions,
  goalPercentage,
  onPreviousMonth,
  onNextMonth,
}: MonthlyHeatmapProps) {
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);

  const days = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  const leadingBlanks = Array.from({
    length: getMondayStartOffset(monthStart),
  });

  const monthProgress = days.map((day) => {
    const dateKey = toDateKey(day);
    const progress = getDayProgressPercent(habits, completions, dateKey);

    return {
      date: day,
      dateKey,
      ...progress,
    };
  });

  const activeDays = monthProgress.filter((day) => day.total > 0);

  const average =
    activeDays.length === 0
      ? 0
      : Math.round(
          activeDays.reduce((sum, day) => sum + day.percent, 0) /
            activeDays.length,
        );

  const perfectDays = monthProgress.filter(
    (day) => day.total > 0 && day.percent === 100,
  ).length;

  const goalDays = monthProgress.filter(
    (day) => day.total > 0 && day.percent >= goalPercentage,
  ).length;

  return (
    <section className="mt-8 border-b border-(--cp-border) pb-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onPreviousMonth}
          className="text-2xl text-(--cp-accent)"
          aria-label="Previous month"
        >
          &lt;
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-(--cp-accent)">
            $ {format(selectedMonth, "MMM yyyy")}
          </h2>
          <p className="text-sm text-(--cp-muted)">// monthly heatmap</p>
        </div>

        <button
          type="button"
          onClick={onNextMonth}
          className="text-2xl text-(--cp-accent)"
          aria-label="Next month"
        >
          &gt;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekdayLabels.map((label) => (
          <div key={label} className="text-center text-xs text-(--cp-muted)">
            {label}
          </div>
        ))}

        {leadingBlanks.map((_, index) => (
          <div key={`blank-${index}`} className="aspect-square" />
        ))}

        {monthProgress.map((day) => {
          const style = getCellStyle(day.percent, day.total, goalPercentage);

          return (
            <div
              key={day.dateKey}
              title={`${format(day.date, "MMM d")}: ${day.percent}%`}
              className="flex aspect-square items-center justify-center border text-xs"
              style={style}
            >
              {format(day.date, "d")}
            </div>
          );
        })}
      </div>

      {activeDays.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            command="$ heatmap --month"
            title="no scheduled habit data"
            message="this month has no due habits yet. add habits, adjust schedules, or navigate to a month with logs."
          />
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-3 gap-3">
          <MiniStat label="avg" value={`${average}%`} />
          <MiniStat label="goal days" value={String(goalDays)} />
          <MiniStat label="perfect" value={String(perfectDays)} />
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 text-xs text-(--cp-muted)">
        <span>less</span>
        <span className="h-3 w-3 border border-(--cp-border) bg-(--cp-panel)" />
        <span className="h-3 w-3 border border-(--cp-border) bg-(--cp-dim)" />
        <span className="h-3 w-3 border border-(--cp-accent) bg-(--cp-accent-soft)" />
        <span className="h-3 w-3 border border-(--cp-accent) bg-(--cp-accent)" />
        <span>more</span>
      </div>
    </section>
  );
}

type MiniStatProps = {
  label: string;
  value: string;
};

function MiniStat({ label, value }: MiniStatProps) {
  return (
    <div className="border border-(--cp-border) bg-(--cp-panel) p-3 text-center">
      <p className="text-xs text-(--cp-muted)">{label}</p>
      <p className="mt-1 text-xl font-bold text-(--cp-text)">{value}</p>
    </div>
  );
}
