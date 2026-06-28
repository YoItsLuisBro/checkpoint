export type HabitCategory = "morning" | "day" | "night";

export type HabitMode = "checkbox" | "counter" | "number" | "timer";

export type AppTheme = "terminal" | "matrix" | "amber" | "blueprint";

export type HabitScheduleType =
  | "daily"
  | "weekdays"
  | "weekends"
  | "specific-days"
  | "weekly-target";

export type HabitSchedule = {
  type: HabitScheduleType;
  days?: number[];
  weeklyTarget?: number;
};

export type Habit = {
  id: string;
  name: string;
  icon: string;
  category: HabitCategory;
  mode: HabitMode;
  target?: number;
  unit?: string;
  schedule?: HabitSchedule;
  order: number;
  createdAt: string;
  archivedAt?: string | null;
};

export type HabitCompletion = {
  id: string;
  habitId: string;
  date: string;
  value: number;
  completed: boolean;
  completedAt: string;
};

export type AppSettings = {
  username: string;
  planLabel: string;
  machineName: string;
  dailyGoalPercentage: number;
  theme: AppTheme;
  hasCompletedOnboarding: boolean;
};

export type HabitInput = {
  name: string;
  icon: string;
  category: HabitCategory;
  mode: HabitMode;
  target?: number;
  unit?: string;
  schedule: HabitSchedule;
};

export type SettingsInput = {
  username: string;
  planLabel: string;
  machineName: string;
  dailyGoalPercentage: number;
  theme: AppTheme;
};

export type OnboardingInput = {
  username: string;
  planLabel: string;
  machineName: string;
  dailyGoalPercentage: number;
  theme: AppTheme;
  templateId: string;
};

export type CheckpointBackup = {
  version: 1;
  exportedAt: string;
  habits: Habit[];
  completions: HabitCompletion[];
  settings: AppSettings;
};

export type CheckpointState = {
  habits: Habit[];
  completions: HabitCompletion[];
  settings: AppSettings;

  addHabit: (input: HabitInput) => void;
  updateHabit: (habitId: string, input: HabitInput) => void;
  archiveHabit: (habitId: string) => void;
  restoreHabit: (habitId: string) => void;
  deleteHabit: (habitId: string) => void;
  moveHabit: (habitId: string, direction: "up" | "down") => void;

  completeOnboarding: (input: OnboardingInput) => void;
  finishOnboarding: () => void;
  applyHabitTemplate: (templateId: string) => void;

  updateSettings: (input: SettingsInput) => void;
  resetAppData: () => void;
  importBackup: (backup: CheckpointBackup) => void;

  toggleHabit: (habitId: string, date: string) => void;
  setHabitValue: (habitId: string, date: string, value: number) => void;
  adjustHabitValue: (habitId: string, date: string, delta: number) => void;

  getCompletion: (habitId: string, date: string) => HabitCompletion | undefined;
  getDailyProgress: (date: string) => {
    completed: number;
    total: number;
    percent: number;
  };
};
