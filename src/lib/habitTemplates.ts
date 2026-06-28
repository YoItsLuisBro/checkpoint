import type { HabitInput } from "../types/checkpoint";

export type HabitTemplate = {
  id: string;
  label: string;
  command: string;
  description: string;
  habits: HabitInput[];
};

export const habitTemplates: HabitTemplate[] = [
  {
    id: "minimal",
    label: "Minimal",
    command: "checkpoint template --minimal",
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
    command: "checkpoint template --dev",
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
    command: "checkpoint template --health",
    description: "For movement, hydration, food discipline, and recovery.",
    habits: [
      {
        name: "Workout",
        icon: "⌁",
        category: "day",
        mode: "checkbox",
        schedule: {
          type: "specific-days",
          weeklyTarget: 3,
          days: [],
        },
      },
      {
        name: "2L water",
        icon: "♙",
        category: "day",
        mode: "counter",
        target: 2,
        unit: "L",
        schedule: {
          type: "daily",
          days: [],
        },
      },
      {
        name: "No junk",
        icon: "✦",
        category: "day",
        mode: "checkbox",
        schedule: {
          type: "daily",
          days: [],
        },
      },
      {
        name: "Sleep routine",
        icon: "☾",
        category: "night",
        mode: "checkbox",
        schedule: {
          type: "daily",
          days: [],
        },
      },
    ],
  },
  {
    id: "discipline-reset",
    label: "Discipline Reset",
    command: "checkpoint template --discipline",
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
  {
    id: "morning-routine",
    label: "Morning Routine",
    command: "checkpoint template --morning",
    description: "A focused morning loop to start the day clean.",
    habits: [
      {
        name: "Wake up early",
        icon: "◷",
        category: "morning",
        mode: "checkbox",
        schedule: { type: "daily", days: [] },
      },
      {
        name: "Drink water",
        icon: "♙",
        category: "morning",
        mode: "counter",
        target: 1,
        unit: "cup",
        schedule: { type: "daily", days: [] },
      },
      {
        name: "Stretch",
        icon: "⌁",
        category: "morning",
        mode: "timer",
        target: 10,
        unit: "min",
        schedule: { type: "daily", days: [] },
      },
      {
        name: "Plan top 3",
        icon: "☷",
        category: "morning",
        mode: "checkbox",
        schedule: { type: "weekdays", days: [] },
      },
    ],
  },
  {
    id: "night-reset",
    label: "Night Reset",
    command: "checkpoint template --night",
    description: "A simple shutdown sequence for better recovery.",
    habits: [
      {
        name: "Read",
        icon: "▤",
        category: "night",
        mode: "timer",
        target: 20,
        unit: "min",
        schedule: { type: "daily", days: [] },
      },
      {
        name: "Journal",
        icon: "▤",
        category: "night",
        mode: "checkbox",
        schedule: { type: "daily", days: [] },
      },
      {
        name: "Plan tomorrow",
        icon: "☷",
        category: "night",
        mode: "checkbox",
        schedule: { type: "daily", days: [] },
      },
      {
        name: "No phone late",
        icon: "◎",
        category: "night",
        mode: "checkbox",
        schedule: { type: "daily", days: [] },
      },
    ],
  },
];
