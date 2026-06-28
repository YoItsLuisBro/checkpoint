import { useMemo, useState } from "react";
import {
  eachDayOfInterval,
  format,
  startOfWeek,
  subDays,
  subMonths,
  addMonths,
} from "date-fns";

import TerminalShell from "../components/layout/TerminalShell";
import TopNav, { type AppView } from "../components/layout/TopNav";
import EmptyState from "../components/ui/EmptyState";
import MonthlyHeatmap from "../components/stats/MonthlyHeatMap";
import WeeklyReport from "../components/stats/WeeklyReport";
import YearHeatmap from "../components/stats/YearHeatMap";
import HabitDetailPanel from "../components/stats/HabitDetailPanel";

import { getScheduleLabel } from "../lib/schedules";
import {
  getDailyGoalStreak,
  getDayProgressPercent,
  getHabitCurrentStreak,
  getPerfectDaysThisWeek,
  toDateKey,
} from "../lib/streaks";

import { useCheckpointStore } from "../store/useCheckpointStore";

type StatsPageProps = {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
};

type StatCardProps = {
  label: string;
  value: string;
  icon: string;
  accent: string;
};

function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <article className="border border-(--cp-border) bg-(--cp-panel) p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-(--cp-muted)">{label}</p>
          <p className="mt-2 text-3xl font-bold text-(--cp-text)">
            {value}
          </p>
        </div>

        <span className={`text-2xl ${accent}`}>{icon}</span>
      </div>
    </article>
  );
}

