import {
  eachDayOfInterval,
  endOfWeek,
  endOfYear,
  format,
  isSameYear,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { useMemo } from "react";

import { getDayProgressPercent, toDateKey } from "../../lib/streaks";
import type { Habit, HabitCompletion, ShieldUse } from "../../types/checkpoint";

type YearHeatmapProps = {
  selectedYear: Date;
  habits: Habit[];
  completions: HabitCompletion[];
  shieldUses: ShieldUse[];
  goalPercentage: number;
  onPreviousYear: () => void;
  onNextYear: () => void;
};

type MiniStatProps = {
  label: string;
  value: string;
};

function MiniStat({ label, value }: MiniStatProps) {
  return (
    <div className="border border-(--cp-border) bg-(--cp-panel) p-3">
      <p className="text-xs text-(--cp-muted)">{label}</p>
      <p className="mt-1 text-xl text-(--cp-text)">{value}</p>
    </div>
  );
}

export default function YearHeatmap({
  selectedYear,
  habits,
  completions,
  shieldUses,
  goalPercentage,
  onPreviousYear,
  onNextYear,
}: YearHeatmapProps) {
  const yearData = useMemo(() => {
    const yearStart = startOfYear(selectedYear);
    const yearEnd = endOfYear(selectedYear);

    const gridStart = startOfWeek(yearStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(yearEnd, { weekStartsOn: 1 });

    const gridDays = eachDayOfInterval({
      start: gridStart,
      end: gridEnd,
    }).map((date) => {
      const dateKey = toDateKey(date);
      const progress = getDayProgressPercent(habits, completions, dateKey);
      const shielded = shieldUses.some(
        (shieldUse) => shieldUse.date === dateKey,
      );

      return {
        date,
        dateKey,
        inYear: isSameYear(date, selectedYear),
        shielded,
        ...progress,
      };
    });

    const activeDays = gridDays.filter((day) => day.inYear && day.total > 0);

    const average =
      activeDays.length === 0
        ? 0
        : Math.round(
            activeDays.reduce((sum, day) => sum + day.percent, 0) /
              activeDays.length,
          );

    const goalDays = activeDays.filter(
      (day) => day.percent >= goalPercentage,
    ).length;

    const perfectDays = activeDays.filter((day) => day.percent === 100).length;

    const protectedDays = activeDays.filter((day) => day.shielded).length;

    const completedLogs = completions.filter((completion) => {
      if (!completion.completed) {
        return false;
      }

      const completionDate = new Date(`${completion.date}T00:00:00`);

      return isSameYear(completionDate, selectedYear);
    }).length;

    const monthStats = Array.from({ length: 12 }, (_, monthIndex) => {
      const monthDays = activeDays.filter(
        (day) => day.date.getMonth() === monthIndex,
      );

      const monthAverage =
        monthDays.length === 0
          ? 0
          : Math.round(
              monthDays.reduce((sum, day) => sum + day.percent, 0) /
                monthDays.length,
            );

      const monthGoalDays = monthDays.filter(
        (day) => day.percent >= goalPercentage,
      ).length;

      return {
        label: format(
          new Date(selectedYear.getFullYear(), monthIndex, 1),
          "MMM",
        ),
        average: monthAverage,
        goalDays: monthGoalDays,
        activeDays: monthDays.length,
      };
    });

    const bestMonth = monthStats.reduce(
      (best, month) => (month.average > best.average ? month : best),
      monthStats[0],
    );

    return {
      gridDays,
      activeDays,
      average,
      goalDays,
      perfectDays,
      protectedDays,
      completedLogs,
      monthStats,
      bestMonth,
    };
  }, [selectedYear, habits, completions, shieldUses, goalPercentage]);

  function getCellClassName(day: (typeof yearData.gridDays)[number]) {
    const base = "h-3 w-3 shrink-0 border";

    if (!day.inYear) {
      return `${base} border-transparent bg-transparent`;
    }

    if (day.total === 0) {
      return `${base} border-[var(--cp-border)] bg-[var(--cp-panel)] opacity-40`;
    }

    if (day.shielded) {
      return `${base} border-[var(--cp-warn)] bg-[var(--cp-panel)]`;
    }

    if (day.percent >= 100) {
      return `${base} border-[var(--cp-accent)] bg-[var(--cp-accent)]`;
    }

    if (day.percent >= goalPercentage) {
      return `${base} border-[var(--cp-accent)] bg-[var(--cp-accent-soft)]`;
    }

    if (day.percent >= 50) {
      return `${base} border-[var(--cp-border)] bg-[var(--cp-surface)]`;
    }

    if (day.percent > 0) {
      return `${base} border-[var(--cp-border)] bg-[var(--cp-panel)]`;
    }

    return `${base} border-[var(--cp-border)] bg-transparent`;
  }

  return (
    <section className="mt-8 border-b border-(--cp-border) pb-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl text-(--cp-accent)">$ heatmap --year</h2>
          <p className="mt-1 text-sm text-(--cp-muted)">
            // {format(selectedYear, "yyyy")} activity grid
          </p>
        </div>

        <div className="flex shrink-0 border border-(--cp-border)">
          <button
            type="button"
            onClick={onPreviousYear}
            className="border-r border-(--cp-border) p-2 text-(--cp-text)"
            aria-label="Previous year"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={onNextYear}
            className="p-2 text-(--cp-text)"
            aria-label="Next year"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-(--cp-border) bg-(--cp-panel) p-4">
        <div
          className="grid grid-flow-col grid-rows-7 gap-1"
          style={{ width: "max-content" }}
        >
          {yearData.gridDays.map((day) => (
            <div
              key={day.dateKey}
              className={getCellClassName(day)}
              title={`${day.dateKey} · ${day.percent}% · ${day.completed}/${day.total}`}
              aria-label={`${day.dateKey}: ${day.percent}% complete`}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-(--cp-muted)">
        <span>less</span>
        <span className="inline-block h-3 w-3 border border-(--cp-border) bg-transparent" />
        <span className="inline-block h-3 w-3 border border-(--cp-border) bg-(--cp-panel)" />
        <span className="inline-block h-3 w-3 border border-(--cp-border) bg-(--cp-surface)" />
        <span className="inline-block h-3 w-3 border border-(--cp-accent) bg-(--cp-accent-soft)" />
        <span className="inline-block h-3 w-3 border border-(--cp-accent) bg-(--cp-accent)" />
        <span>more</span>

        <span className="ml-2 inline-flex items-center gap-1 text-(--cp-warn)">
          <Shield size={13} />
          shielded
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <MiniStat label="avg" value={`${yearData.average}%`} />
        <MiniStat label="goal days" value={String(yearData.goalDays)} />
        <MiniStat label="perfect" value={String(yearData.perfectDays)} />
        <MiniStat label="logs" value={String(yearData.completedLogs)} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <MiniStat
          label="best month"
          value={
            yearData.bestMonth.activeDays > 0
              ? `${yearData.bestMonth.label} ${yearData.bestMonth.average}%`
              : "none"
          }
        />

        <MiniStat label="shielded" value={String(yearData.protectedDays)} />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {yearData.monthStats.map((month) => (
          <div
            key={month.label}
            className="border border-(--cp-border) bg-(--cp-panel) p-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-(--cp-text)">
                {month.label}
              </span>

              <span
                className={
                  month.average >= goalPercentage
                    ? "text-(--cp-accent)"
                    : "text-(--cp-muted)"
                }
              >
                {month.average}%
              </span>
            </div>

            <p className="mt-1 text-xs text-(--cp-muted)">
              {month.goalDays}/{month.activeDays} goal days
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
