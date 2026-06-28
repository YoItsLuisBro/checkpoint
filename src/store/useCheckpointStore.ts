import { parseISO } from "date-fns";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { habitTemplates } from "../lib/habitTemplates";
import { getDueHabits, normalizeHabitSchedule } from "../lib/schedules";
import { seedHabits } from "../lib/seed";
import {
  canUseShieldOnDate,
  getGoalDayCount,
  getShieldMilestonesEarned,
  MAX_SHIELDS,
} from "../lib/shields";

import type {
  AppSettings,
  CheckpointBackup,
  CheckpointState,
  Habit,
  HabitCompletion,
  HabitInput,
  OnboardingInput,
  SettingsInput,
  ShieldUse,
} from "../types/checkpoint";

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

function buildHabitFromInput(input: HabitInput, order: number): Habit {
  return {
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
    schedule: normalizeHabitSchedule(input.schedule),
    order,
    createdAt: new Date().toISOString(),
    archivedAt: null,
  };
}

function normalizePersistedHabits(habits: Habit[]) {
  return habits.map((habit) => ({
    ...habit,
    schedule: normalizeHabitSchedule(habit.schedule),
    archivedAt: habit.archivedAt ?? null,
  }));
}

const defaultSettings: AppSettings = {
  username: "user",
  planLabel: "local",
  machineName: "checkpoint",
  dailyGoalPercentage: 60,
  theme: "terminal",
  hasCompletedOnboarding: false,
  shieldCount: 0,
  shieldAwardedMilestones: 0,
};

const defaultState = {
  habits: normalizePersistedHabits(seedHabits),
  completions: [] as HabitCompletion[],
  shieldUses: [] as ShieldUse[],
  settings: defaultSettings,
};

