import { eachDayOfInterval, endOfWeek, format, startOfWeek } from "date-fns";

import EmptyState from "../ui/EmptyState";

import type {
  Habit,
  HabitCategory,
  HabitCompletion,
} from "../../types/checkpoint";
import { getDayProgressPercent, toDateKey } from "../../lib/streaks";
import { getDueHabits } from "../../lib/schedules";

type WeeklyReportProps = {
  selectedDate: Date;
  habits: Habit[];
  completions: HabitCompletion[];
  goalPercentage: number;
};

const categoryLabels: Record<HabitCategory, string> = {
  morning: "morning",
  day: "day",
  night: "night",
};

const categoryOrder: HabitCategory[] = ["morning", "day", "night"];

export default function WeeklyReport({
  selectedDate,
  habits,
  completions,
  goalPercentage,
}: WeeklyReportProps) {
  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
    end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
  });

  const weekDateKeys = new Set(weekDays.map((day) => toDateKey(day)));
  const activeHabits = habits.filter((habit) => !habit.archivedAt);
  const activeHabitIds = new Set(activeHabits.map((habit) => habit.id));

  const completedLogsThisWeek = completions.filter(
    (completion) =>
      completion.completed &&
      weekDateKeys.has(completion.date) &&
      activeHabitIds.has(completion.habitId),
  ).length;

  const dayProgress = weekDays.map((day) => {
    const dateKey = toDateKey(day);
    const progress = getDayProgressPercent(habits, completions, dateKey);

    return {
      date: day,
      dateKey,
      label: format(day, "EEEE"),
      shortLabel: format(day, "EEE"),
      ...progress,
    };
  });

  const activeDays = dayProgress.filter((day) => day.total > 0);

  if (activeDays.length === 0) {
    return (
      <section className="mt-8 border-b border-(--cp-border) pb-6">
        <EmptyState
          command="$ report --week"
          title="no weekly data"
          message="no habits are scheduled this week. add a habit or change your schedules to generate a report."
        />
      </section>
    );
  }

  const weeklyAverage =
    activeDays.length === 0
      ? 0
      : Math.round(
          activeDays.reduce((sum, day) => sum + day.percent, 0) /
            activeDays.length,
        );

  const goalDays = dayProgress.filter(
    (day) => day.total > 0 && day.percent >= goalPercentage,
  ).length;

  const perfectDays = dayProgress.filter(
    (day) => day.total > 0 && day.percent === 100,
  ).length;

  const bestDay =
    activeDays.length === 0
      ? null
      : [...activeDays].sort((a, b) => b.percent - a.percent)[0];

  const weakestDay =
    activeDays.length === 0
      ? null
      : [...activeDays].sort((a, b) => a.percent - b.percent)[0];

  const routineStats = categoryOrder.map((category) => {
    const categoryHabits = activeHabits.filter(
      (habit) => habit.category === category,
    );

    const categoryProgress = weekDays.map((day) => {
      const dateKey = toDateKey(day);
      const dueHabits = getDueHabits(categoryHabits, day);

      const completed = dueHabits.filter((habit) =>
        completions.some(
          (completion) =>
            completion.habitId === habit.id &&
            completion.date === dateKey &&
            completion.completed,
        ),
      ).length;

      const total = dueHabits.length;
      const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

      return {
        dateKey,
        completed,
        total,
        percent,
      };
    });

    const activeRoutineDays = categoryProgress.filter((day) => day.total > 0);

    const average =
      activeRoutineDays.length === 0
        ? 0
        : Math.round(
            activeRoutineDays.reduce((sum, day) => sum + day.percent, 0) /
              activeRoutineDays.length,
          );

    return {
      category,
      label: categoryLabels[category],
      average,
      activeDays: activeRoutineDays.length,
    };
  });

  const activeRoutineStats = routineStats.filter(
    (routine) => routine.activeDays > 0,
  );

  const strongestRoutine =
    activeRoutineStats.length === 0
      ? null
      : [...activeRoutineStats].sort((a, b) => b.average - a.average)[0];

  const weakestRoutine =
    activeRoutineStats.length === 0
      ? null
      : [...activeRoutineStats].sort((a, b) => a.average - b.average)[0];

  const reportLines = [
    {
      tag: weeklyAverage >= goalPercentage ? "ok" : "warn",
      text: `weekly average: ${weeklyAverage}%`,
    },
    {
      tag: "ok",
      text: `${completedLogsThisWeek} completions logged`,
    },
    {
      tag: goalDays >= 5 ? "ok" : "warn",
      text: `${goalDays}/7 days met the ${goalPercentage}% goal`,
    },
    {
      tag: perfectDays > 0 ? "ok" : "info",
      text: `${perfectDays} perfect day${perfectDays === 1 ? "" : "s"}`,
    },
    {
      tag: bestDay && bestDay.total > 0 ? "ok" : "info",
      text:
        bestDay && bestDay.total > 0
          ? `best day: ${bestDay.label.toLowerCase()} (${bestDay.percent}%)`
          : "best day: no data yet",
    },
    {
      tag: strongestRoutine ? "ok" : "info",
      text: strongestRoutine
        ? `strongest routine: ${strongestRoutine.label} (${strongestRoutine.average}%)`
        : "strongest routine: no data yet",
    },
    {
      tag:
        weakestRoutine && weakestRoutine.average < goalPercentage
          ? "warn"
          : "ok",
      text: weakestRoutine
        ? `weakest routine: ${weakestRoutine.label} (${weakestRoutine.average}%)`
        : "weakest routine: no data yet",
    },
    {
      tag: weakestDay && weakestDay.percent < goalPercentage ? "tip" : "ok",
      text:
        weakestDay && weakestDay.total > 0
          ? `watch ${weakestDay.label.toLowerCase()} (${weakestDay.percent}%)`
          : "no weak day detected",
    },
  ];

  return (
    <section className="mt-8 border-b border-(--cp-border) pb-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-(--cp-accent)">
            $ report --week
          </h2>
          <p className="mt-1 text-sm text-(--cp-muted)">
            // {format(weekDays[0], "MMM d")} -{" "}
            {format(weekDays[weekDays.length - 1], "MMM d")}
          </p>
        </div>

        <span className="text-(--cp-muted)">{weeklyAverage}%</span>
      </div>

      <div className="space-y-2 border border-(--cp-border) bg-(--cp-panel) p-3">
        {reportLines.map((line, index) => (
          <p key={`${line.tag}-${index}`} className="text-sm">
            <span className={getTagClassName(line.tag)}>[{line.tag}]</span>{" "}
            <span className="text-(--cp-text)">{line.text}</span>
          </p>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2">
        {dayProgress.map((day) => {
          const metGoal = day.total > 0 && day.percent >= goalPercentage;

          return (
            <div key={day.dateKey} className="text-center">
              <p
                className={[
                  "mb-2 text-xs",
                  metGoal ? "text-(--cp-accent)" : "text-(--cp-muted)",
                ].join(" ")}
              >
                {day.shortLabel}
              </p>

              <div
                className={[
                  "flex aspect-square items-center justify-center border text-xs",
                  metGoal
                    ? "border-(--cp-accent) bg-(--cp-accent-soft) text-(--cp-accent)"
                    : "border-(--cp-border) bg-(--cp-panel) text-(--cp-muted)",
                ].join(" ")}
              >
                {day.total === 0 ? "--" : `${day.percent}`}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        {routineStats.map((routine) => (
          <div
            key={routine.category}
            className="grid grid-cols-[72px_1fr_48px] items-center gap-3"
          >
            <span className="text-sm text-(--cp-muted)">{routine.label}</span>

            <div className="cp-dot-bg h-3 border border-(--cp-border)">
              <div
                className="h-full bg-(--cp-accent) transition-all"
                style={{ width: `${routine.average}%` }}
              />
            </div>

            <span className="text-right text-sm text-(--cp-muted)">
              {routine.activeDays === 0 ? "--" : `${routine.average}%`}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function getTagClassName(tag: string) {
  if (tag === "ok") {
    return "text-[var(--cp-accent)]";
  }

  if (tag === "warn") {
    return "text-[var(--cp-warn)]";
  }

  if (tag === "tip") {
    return "text-[var(--cp-info)]";
  }

  return "text-[var(--cp-muted)]";
}
