import type { HabitInput } from "../types/checkpoint";

export type OnboardingTemplate = {
  id: string;
  label: string;
  command: string;
  description: string;
  habits: HabitInput[];
};

export const onboardingTemplates: OnboardingTemplate[] = [
  {
    id: "minimal",
    label: "Minimal",
    command: "checkpoint init --minimal",
    description: "A small starter loop for building consistency.",
    habits: [
      {
        name: "Wake up early",
        icon: "◷",
        category: "morning",
        mode: "checkbox",
        schedule: { type: "daily", days: [] },
      },
      {
        name: "Plan day",
        icon: "☷",
        category: "morning",
        mode: "checkbox",
        schedule: { type: "daily", days: [] },
      },
      {
        name: "Deep work",
        icon: "▰",
        category: "day",
        mode: "timer",
        target: 30,
        unit: "min",
        schedule: { type: "weekdays", days: [] },
      },
      {
        name: "Read",
        icon: "▤",
        category: "night",
        mode: "timer",
        target: 15,
        unit: "min",
        schedule: { type: "daily", days: [] },
      },
    ],
  },
  {
    id: "software-builder",
    label: "Software Builder",
    command: "checkpoint init --dev",
    description: "For coding, studying, shipping, and improving your craft.",
    habits: [
      {
        name: "Study docs",
        icon: "▤",
        category: "day",
        mode: "timer",
        target: 30,
        unit: "min",
        schedule: { type: "weekdays", days: [] },
      },
      {
        name: "Build project",
        icon: "▰",
        category: "day",
        mode: "timer",
        target: 60,
        unit: "min",
        schedule: { type: "weekdays", days: [] },
      },
      {
        name: "Commit code",
        icon: "▸",
        category: "day",
        mode: "checkbox",
        schedule: { type: "weekdays", days: [] },
      },
      {
        name: "Review notes",
        icon: "☷",
        category: "night",
        mode: "checkbox",
        schedule: { type: "daily", days: [] },
      },
    ],
  },
  {
    id: "fitness-health",
    label: "Fitness + Health",
    command: "checkpoint init --health",
    description: "For movement, hydration, food discipline, and recovery.",
    habits: [
      {
        name: "Workout",
        icon: "⌁",
        category: "day",
        mode: "checkbox",
        schedule: { type: "specific-days", days: [1, 3, 5] },
      },
      {
        name: "2L water",
        icon: "♙",
        category: "day",
        mode: "counter",
        target: 2,
        unit: "L",
        schedule: { type: "daily", days: [] },
      },
      {
        name: "No junk",
        icon: "✦",
        category: "day",
        mode: "checkbox",
        schedule: { type: "daily", days: [] },
      },
      {
        name: "Sleep routine",
        icon: "☾",
        category: "night",
        mode: "checkbox",
        schedule: { type: "daily", days: [] },
      },
    ],
  },
  {
    id: "discipline-reset",
    label: "Discipline Reset",
    command: "checkpoint init --discipline",
    description: "A stricter reset for routine, focus, and self-control.",
    habits: [
      {
        name: "Wake up early",
        icon: "◷",
        category: "morning",
        mode: "checkbox",
        schedule: { type: "daily", days: [] },
      },
      {
        name: "Exercise",
        icon: "⌁",
        category: "morning",
        mode: "checkbox",
        schedule: { type: "daily", days: [] },
      },
      {
        name: "Study",
        icon: "▰",
        category: "day",
        mode: "timer",
        target: 45,
        unit: "min",
        schedule: { type: "daily", days: [] },
      },
      {
        name: "No junk",
        icon: "✦",
        category: "day",
        mode: "checkbox",
        schedule: { type: "daily", days: [] },
      },
      {
        name: "Journal",
        icon: "▤",
        category: "night",
        mode: "checkbox",
        schedule: { type: "daily", days: [] },
      },
    ],
  },
];
