import { getDay } from "date-fns";
import type {
  Habit,
  HabitSchedule,
  HabitScheduleType,
} from "../types/checkpoint";

export const weekdayOptions: Array<{
  value: number;
  label: string;
}> = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

export const scheduleTypeOptions: Array<{
  value: HabitScheduleType;
  label: string;
}> = [
  { value: "daily", label: "daily" },
  { value: "weekdays", label: "weekdays" },
  { value: "weekends", label: "weekends" },
  { value: "specific-days", label: "specific days" },
  { value: "weekly-target", label: "x times per week" },
];

export function getDefaultHabitSchedule(): HabitSchedule {
  return {
    type: "daily",
    days: [],
  };
}

function clampWeeklyTarget(value: number | undefined) {
  if (!value || Number.isNaN(value)) {
    return 3;
  }

  return Math.min(7, Math.max(1, Math.round(value)));
}

export function normalizeHabitSchedule(
  schedule?: HabitSchedule,
): HabitSchedule {
  if (!schedule) {
    return getDefaultHabitSchedule();
  }

  if (schedule.type === "specific-days") {
    const cleanDays = Array.from(new Set(schedule.days ?? []))
      .filter((day) => day >= 0 && day <= 6)
      .sort((a, b) => a - b);

    return {
      type: "specific-days",
      days: cleanDays,
    };
  }

  if (schedule.type === "weekly-target") {
    return {
      type: "weekly-target",
      days: [],
      weeklyTarget: clampWeeklyTarget(schedule.weeklyTarget),
    };
  }

  if (
    schedule.type === "daily" ||
    schedule.type === "weekdays" ||
    schedule.type === "weekends"
  ) {
    return {
      type: schedule.type,
      days: [],
    };
  }

  return getDefaultHabitSchedule();
}

export function isHabitDueOnDate(habit: Habit, date: Date) {
  const schedule = normalizeHabitSchedule(habit.schedule);
  const day = getDay(date);

  if (schedule.type === "daily") {
    return true;
  }

  if (schedule.type === "weekdays") {
    return day >= 1 && day <= 5;
  }

  if (schedule.type === "weekends") {
    return day === 0 || day === 6;
  }

  if (schedule.type === "specific-days") {
    return schedule.days?.includes(day) ?? false;
  }

  if (schedule.type === "weekly-target") {
    return true;
  }

  return true;
}

export function getDueHabits(habits: Habit[], date: Date) {
  return habits.filter(
    (habit) => !habit.archivedAt && isHabitDueOnDate(habit, date),
  );
}

export function getScheduleLabel(schedule?: HabitSchedule) {
  const normalized = normalizeHabitSchedule(schedule);

  if (normalized.type === "daily") {
    return "daily";
  }

  if (normalized.type === "weekdays") {
    return "weekdays";
  }

  if (normalized.type === "weekends") {
    return "weekends";
  }

  if (normalized.type === "weekly-target") {
    return `${normalized.weeklyTarget ?? 3}x/week`;
  }

  const labels = weekdayOptions
    .filter((option) => normalized.days?.includes(option.value))
    .map((option) => option.label);

  return labels.length > 0 ? labels.join(", ") : "specific days";
}
