import type { Habit, HabitCompletion, ShieldUse } from "../types/checkpoint";
import { getDayProgressPercent } from "./streaks";

export const MAX_SHIELDS = 3;
export const GOAL_DAYS_PER_SHIELD = 7;

export function isDateShielded(shieldUses: ShieldUse[], date: string) {
  return shieldUses.some((shieldUse) => shieldUse.date === date);
}

export function getGoalDayCount(
  habits: Habit[],
  completions: HabitCompletion[],
  dailyGoalPercentage: number,
) {
  const loggedDates = Array.from(
    new Set(completions.map((completion) => completion.date)),
  );

  return loggedDates.filter((dateKey) => {
    const progress = getDayProgressPercent(habits, completions, dateKey);

    return progress.total > 0 && progress.percent >= dailyGoalPercentage;
  }).length;
}

export function getShieldMilestonesEarned(goalDayCount: number) {
  return Math.floor(goalDayCount / GOAL_DAYS_PER_SHIELD);
}

export function canUseShieldOnDate({
  shieldCount,
  shieldUses,
  habits,
  completions,
  date,
  dailyGoalPercentage,
}: {
  shieldCount: number;
  shieldUses: ShieldUse[];
  habits: Habit[];
  completions: HabitCompletion[];
  date: string;
  dailyGoalPercentage: number;
}) {
  const progress = getDayProgressPercent(habits, completions, date);

  if (shieldCount <= 0) {
    return false;
  }

  if (isDateShielded(shieldUses, date)) {
    return false;
  }

  if (progress.total === 0) {
    return false;
  }

  if (progress.percent >= dailyGoalPercentage) {
    return false;
  }

  return true;
}