export const useCheckpointStore = create<CheckpointState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      addHabit: (input: HabitInput) => {
        const nextOrder =
          Math.max(0, ...get().habits.map((habit) => habit.order)) + 1;

        const newHabit = buildHabitFromInput(input, nextOrder);

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

        get().syncShieldRewards();
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

        get().syncShieldRewards();
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

      completeOnboarding: (input: OnboardingInput) => {
        const selectedTemplate =
          habitTemplates.find((template) => template.id === input.templateId) ??
          habitTemplates[0];

        const nextHabits = selectedTemplate.habits.map((habitInput, index) =>
          buildHabitFromInput(habitInput, index + 1),
        );

        set(() => ({
          habits: nextHabits,
          completions: [],
          shieldUses: [],
          settings: {
            username: input.username.trim() || "user",
            planLabel: input.planLabel.trim() || "local",
            machineName: input.machineName.trim() || "checkpoint",
            dailyGoalPercentage: Math.min(
              100,
              Math.max(0, input.dailyGoalPercentage),
            ),
            theme: input.theme,
            hasCompletedOnboarding: true,
            shieldCount: 0,
            shieldAwardedMilestones: 0,
          },
        }));
      },

      finishOnboarding: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            hasCompletedOnboarding: true,
          },
        }));
      },

      applyHabitTemplate: (templateId: string) => {
        const selectedTemplate = habitTemplates.find(
          (template) => template.id === templateId,
        );

        if (!selectedTemplate) {
          return;
        }

        const activeHabits = get().habits.filter((habit) => !habit.archivedAt);

        const startingOrder =
          Math.max(0, ...activeHabits.map((habit) => habit.order)) + 1;

        const templateHabits = selectedTemplate.habits.map(
          (habitInput, index) =>
            buildHabitFromInput(
              {
                ...habitInput,
                schedule: normalizeHabitSchedule(habitInput.schedule),
              },
              startingOrder + index,
            ),
        );

        set((state) => ({
          habits: [...state.habits, ...templateHabits],
        }));
      },

      updateSettings: (input: SettingsInput) => {
        set((state) => ({
          settings: {
            ...state.settings,
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

        get().syncShieldRewards();
      },

      resetAppData: () => {
        set(() => ({
          habits: normalizePersistedHabits(seedHabits),
          completions: [],
          shieldUses: [],
          settings: defaultSettings,
        }));
      },

      importBackup: (backup: CheckpointBackup) => {
        set(() => ({
          habits: normalizePersistedHabits(backup.habits),
          completions: backup.completions,
          shieldUses: backup.shieldUses ?? [],
          settings: {
            ...defaultSettings,
            ...backup.settings,
            hasCompletedOnboarding:
              backup.settings.hasCompletedOnboarding ?? true,
            shieldCount: backup.settings.shieldCount ?? 0,
            shieldAwardedMilestones:
              backup.settings.shieldAwardedMilestones ?? 0,
          },
        }));

        get().syncShieldRewards();
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

          get().syncShieldRewards();
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

        get().syncShieldRewards();
      },

      adjustHabitValue: (habitId, date, delta) => {
        const existing = get().getCompletion(habitId, date);
        const currentValue = existing?.value ?? 0;

        get().setHabitValue(habitId, date, currentValue + delta);
      },

      setHabitNote: (habitId, date, note) => {
        const cleanNote = note.trim();
        const existing = get().getCompletion(habitId, date);

        if (existing) {
          set((state) => ({
            completions: state.completions.map((completion) =>
              completion.id === existing.id
                ? {
                    ...completion,
                    note: cleanNote || undefined,
                  }
                : completion,
            ),
          }));

          return;
        }

        if (!cleanNote) {
          return;
        }

        const newCompletion: HabitCompletion = {
          id: createId(),
          habitId,
          date,
          value: 0,
          completed: false,
          completedAt: new Date().toISOString(),
          note: cleanNote,
        };

        set((state) => ({
          completions: [...state.completions, newCompletion],
        }));
      },

      toggleHabit: (habitId, date) => {
        const existing = get().getCompletion(habitId, date);
        const currentCompleted = existing?.completed ?? false;

        get().setHabitValue(habitId, date, currentCompleted ? 0 : 1);
      },

      syncShieldRewards: () => {
        const state = get();

        const goalDayCount = getGoalDayCount(
          state.habits,
          state.completions,
          state.settings.dailyGoalPercentage,
        );

        const earnedMilestones = getShieldMilestonesEarned(goalDayCount);

        const newMilestones =
          earnedMilestones - state.settings.shieldAwardedMilestones;

        if (newMilestones <= 0) {
          return;
        }

        set((current) => ({
          settings: {
            ...current.settings,
            shieldCount: Math.min(
              MAX_SHIELDS,
              current.settings.shieldCount + newMilestones,
            ),
            shieldAwardedMilestones: earnedMilestones,
          },
        }));
      },

      isDateShielded: (date) => {
        return get().shieldUses.some((shieldUse) => shieldUse.date === date);
      },

      useShield: (date) => {
        const state = get();

        const allowed = canUseShieldOnDate({
          shieldCount: state.settings.shieldCount,
          shieldUses: state.shieldUses,
          habits: state.habits,
          completions: state.completions,
          date,
          dailyGoalPercentage: state.settings.dailyGoalPercentage,
        });

        if (!allowed) {
          return false;
        }

        const newShieldUse: ShieldUse = {
          id: createId(),
          date,
          usedAt: new Date().toISOString(),
        };

        set((current) => ({
          shieldUses: [...current.shieldUses, newShieldUse],
          settings: {
            ...current.settings,
            shieldCount: Math.max(0, current.settings.shieldCount - 1),
          },
        }));

        return true;
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
          habits: persistedState?.habits
            ? normalizePersistedHabits(persistedState.habits)
            : current.habits,
          completions: persistedState?.completions ?? current.completions,
          shieldUses: persistedState?.shieldUses ?? current.shieldUses,
          settings: {
            ...current.settings,
            ...persistedState?.settings,
            hasCompletedOnboarding:
              persistedState?.settings?.hasCompletedOnboarding ?? false,
            shieldCount: persistedState?.settings?.shieldCount ?? 0,
            shieldAwardedMilestones:
              persistedState?.settings?.shieldAwardedMilestones ?? 0,
          },
        };
      },
    },
  ),
);
