import { useState } from "react";
import { CalendarDays, Flame, Shield } from "lucide-react";
import { addWeeks, subWeeks } from "date-fns";

import TerminalShell from "../components/layout/TerminalShell";
import TopNav, { type AppView } from "../components/layout/TopNav";
import TerminalHeader from "../components/dashboard/TerminalHeader";
import WeekStrip from "../components/dashboard/WeekStrip";
import RoutineBlock from "../components/dashboard/RoutineBlock";
import DailyProgressBar from "../components/dashboard/DailyProgressBar";
import EmptyState from "../components/ui/EmptyState";

import { getReadableDate } from "../lib/dates";
import { useCheckpointStore } from "../store/useCheckpointStore";
import { getDueHabits } from "../lib/schedules";
import type { Habit, HabitCategory } from "../types/checkpoint";

import {
  getDailyGoalStreak,
  getDayProgressPercent,
  getHabitCurrentStreak,
  getPerfectDaysThisWeek,
  getWeeklyTargetProgress,
  toDateKey,
} from "../lib/streaks";

const categoryConfig: Record<
  HabitCategory,
  {
    label: string;
    icon: string;
    accent: string;
  }
> = {
  morning: {
    label: "Morning",
    icon: "☀",
    accent: "text-[var(--cp-warn)]",
  },
  day: {
    label: "Daily",
    icon: "◇",
    accent: "text-[var(--cp-accent)]",
  },
  night: {
    label: "Night",
    icon: "☾",
    accent: "text-[var(--cp-info)]",
  },
};

type DashboardPageProps = {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
};

