# CHECKPOINT

**A local-first terminal-style habit tracker for logging daily checkpoints.**

CHECKPOINT is a mobile-first Progressive Web App built for people who want a clean, fast, offline-ready way to track habits, routines, streaks, notes, and personal progress.

The app is designed around one simple question:

> Did you hit today’s checkpoint?

---

## Overview

CHECKPOINT is a brutalist terminal-inspired habit tracker with support for:

* Daily habit tracking
* Morning, day, and night routines
* Checkbox, counter, number, and timer habit modes
* Daily, weekday, weekend, specific-day, and weekly-target schedules
* Habit notes by date
* Local-first persistence
* PWA install support
* Offline app shell
* Streak tracking
* Shield protection system
* Weekly, monthly, and yearly stats
* Heatmaps
* JSON backup and import
* Multiple visual themes

No account is required. Data is stored locally in the browser.

---

## Tech Stack

* React
* TypeScript
* Vite
* Tailwind CSS
* Zustand
* date-fns
* lucide-react
* vite-plugin-pwa

---

## Features

### Habit Dashboard

The main dashboard shows habits scheduled for the selected date.

Users can:

* Complete checkbox habits
* Increment or decrement counter habits
* Track timer and number-based habits
* Add daily notes to habits
* Navigate between dates
* Backfill previous days
* View current daily progress
* Use shields to protect missed days

---

### Habit Editor

The edit page lets users manage their habit system.

Supported actions:

* Add habits
* Edit habits
* Archive habits
* Restore archived habits
* Permanently delete habits
* Reorder habits
* Apply habit templates

Supported routines:

* Morning
* Day
* Night

Supported habit modes:

* Checkbox
* Counter
* Number
* Timer

Supported schedules:

* Daily
* Weekdays
* Weekends
* Specific days
* X times per week

---

### Habit Templates

CHECKPOINT includes reusable habit template packs such as:

* Minimal
* Software Builder
* Fitness + Health
* Discipline Reset
* Morning Routine
* Night Reset

Templates append habits to the user’s existing setup without replacing current habits.

---

### Onboarding

First-time users are guided through a setup flow where they can:

* Set a username
* Choose a starter template
* Pick a theme
* Set a daily goal percentage
* Start using CHECKPOINT immediately

If existing local data is found, the user can keep their current setup.

---

### Notes

Each habit can have a separate note for each date.

This makes CHECKPOINT useful as both a habit tracker and a lightweight daily logbook.

Example note use cases:

* What happened today
* Why a habit was missed
* Workout details
* Study notes
* Blockers
* Wins
* Reflections

---

### Shield System

CHECKPOINT includes a real shield system.

Rules:

* Earn 1 shield every 7 goal days
* Hold up to 3 shields
* Use 1 shield to protect a missed day
* Shielded days do not break the daily goal streak
* Shield usage is saved locally and included in backups

---

### Stats

The stats page includes:

* Daily streak
* 30-day average
* Completion logs
* Perfect days this week
* Shield count
* Weekly report
* Monthly heatmap
* Year heatmap
* Per-habit detail stats

Per-habit stats include:

* Current streak
* Best streak
* Completion rate
* Total logs
* Last completed date
* Best weekday
* Weakest weekday
* Notes saved
* Recent habit history

---

### Themes

CHECKPOINT supports multiple themes:

* Terminal
* Matrix
* Amber
* Blueprint

Themes are stored locally and apply across the full app.

---

### PWA Support

CHECKPOINT can be installed as a mobile or desktop app.

PWA support includes:

* Web app manifest
* App icons
* Apple touch icon
* Android icons
* Maskable icons
* Offline app shell
* Auto-updating service worker
* Install panel in the profile page

---

### Backup and Import

The profile page supports local JSON backups.

Backups include:

* Habits
* Completions
* Notes
* Shields
* Shield usage
* Settings

This lets users export their local data and restore it later.

---

## Project Structure

```txt
src/
  components/
    dashboard/
    layout/
    profile/
    stats/
    ui/
  hooks/
  lib/
  pages/
  store/
  types/
```

Key files:

```txt
src/App.tsx
src/store/useCheckpointStore.ts
src/types/checkpoint.ts
src/pages/DashboardPage.tsx
src/pages/HabitsPage.tsx
src/pages/StatsPage.tsx
src/pages/ProfilePage.tsx
src/pages/OnboardingPage.tsx
src/lib/schedules.ts
src/lib/streaks.ts
src/lib/shields.ts
src/lib/habitTemplates.ts
```

---

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the app:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## PWA Testing

To test the PWA build:

```bash
npm run build
npm run preview
```

Then open the preview URL in Chrome or Edge.

Check:

```txt
DevTools → Application → Manifest
DevTools → Application → Service Workers
```

You should see the CHECKPOINT manifest, app icons, and service worker.

---

## Local Data

CHECKPOINT stores data locally in the browser using Zustand persistence.

Storage key:

```txt
checkpoint-storage
```

Resetting browser site data will remove local CHECKPOINT data unless it has been exported first.

---

## Design Direction

CHECKPOINT uses a terminal-inspired brutalist interface:

* Dark background
* Sharp borders
* Minimal color palette
* High-contrast text
* Command-style labels
* Mobile-first layout
* Sticky top navigation
* PWA-ready app shell

The design goal is to feel like a personal operating system for daily discipline.

---

## Roadmap Ideas

Possible future upgrades:

* Custom routines
* Monthly report summary
* CSV export
* Command palette
* Boot animation
* Reduced motion setting
* IndexedDB storage with Dexie
* Optional cloud sync
* Notification reminders
* More habit templates
* Drag-and-drop habit ordering

---

## Status

CHECKPOINT is currently a local-first MVP with advanced habit tracking, PWA support, analytics, notes, templates, and streak protection.

---

## License

This project is currently private/personal. Add a license if you plan to publish it publicly.
