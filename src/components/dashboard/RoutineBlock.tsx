import type {
  Habit,
  HabitCategory,
  HabitCompletion,
} from "../../types/checkpoint";
import HabitRow from "./HabitRow";

type RoutineConfig = {
  label: string;
  icon: string;
  accent: string;
};

type RoutineBlockProps = {
  category: HabitCategory;
  config: RoutineConfig;
  habits: Habit[];
  isHabitDone: (habitId: string) => boolean;
  getHabitCompletion: (habitId: string) => HabitCompletion | undefined;
  getHabitStreak: (habitId: string) => number;
  onToggleHabit: (habitId: string) => void;
  onAdjustHabit: (habitId: string, delta: number) => void;
};

export default function RoutineBlock({
  category,
  config,
  habits,
  isHabitDone,
  getHabitCompletion,
  getHabitStreak,
  onToggleHabit,
  onAdjustHabit,
}: RoutineBlockProps) {
  const done = habits.filter((habit) => isHabitDone(habit.id)).length;
  const total = habits.length;

  return (
    <div key={category} className="border-b border-(--cp-border) pb-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${config.accent}`}>
          <span>{config.icon}</span> {config.label}
        </h2>

        <span className="text-xl text-(--cp-muted)">
          [{done}/{total}] ▾
        </span>
      </div>

      <div className="space-y-3">
        {habits.map((habit) => (
          <HabitRow
            key={habit.id}
            habit={habit}
            completion={getHabitCompletion(habit.id)}
            isDone={isHabitDone(habit.id)}
            streak={getHabitStreak(habit.id)}
            onToggle={() => onToggleHabit(habit.id)}
            onAdjust={(delta) => onAdjustHabit(habit.id, delta)}
          />
        ))}
      </div>
    </div>
  );
}