export default function DashboardPage({
  activeView,
  onChangeView,
}: DashboardPageProps) {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const selectedDateKey = toDateKey(selectedDate);

  const habits = useCheckpointStore((state) => state.habits);
  const completions = useCheckpointStore((state) => state.completions);
  const settings = useCheckpointStore((state) => state.settings);
  const toggleHabit = useCheckpointStore((state) => state.toggleHabit);
  const adjustHabitValue = useCheckpointStore(
    (state) => state.adjustHabitValue,
  );

  const dueHabits = getDueHabits(habits, selectedDate);

  console.log(
    "ALL HABITS:",
    habits.map((habit) => ({
      name: habit.name,
      category: habit.category,
      schedule: habit.schedule,
      archivedAt: habit.archivedAt,
    })),
  );

  console.log(
    "DUE HABITS:",
    dueHabits.map((habit) => ({
      name: habit.name,
      category: habit.category,
      schedule: habit.schedule,
    })),
  );

  const isHabitDoneForDate = (habitId: string, dateKey: string) => {
    return completions.some(
      (completion) =>
        completion.habitId === habitId &&
        completion.date === dateKey &&
        completion.completed,
    );
  };

  const isHabitDone = (habitId: string) => {
    const habit = habits.find((item) => item.id === habitId);
    const completedToday = isHabitDoneForDate(habitId, selectedDateKey);

    if (!habit) {
      return completedToday;
    }

    if (habit.schedule?.type === "weekly-target") {
      const weeklyProgress = getWeeklyTargetProgress(
        habit,
        completions,
        selectedDate,
      );

      return completedToday || weeklyProgress.isComplete;
    }

    return completedToday;
  };

  const getHabitCompletion = (habitId: string) => {
    return completions.find(
      (completion) =>
        completion.habitId === habitId && completion.date === selectedDateKey,
    );
  };

  const getDayPercent = (dateKey: string) => {
    return getDayProgressPercent(habits, completions, dateKey).percent;
  };

  const progress = getDayProgressPercent(habits, completions, selectedDateKey);

  const dailyStreak = getDailyGoalStreak(
    habits,
    completions,
    selectedDate,
    settings.dailyGoalPercentage,
  );

  const shieldCount = getPerfectDaysThisWeek(habits, completions, selectedDate);

  const getHabitStreak = (habitId: string) => {
    const habit = habits.find((item) => item.id === habitId);

    if (!habit) {
      return 0;
    }

    return getHabitCurrentStreak(habit, completions, selectedDate);
  };

  const getHabitWeeklyTargetLabel = (habit: Habit) => {
    if (habit.schedule?.type !== "weekly-target") {
      return null;
    }

    const weeklyProgress = getWeeklyTargetProgress(
      habit,
      completions,
      selectedDate
    );

    return `${weeklyProgress.completed}/${weeklyProgress.target}`
  }

  const groupedHabits: Record<HabitCategory, typeof habits> = {
    morning: [],
    day: [],
    night: [],
  };

  dueHabits
    .slice()
    .sort((a, b) => a.order - b.order)
    .forEach((habit) => {
      if (
        habit.category === "morning" ||
        habit.category === "day" ||
        habit.category === "night"
      ) {
        groupedHabits[habit.category].push(habit);
      }
    });

  return (
    <TerminalShell>
      <TopNav activeView={activeView} onChangeView={onChangeView} />

      <TerminalHeader settings={settings} />

      <section className="mt-8 space-y-3">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <CalendarDays size={20} className="text-(--cp-accent)" />
          <span>{getReadableDate(selectedDate)}</span>
        </div>

        <div className="flex items-center gap-3 text-xl">
          <span className="inline-flex items-center gap-1 text-(--cp-accent)">
            <Flame size={20} />
            {dailyStreak} days
          </span>

          <span className="text-(--cp-muted)">*</span>

          <span className="inline-flex items-center gap-1 text-(--cp-info)">
            <Shield size={20} />
            {shieldCount}
          </span>
        </div>
      </section>

      <WeekStrip
        selectedDate={selectedDate}
        goalPercentage={settings.dailyGoalPercentage}
        getDayPercent={getDayPercent}
        onSelectDate={setSelectedDate}
        onPreviousWeek={() =>
          setSelectedDate((currentDate) => subWeeks(currentDate, 1))
        }
        onNextWeek={() =>
          setSelectedDate((currentDate) => addWeeks(currentDate, 1))
        }
      />

      <section className="mt-8 flex-1 space-y-5">
        {dueHabits.length === 0 ? (
          <EmptyState
            command="$ habits --due"
            title="no habits scheduled"
            message="nothing is due on this date. rest, backfill another day, or create a new checkpoint."
            action={
              <button
                type="button"
                onClick={() => onChangeView("habits")}
                className="border border-(--cp-accent) bg-(--cp-accent) px-4 py-3 text-sm font-bold text-(--cp-accent-contrast)"
              >
                open habit editor
              </button>
            }
          />
        ) : (
          (["morning", "day", "night"] as HabitCategory[])
            .filter((category) => groupedHabits[category].length > 0)
            .map((category) => {
              const typedCategory = category;
              const categoryHabits = groupedHabits[category];

              return (
                <RoutineBlock
                  key={typedCategory}
                  category={typedCategory}
                  config={categoryConfig[typedCategory]}
                  habits={categoryHabits}
                  isHabitDone={isHabitDone}
                  getHabitCompletion={getHabitCompletion}
                  getHabitStreak={getHabitStreak}
                  getHabitWeeklyTargetLabel={getHabitWeeklyTargetLabel}
                  onToggleHabit={(habitId) =>
                    toggleHabit(habitId, selectedDateKey)
                  }
                  onAdjustHabit={(habitId, delta) =>
                    adjustHabitValue(habitId, selectedDateKey, delta)
                  }
                />
              );
            })
        )}
      </section>

      <DailyProgressBar
        completed={progress.completed}
        total={progress.total}
        percent={progress.percent}
        goal={settings.dailyGoalPercentage}
      />

      <footer className="mt-8 border-t border-(--cp-border) pt-5 text-xl">
        <div className="flex items-center justify-between">
          <span>
            [<span className="text-(--cp-accent)">✓</span>] checkpoint
          </span>
          <span className="text-(--cp-muted)">local-first</span>
        </div>
      </footer>
    </TerminalShell>
  );
}
