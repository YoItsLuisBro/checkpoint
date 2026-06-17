import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CheckpointBackup,
  CheckpointState,
  Habit,
  HabitCompletion,
  HabitInput,
  SettingsInput,
} from "../types/checkpoint";
import { seedHabits } from "../lib/seed";
import { parseISO } from "date-fns";
import { getDueHabits, normalizeHabitSchedule } from "../lib/schedules";

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getHabitTarget(habit?: Habit) {
  if (!habit) return 1;
  if (habit.mode === "checkbox") return 1;
  return habit.target && habit.target > 0 ? habit.target : 1;
}

function isHabitCompletedByValue(habit: Habit | undefined, value: number) {
  return value >= getHabitTarget(habit);
}

const defaultSettings = {
  username: "user",
  planLabel: "pro",
  machineName: "checkpoint",
  dailyGoalPercentage: 60,
  theme: "terminal" as const,
};

const defaultState = {
  habits: seedHabits,
  completions: [],
  settings: defaultSettings,
};

export const useCheckpointStore = create<CheckpointState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      addHabit: (input: HabitInput) => {
        const nextOrder =
          Math.max(0, ...get().habits.map((habit) => habit.order)) + 1;

        const newHabit: Habit = {
          id: createId(),
          name: input.name.trim(),
          icon: input.icon.trim() || "□",
          category: input.category,
          mode: input.mode,
          target: input.mode === "checkbox" ? undefined : (input.target ?? 1),
          unit:
            input.mode === "timer"
              ? input.unit?.trim() || "min"
              : input.unit?.trim() || undefined,
          order: nextOrder,
          createdAt: new Date().toISOString(),
          archivedAt: null,
          schedule: normalizeHabitSchedule(input.schedule),
        };

        set((state) => ({
          habits: [...state.habits, newHabit],
        }));
      },

      updateHabit: (habitId: string, input: HabitInput) => {
        set((state) => {
          const existingHabit = state.habits.find(
            (habit) => habit.id === habitId,
          );

          if (!existingHabit) {
            return state;
          }

          const updatedHabit: Habit = {
            ...existingHabit,
            name: input.name.trim(),
            icon: input.icon.trim() || "□",
            category: input.category,
            mode: input.mode,
            target: input.mode === "checkbox" ? undefined : (input.target ?? 1),
            unit:
              input.mode === "timer"
                ? input.unit?.trim() || "min"
                : input.unit?.trim() || undefined,
            schedule: normalizeHabitSchedule(input.schedule),
          };

          return {
            habits: state.habits.map((habit) =>
              habit.id === habitId ? updatedHabit : habit,
            ),
            completions: state.completions.map((completion) =>
              completion.habitId === habitId
                ? {
                    ...completion,
                    completed: isHabitCompletedByValue(
                      updatedHabit,
                      completion.value,
                    ),
                  }
                : completion,
            ),
          };
        });
      },

      archiveHabit: (habitId: string) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === habitId
              ? {
                  ...habit,
                  archivedAt: new Date().toISOString(),
                }
              : habit,
          ),
        }));
      },

      restoreHabit: (habitId: string) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === habitId
              ? {
                  ...habit,
                  archivedAt: null,
                }
              : habit,
          ),
        }));
      },

      deleteHabit: (habitId: string) => {
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== habitId),
          completions: state.completions.filter(
            (completion) => completion.habitId !== habitId,
          ),
        }));
      },

      moveHabit: (habitId: string, direction: "up" | "down") => {
        set((state) => {
          const habitToMove = state.habits.find(
            (habit) => habit.id === habitId,
          );

          if (!habitToMove || habitToMove.archivedAt) {
            return state;
          }

          const routineHabits = state.habits
            .filter(
              (habit) =>
                !habit.archivedAt && habit.category === habitToMove.category,
            )
            .sort((a, b) => a.order - b.order);

          const currentIndex = routineHabits.findIndex(
            (habit) => habit.id === habitId,
          );

          if (currentIndex === -1) {
            return state;
          }

          const targetIndex =
            direction === "up" ? currentIndex - 1 : currentIndex + 1;

          if (targetIndex < 0 || targetIndex >= routineHabits.length) {
            return state;
          }

          const targetHabit = routineHabits[targetIndex];

          return {
            habits: state.habits.map((habit) => {
              if (habit.id === habitToMove.id) {
                return {
                  ...habit,
                  order: targetHabit.order,
                };
              }

              if (habit.id === targetHabit.id) {
                return {
                  ...habit,
                  order: habitToMove.order,
                };
              }

              return habit;
            }),
          };
        });
      },

      updateSettings: (input: SettingsInput) => {
        set(() => ({
          settings: {
            username: input.username.trim() || "user",
            planLabel: input.planLabel.trim() || "local",
            machineName: input.machineName.trim() || "checkpoint",
            dailyGoalPercentage: Math.min(
              100,
              Math.max(0, input.dailyGoalPercentage),
            ),
            theme: input.theme,
          },
        }));
      },

      resetAppData: () => {
        set(() => ({
          habits: seedHabits,
          completions: [],
          settings: defaultSettings,
        }));
      },

      importBackup: (backup: CheckpointBackup) => {
        set(() => ({
          habits: backup.habits,
          completions: backup.completions,
          settings: backup.settings,
        }));
      },

      getCompletion: (habitId, date) => {
        return get().completions.find(
          (completion) =>
            completion.habitId === habitId && completion.date === date,
        );
      },

      setHabitValue: (habitId, date, value) => {
        const habit = get().habits.find((item) => item.id === habitId);
        const safeValue = Math.max(0, value);
        const existing = get().getCompletion(habitId, date);
        const completed = isHabitCompletedByValue(habit, safeValue);

        if (existing) {
          set((state) => ({
            completions: state.completions.map((completion) =>
              completion.id === existing.id
                ? {
                    ...completion,
                    value: safeValue,
                    completed,
                    completedAt: new Date().toISOString(),
                  }
                : completion,
            ),
          }));

          return;
        }

        const newCompletion: HabitCompletion = {
          id: createId(),
          habitId,
          date,
          value: safeValue,
          completed,
          completedAt: new Date().toISOString(),
        };

        set((state) => ({
          completions: [...state.completions, newCompletion],
        }));
      },

      adjustHabitValue: (habitId, date, delta) => {
        const existing = get().getCompletion(habitId, date);
        const currentValue = existing?.value ?? 0;

        get().setHabitValue(habitId, date, currentValue + delta);
      },

      toggleHabit: (habitId, date) => {
        const existing = get().getCompletion(habitId, date);
        const currentCompleted = existing?.completed ?? false;

        get().setHabitValue(habitId, date, currentCompleted ? 0 : 1);
      },

      getDailyProgress: (date) => {
        const dueHabits = getDueHabits(get().habits, parseISO(date));

        const completed = dueHabits.filter((habit) => {
          const completion = get().getCompletion(habit.id, date);
          return completion?.completed;
        }).length;

        const total = dueHabits.length;
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

        return {
          completed,
          total,
          percent,
        };
      },
    }),
    {
      name: "checkpoint-storage",
      merge: (persisted, current) => {
        const persistedState = persisted as
          | Partial<CheckpointState>
          | undefined;

        return {
          ...current,
          habits:
            persistedState?.habits?.map((habit) => ({
              ...habit,
              schedule: normalizeHabitSchedule(habit.schedule),
            })) ?? current.habits,
          completions: persistedState?.completions ?? current.completions,
          settings: {
            ...current.settings,
            ...persistedState?.settings,
          },
        };
      },
    },
  ),
);
