import {
  eachDayOfInterval,
  endOfWeek,
  format,
  parseISO,
  startOfWeek,
  subDays,
  subWeeks,
} from "date-fns";
import type { Habit, HabitCompletion, ShieldUse } from "../types/checkpoint";
import {
  getDueHabits,
  isHabitDueOnDate,
  normalizeHabitSchedule,
} from "./schedules";

export function toDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function isHabitCompletedOnDate(
  completions: HabitCompletion[],
  habitId: string,
  dateKey: string,
) {
  return completions.some(
    (completion) =>
      completion.habitId === habitId &&
      completion.date === dateKey &&
      completion.completed,
  );
}

export function getWeeklyTargetProgress(
  habit: Habit,
  completions: HabitCompletion[],
  selectedDate: Date,
) {
  const schedule = normalizeHabitSchedule(habit.schedule);
  const target =
    schedule.type === "weekly-target" ? (schedule.weeklyTarget ?? 3) : 1;

  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
    end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
  });

  const completed = weekDays.filter((day) =>
    isHabitCompletedOnDate(completions, habit.id, toDateKey(day)),
  ).length;

  const percent = Math.min(100, Math.round((completed / target) * 100));

  return {
    completed,
    target,
    percent,
    isComplete: completed >= target,
  };
}

function isHabitCompleteForProgress(
  habit: Habit,
  completions: HabitCompletion[],
  dateKey: string,
) {
  const schedule = normalizeHabitSchedule(habit.schedule);

  if (schedule.type === "weekly-target") {
    const selectedDate = parseISO(dateKey);
    const completedToday = isHabitCompletedOnDate(
      completions,
      habit.id,
      dateKey,
    );

    const weeklyProgress = getWeeklyTargetProgress(
      habit,
      completions,
      selectedDate,
    );

    return completedToday || weeklyProgress.isComplete;
  }

  return isHabitCompletedOnDate(completions, habit.id, dateKey);
}

function isDateProtectedByShield(shieldUses: ShieldUse[], dateKey: string) {
  return shieldUses.some((shieldUse) => shieldUse.date === dateKey);
}

export function getHabitCurrentStreak(
  habit: Habit,
  completions: HabitCompletion[],
  selectedDate: Date,
) {
  const schedule = normalizeHabitSchedule(habit.schedule);

  if (schedule.type === "weekly-target") {
    let streak = 0;
    let cursor = selectedDate;
    let safetyLimit = 0;

    while (safetyLimit < 260) {
      const weeklyProgress = getWeeklyTargetProgress(
        habit,
        completions,
        cursor,
      );

      if (!weeklyProgress.isComplete) {
        break;
      }

      streak += 1;
      cursor = subWeeks(cursor, 1);
      safetyLimit += 1;
    }

    return streak;
  }

  let streak = 0;
  let cursor = selectedDate;
  let safetyLimit = 0;

  while (safetyLimit < 730) {
    if (isHabitDueOnDate(habit, cursor)) {
      const dateKey = toDateKey(cursor);

      const completed = isHabitCompletedOnDate(completions, habit.id, dateKey);

      if (!completed) {
        break;
      }

      streak += 1;
    }

    cursor = subDays(cursor, 1);
    safetyLimit += 1;
  }

  return streak;
}

export function getDayProgressPercent(
  habits: Habit[],
  completions: HabitCompletion[],
  dateKey: string,
) {
  const date = parseISO(dateKey);
  const dueHabits = getDueHabits(habits, date);

  const completed = dueHabits.filter((habit) =>
    isHabitCompleteForProgress(habit, completions, dateKey),
  ).length;

  const total = dueHabits.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    completed,
    total,
    percent,
  };
}

export function getDailyGoalStreak(
  habits: Habit[],
  completions: HabitCompletion[],
  selectedDate: Date,
  dailyGoalPercentage: number,
  shieldUses: ShieldUse[] = [],
) {
  let streak = 0;
  let cursor = selectedDate;
  let safetyLimit = 0;

  while (safetyLimit < 730) {
    const dateKey = toDateKey(cursor);
    const progress = getDayProgressPercent(habits, completions, dateKey);

    if (progress.total > 0) {
      const goalMet = progress.percent >= dailyGoalPercentage;
      const shielded = isDateProtectedByShield(shieldUses, dateKey);

      if (!goalMet && !shielded) {
        break;
      }

      streak += 1;
    }

    cursor = subDays(cursor, 1);
    safetyLimit += 1;
  }

  return streak;
}

export function getPerfectDaysThisWeek(
  habits: Habit[],
  completions: HabitCompletion[],
  selectedDate: Date,
) {
  const days = eachDayOfInterval({
    start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
    end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
  });

  return days.filter((day) => {
    const dateKey = toDateKey(day);
    const progress = getDayProgressPercent(habits, completions, dateKey);

    return progress.total > 0 && progress.percent === 100;
  }).length;
}