export default function StatsPage({
  activeView,
  onChangeView,
}: StatsPageProps) {
  const today = useMemo(() => new Date(), []);

  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [selectedYear, setSelectedYear] = useState(() => new Date());
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  const habits = useCheckpointStore((state) => state.habits);
  const completions = useCheckpointStore((state) => state.completions);
  const settings = useCheckpointStore((state) => state.settings);
  const shieldUses = useCheckpointStore((state) => state.shieldUses);

  const activeHabits = useMemo(() => {
    return habits
      .filter((habit) => !habit.archivedAt)
      .slice()
      .sort((a, b) => a.order - b.order);
  }, [habits]);

  const selectedHabit = useMemo(() => {
    if (!selectedHabitId) {
      return undefined;
    }

    return activeHabits.find((habit) => habit.id === selectedHabitId);
  }, [activeHabits, selectedHabitId]);

  const stats = useMemo(() => {
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });

    const weekDays = eachDayOfInterval({
      start: weekStart,
      end: subDays(weekStart, -6),
    });

    const weekProgress = weekDays.map((day) => {
      const dateKey = toDateKey(day);
      const progress = getDayProgressPercent(
        activeHabits,
        completions,
        dateKey,
      );

      return {
        date: day,
        dateKey,
        label: format(day, "EEE"),
        ...progress,
      };
    });

    const last30Days = Array.from({ length: 30 }, (_, index) => {
      const day = subDays(today, 29 - index);
      const dateKey = toDateKey(day);

      return {
        date: day,
        dateKey,
        ...getDayProgressPercent(activeHabits, completions, dateKey),
      };
    });

    const activeLast30Days = last30Days.filter((day) => day.total > 0);

    const average30 =
      activeLast30Days.length === 0
        ? 0
        : Math.round(
            activeLast30Days.reduce((sum, day) => sum + day.percent, 0) /
              activeLast30Days.length,
          );

    const completedLogs = completions.filter((completion) => {
      if (!completion.completed) {
        return false;
      }

      return activeHabits.some((habit) => habit.id === completion.habitId);
    }).length;

    const dailyStreak = getDailyGoalStreak(
      activeHabits,
      completions,
      today,
      settings.dailyGoalPercentage,
      shieldUses,
    );

    const perfectDaysThisWeek = getPerfectDaysThisWeek(
      activeHabits,
      completions,
      today,
    );

    const habitStats = activeHabits
      .map((habit) => {
        const habitCompletions = completions.filter(
          (completion) =>
            completion.habitId === habit.id && completion.completed,
        );

        return {
          habit,
          streak: getHabitCurrentStreak(habit, completions, today),
          totalCompletions: habitCompletions.length,
          lastCompletedDate:
            habitCompletions
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))[0]?.date ?? "never",
        };
      })
      .sort((a, b) => {
        if (b.streak !== a.streak) {
          return b.streak - a.streak;
        }

        return b.totalCompletions - a.totalCompletions;
      });

    return {
      weekProgress,
      average30,
      completedLogs,
      dailyStreak,
      perfectDaysThisWeek,
      habitStats,
    };
  }, [
    activeHabits,
    completions,
    today,
    settings.dailyGoalPercentage,
    shieldUses,
  ]);

  return (
    <TerminalShell>
      <TopNav activeView={activeView} onChangeView={onChangeView} />

      <header className="mt-6">
        <p className="text-sm text-(--cp-muted)">$ checkpoint stats</p>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-4xl font-bold leading-none tracking-tight text-(--cp-text)">
              stats
            </h1>

            <p className="mt-2 text-sm text-(--cp-muted)">
              // streaks, reports, heatmaps, and habit performance
            </p>
          </div>

          <div className="border border-(--cp-border) bg-(--cp-panel) px-3 py-2 text-right">
            <p className="text-xs text-(--cp-muted)">goal</p>
            <p className="text-xl text-(--cp-accent)">
              {settings.dailyGoalPercentage}%
            </p>
          </div>
        </div>
      </header>

      {selectedHabit ? (
        <HabitDetailPanel
          habit={selectedHabit}
          completions={completions}
          today={today}
          onBack={() => setSelectedHabitId(null)}
        />
      ) : (
        <>
          {activeHabits.length === 0 && (
            <div className="mt-8">
              <EmptyState
                command="$ stats"
                title="no active habits"
                message="stats need active habits before CHECKPOINT can generate reports."
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
            </div>
          )}

          <YearHeatmap
            selectedYear={selectedYear}
            habits={activeHabits}
            completions={completions}
            shieldUses={shieldUses}
            goalPercentage={settings.dailyGoalPercentage}
            onPreviousYear={() =>
              setSelectedYear(
                (current) => new Date(current.getFullYear() - 1, 0, 1),
              )
            }
            onNextYear={() =>
              setSelectedYear(
                (current) => new Date(current.getFullYear() + 1, 0, 1),
              )
            }
          />

          <MonthlyHeatmap
            selectedMonth={selectedMonth}
            habits={activeHabits}
            completions={completions}
            goalPercentage={settings.dailyGoalPercentage}
            onPreviousMonth={() =>
              setSelectedMonth((current) => subMonths(current, 1))
            }
            onNextMonth={() =>
              setSelectedMonth((current) => addMonths(current, 1))
            }
          />

          <WeeklyReport
            habits={activeHabits}
            completions={completions}
            selectedDate={today}
            goalPercentage={settings.dailyGoalPercentage}
          />

          <section className="mt-8 border-b border-(--cp-border) pb-6">
            <div className="mb-4">
              <h2 className="text-xl text-(--cp-accent)">$ summary</h2>
              <p className="mt-1 text-sm text-(--cp-muted)">
                // current performance snapshot
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="daily streak"
                value={String(stats.dailyStreak)}
                icon="🔥"
                accent="text-[var(--cp-accent)]"
              />

              <StatCard
                label="30d avg"
                value={`${stats.average30}%`}
                icon="▦"
                accent="text-[var(--cp-info)]"
              />

              <StatCard
                label="logs"
                value={String(stats.completedLogs)}
                icon="✓"
                accent="text-[var(--cp-accent)]"
              />

              <StatCard
                label="perfect week"
                value={`${stats.perfectDaysThisWeek}/7`}
                icon="★"
                accent="text-[var(--cp-warn)]"
              />

              <StatCard
                label="shields"
                value={`${settings.shieldCount}/3`}
                icon="🛡"
                accent="text-[var(--cp-accent)]"
              />
            </div>
          </section>

          <section className="mt-8 border-b border-(--cp-border) pb-6">
            <div className="mb-4">
              <h2 className="text-xl text-(--cp-accent)">$ week</h2>
              <p className="mt-1 text-sm text-(--cp-muted)">
                // daily goal progress this week
              </p>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {stats.weekProgress.map((day) => (
                <article
                  key={day.dateKey}
                  className={[
                    "border p-2 text-center",
                    day.percent >= settings.dailyGoalPercentage
                      ? "border-(--cp-accent) bg-(--cp-accent-soft)"
                      : "border-(--cp-border) bg-(--cp-panel)",
                  ].join(" ")}
                  title={`${day.dateKey}: ${day.percent}%`}
                >
                  <p className="text-xs text-(--cp-muted)">{day.label}</p>

                  <p
                    className={[
                      "mt-2 text-sm",
                      day.percent >= settings.dailyGoalPercentage
                        ? "text-(--cp-accent)"
                        : "text-(--cp-text)",
                    ].join(" ")}
                  >
                    {day.percent}%
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-xl text-(--cp-accent)">
                $ habit streaks
              </h2>
              <p className="mt-1 text-sm text-(--cp-muted)">
                // tap a habit to inspect deeper stats
              </p>
            </div>

            {stats.habitStats.length === 0 ? (
              <EmptyState
                command="$ habits --stats"
                title="no habit stats"
                message="complete a habit to start generating per-habit streak data."
              />
            ) : (
              <div className="space-y-3">
                {stats.habitStats.map((habitStat) => (
                  <button
                    key={habitStat.habit.id}
                    type="button"
                    onClick={() => setSelectedHabitId(habitStat.habit.id)}
                    className="w-full border border-(--cp-border) bg-(--cp-panel) p-3 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-lg text-(--cp-text)">
                          <span className="mr-2 text-(--cp-muted)">
                            {habitStat.habit.icon}
                          </span>
                          {habitStat.habit.name}
                        </p>

                        <p className="mt-1 text-sm text-(--cp-muted)">
                          {habitStat.habit.category} · {habitStat.habit.mode} ·{" "}
                          {getScheduleLabel(habitStat.habit.schedule)}
                        </p>

                        <p className="mt-1 text-xs text-(--cp-muted)">
                          logs: {habitStat.totalCompletions} · last:{" "}
                          {habitStat.lastCompletedDate}
                        </p>
                      </div>

                      <span
                        className={[
                          "shrink-0 text-xl",
                          habitStat.streak > 0
                            ? "text-(--cp-accent)"
                            : "text-(--cp-muted)",
                        ].join(" ")}
                      >
                        🔥 {habitStat.streak}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-(--cp-muted)">
                      tap to inspect →
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </TerminalShell>
  );
}
