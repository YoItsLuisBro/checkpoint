import {
  eachDayOfInterval,
  eachWeekOfInterval,
  isAfter,
  parseISO,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { ArrowLeft, CalendarDays, StickyNote } from "lucide-react";
import { useMemo } from "react";

import {
  getHabitCurrentStreak,
  getWeeklyTargetProgress,
  isHabitCompletedOnDate,
  toDateKey,
} from "../../lib/streaks";
import {
  getScheduleLabel,
  isHabitDueOnDate,
  normalizeHabitSchedule,
  weekdayOptions,
} from "../../lib/schedules";
import type { Habit, HabitCompletion } from "../../types/checkpoint";

type HabitDetailPanelProps = {
  habit: Habit;
  completions: HabitCompletion[];
  today: Date;
  onBack: () => void;
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

function getSafeCreatedDate(habit: Habit) {
  const created = habit.createdAt ? parseISO(habit.createdAt) : new Date();

  if (Number.isNaN(created.getTime())) {
    return new Date();
  }

  return created;
}

function getHabitBestDailyStreak({
  habit,
  completions,
  days,
}: {
  habit: Habit;
  completions: HabitCompletion[];
  days: Date[];
}) {
  let best = 0;
  let current = 0;

  days.forEach((day) => {
    if (!isHabitDueOnDate(habit, day)) {
      return;
    }

    const completed = isHabitCompletedOnDate(
      completions,
      habit.id,
      toDateKey(day),
    );

    if (completed) {
      current += 1;
      best = Math.max(best, current);
      return;
    }

    current = 0;
  });

  return best;
}

function getHabitBestWeeklyStreak({
  habit,
  completions,
  weeks,
}: {
  habit: Habit;
  completions: HabitCompletion[];
  weeks: Date[];
}) {
  let best = 0;
  let current = 0;

  weeks.forEach((weekStart) => {
    const progress = getWeeklyTargetProgress(habit, completions, weekStart);

    if (progress.isComplete) {
      current += 1;
      best = Math.max(best, current);
      return;
    }

    current = 0;
  });

  return best;
}

export default function HabitDetailPanel({
  habit,
  completions,
  today,
  onBack,
}: HabitDetailPanelProps) {
  const stats = useMemo(() => {
    const schedule = normalizeHabitSchedule(habit.schedule);
    const createdDate = startOfDay(getSafeCreatedDate(habit));
    const todayDate = startOfDay(today);

    const startDate = isAfter(createdDate, todayDate) ? todayDate : createdDate;

    const days = eachDayOfInterval({
      start: startDate,
      end: todayDate,
    });

    const habitCompletions = completions
      .filter((completion) => completion.habitId === habit.id)
      .sort((a, b) => a.date.localeCompare(b.date));

    const completedCompletions = habitCompletions.filter(
      (completion) => completion.completed,
    );

    const noteCount = habitCompletions.filter((completion) =>
      Boolean(completion.note?.trim()),
    ).length;

    const lastCompleted = completedCompletions.at(-1);

    const currentStreak = getHabitCurrentStreak(habit, completions, todayDate);

    if (schedule.type === "weekly-target") {
      const weeks = eachWeekOfInterval(
        {
          start: startOfWeek(startDate, { weekStartsOn: 1 }),
          end: todayDate,
        },
        { weekStartsOn: 1 },
      );

      const completedWeeks = weeks.filter(
        (weekStart) =>
          getWeeklyTargetProgress(habit, completions, weekStart).isComplete,
      );

      const currentWeekProgress = getWeeklyTargetProgress(
        habit,
        completions,
        todayDate,
      );

      const bestStreak = getHabitBestWeeklyStreak({
        habit,
        completions,
        weeks,
      });

      const completionRate =
        weeks.length === 0
          ? 0
          : Math.round((completedWeeks.length / weeks.length) * 100);

      return {
        schedule,
        modeLabel: habit.mode,
        totalCompletions: completedCompletions.length,
        currentStreak,
        bestStreak,
        completionRate,
        dueCount: weeks.length,
        completedDueCount: completedWeeks.length,
        lastCompletedDate: lastCompleted?.date ?? "never",
        noteCount,
        weeklyProgressLabel: `${currentWeekProgress.completed}/${currentWeekProgress.target}`,
        bestWeekday: "weekly target",
        weakestWeekday: "weekly target",
      };
    }

    const dueDays = days.filter((day) => isHabitDueOnDate(habit, day));

    const completedDueDays = dueDays.filter((day) =>
      isHabitCompletedOnDate(completions, habit.id, toDateKey(day)),
    );

    const bestStreak = getHabitBestDailyStreak({
      habit,
      completions,
      days,
    });

    const completionRate =
      dueDays.length === 0
        ? 0
        : Math.round((completedDueDays.length / dueDays.length) * 100);

    const weekdayStats = weekdayOptions.map((weekday) => {
      const matchingDays = dueDays.filter(
        (day) => day.getDay() === weekday.value,
      );

      const completedDays = matchingDays.filter((day) =>
        isHabitCompletedOnDate(completions, habit.id, toDateKey(day)),
      );

      const rate =
        matchingDays.length === 0
          ? 0
          : Math.round((completedDays.length / matchingDays.length) * 100);

      return {
        label: weekday.label,
        due: matchingDays.length,
        completed: completedDays.length,
        rate,
      };
    });

    const activeWeekdays = weekdayStats.filter((weekday) => weekday.due > 0);

    const bestWeekday =
      activeWeekdays.length === 0
        ? undefined
        : activeWeekdays.reduce((best, current) =>
            current.rate > best.rate ? current : best,
          );

    const weakestWeekday =
      activeWeekdays.length === 0
        ? undefined
        : activeWeekdays.reduce((weakest, current) =>
            current.rate < weakest.rate ? current : weakest,
          );

    return {
      schedule,
      modeLabel: habit.mode,
      totalCompletions: completedCompletions.length,
      currentStreak,
      bestStreak,
      completionRate,
      dueCount: dueDays.length,
      completedDueCount: completedDueDays.length,
      lastCompletedDate: lastCompleted?.date ?? "never",
      noteCount,
      weeklyProgressLabel: null,
      bestWeekday: bestWeekday
        ? `${bestWeekday.label} ${bestWeekday.rate}%`
        : "none",
      weakestWeekday: weakestWeekday
        ? `${weakestWeekday.label} ${weakestWeekday.rate}%`
        : "none",
    };
  }, [habit, completions, today]);

  const recentCompletions = useMemo(() => {
    return completions
      .filter((completion) => completion.habitId === habit.id)
      .filter((completion) => completion.completed || completion.note)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 8);
  }, [habit.id, completions]);

  return (
    <section className="mt-8 border-b border-(--cp-border) pb-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-2 border border-(--cp-border) px-3 py-2 text-sm text-(--cp-muted)"
      >
        <ArrowLeft size={16} />
        back to stats
      </button>

      <div className="cp-panel p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-2xl text-(--cp-accent)">
              $ habit --stats
            </h2>

            <p className="mt-2 truncate text-xl text-(--cp-text)">
              <span className="mr-2 text-(--cp-muted)">{habit.icon}</span>
              {habit.name}
            </p>

            <p className="mt-1 text-sm text-(--cp-muted)">
              {habit.category} · {stats.modeLabel} ·{" "}
              {getScheduleLabel(stats.schedule)}
            </p>
          </div>

          <CalendarDays
            size={24}
            className="shrink-0 text-(--cp-accent)"
          />
        </div>

        {stats.weeklyProgressLabel && (
          <div className="mt-4 border border-(--cp-accent) bg-(--cp-accent-soft) p-3 text-(--cp-accent)">
            current week: [{stats.weeklyProgressLabel}]
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <MiniStat label="current" value={String(stats.currentStreak)} />
          <MiniStat label="best" value={String(stats.bestStreak)} />
          <MiniStat label="rate" value={`${stats.completionRate}%`} />
          <MiniStat label="logs" value={String(stats.totalCompletions)} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <MiniStat
            label="completed"
            value={`${stats.completedDueCount}/${stats.dueCount}`}
          />
          <MiniStat label="last done" value={stats.lastCompletedDate} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <MiniStat label="best day" value={stats.bestWeekday} />
          <MiniStat label="weakest" value={stats.weakestWeekday} />
        </div>

        <div className="mt-4 flex items-center gap-2 border border-(--cp-border) bg-(--cp-surface) p-3 text-sm text-(--cp-muted)">
          <StickyNote size={16} />
          notes saved: {stats.noteCount}
        </div>
      </div>

      <section className="mt-6">
        <h3 className="mb-3 text-xl text-(--cp-accent)">
          $ habit --history
        </h3>

        {recentCompletions.length === 0 ? (
          <div className="border border-(--cp-border) bg-(--cp-panel) p-4 text-sm text-(--cp-muted)">
            // no history yet for this habit
          </div>
        ) : (
          <div className="space-y-3">
            {recentCompletions.map((completion) => (
              <article
                key={completion.id}
                className="border border-(--cp-border) bg-(--cp-panel) p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-(--cp-text)">{completion.date}</p>

                  <span
                    className={
                      completion.completed
                        ? "text-(--cp-accent)"
                        : "text-(--cp-muted)"
                    }
                  >
                    [{completion.completed ? "done" : "note"}]
                  </span>
                </div>

                <p className="mt-1 text-sm text-(--cp-muted)">
                  value: {completion.value}
                  {habit.unit ? ` ${habit.unit}` : ""}
                </p>

                {completion.note && (
                  <p className="mt-3 border-t border-(--cp-border) pt-3 text-sm text-(--cp-muted)">
                    // {completion.note}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
