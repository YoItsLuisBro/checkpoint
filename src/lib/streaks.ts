import {
  eachDayOfInterval,
  endOfWeek,
  format,
  parseISO,
  startOfWeek,
  subDays,
} from "date-fns";
import type { Habit, HabitCompletion } from "../types/checkpoint";
import { getDueHabits, isHabitDueOnDate } from "./schedules";

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

export function getHabitCurrentStreak(
  habit: Habit,
  completions: HabitCompletion[],
  selectedDate: Date,
) {
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
    isHabitCompletedOnDate(completions, habit.id, dateKey),
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
) {
  let streak = 0;
  let cursor = selectedDate;
  let safetyLimit = 0;

  while (safetyLimit < 730) {
    const dateKey = toDateKey(cursor);
    const progress = getDayProgressPercent(habits, completions, dateKey);

    if (progress.total > 0) {
      if (progress.percent < dailyGoalPercentage) {
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
