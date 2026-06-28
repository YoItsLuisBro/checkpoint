import { useMemo, useState, type ReactNode } from "react";
import {
  addMonths,
  eachDayOfInterval,
  format,
  startOfWeek,
  endOfWeek,
  subDays,
  subMonths,
} from "date-fns";
import { Flame, Shield, Activity, CheckCircle2 } from "lucide-react";

import TerminalShell from "../components/layout/TerminalShell";
import TopNav, { type AppView } from "../components/layout/TopNav";
import MonthlyHeatmap from "../components/stats/MonthlyHeatMap";
import WeeklyReport from "../components/stats/WeeklyReport";
import EmptyState from "../components/ui/EmptyState";

import { useCheckpointStore } from "../store/useCheckpointStore";
import {
  getDailyGoalStreak,
  getDayProgressPercent,
  getHabitCurrentStreak,
  getPerfectDaysThisWeek,
  toDateKey,
} from "../lib/streaks";

type StatsPageProps = {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
};

export default function StatsPage({
  activeView,
  onChangeView,
}: StatsPageProps) {
  const today = useMemo(() => new Date(), []);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());

  const habits = useCheckpointStore((state) => state.habits);
  const completions = useCheckpointStore((state) => state.completions);
  const settings = useCheckpointStore((state) => state.settings);
  const shieldUses = useCheckpointStore((state) => state.shieldUses);

  const activeHabits = useMemo(() => {
    return habits.filter((habit) => !habit.archivedAt);
  }, [habits]);

  const stats = useMemo(() => {
    const weekDays = eachDayOfInterval({
      start: startOfWeek(today, { weekStartsOn: 1 }),
      end: endOfWeek(today, { weekStartsOn: 1 }),
    });

    const last30Days = eachDayOfInterval({
      start: subDays(today, 29),
      end: today,
    });

    const weekProgress = weekDays.map((day) => {
      const dateKey = toDateKey(day);
      const progress = getDayProgressPercent(habits, completions, dateKey);

      return {
        date: day,
        dateKey,
        ...progress,
      };
    });

    const thirtyDayProgress = last30Days.map((day) => {
      const dateKey = toDateKey(day);
      return getDayProgressPercent(habits, completions, dateKey);
    });

    const completedLogs = completions.filter(
      (completion) => completion.completed,
    ).length;

    const thirtyDayAverage =
      thirtyDayProgress.length === 0
        ? 0
        : Math.round(
            thirtyDayProgress.reduce((sum, day) => sum + day.percent, 0) /
              thirtyDayProgress.length,
          );

    const dailyStreak = getDailyGoalStreak(
      habits,
      completions,
      today,
      settings.dailyGoalPercentage,
      shieldUses,
    );

    const perfectDaysThisWeek = getPerfectDaysThisWeek(
      habits,
      completions,
      today,
    );

    const habitStats = activeHabits
      .map((habit) => {
        const currentStreak = getHabitCurrentStreak(habit, completions, today);

        const completionsForHabit = completions.filter(
          (completion) =>
            completion.habitId === habit.id && completion.completed,
        ).length;

        return {
          habit,
          currentStreak,
          completionsForHabit,
        };
      })
      .sort((a, b) => b.currentStreak - a.currentStreak);

    return {
      weekProgress,
      thirtyDayAverage,
      completedLogs,
      dailyStreak,
      perfectDaysThisWeek,
      habitStats,
    };
  }, [
    activeHabits,
    habits,
    completions,
    settings.dailyGoalPercentage,
    today,
    shieldUses,
  ]);

  return (
    <TerminalShell>
      <TopNav activeView={activeView} onChangeView={onChangeView} />

      <header className="space-y-2">
        <h1 className="text-[22px] leading-none tracking-tight">
          <span className="text-(--cp-accent)">checkpoint</span>
          <span className="text-(--cp-warn)">[local]</span>
          <span className="text-(--cp-info)">@stats</span>{" "}
          <span className="text-(--cp-accent)">#</span>{" "}
          <span className="text-(--cp-text)">report</span>
        </h1>

        <p className="text-lg leading-tight text-(--cp-muted)">
          // your behavior leaves logs.
          <br />
          read them honestly.
        </p>
      </header>

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

      <section className="mt-8 grid grid-cols-2 gap-3">
        <StatCard
          icon={<Flame size={18} />}
          label="daily streak"
          value={`${stats.dailyStreak}d`}
          accent="text-[var(--cp-accent)]"
        />

        <StatCard
          icon={<Shield size={18} />}
          label="perfect week"
          value={String(stats.perfectDaysThisWeek)}
          accent="text-[var(--cp-info)]"
        />

        <StatCard
          icon={<Activity size={18} />}
          label="30d avg"
          value={`${stats.thirtyDayAverage}%`}
          accent="text-[var(--cp-warn)]"
        />

        <StatCard
          icon={<CheckCircle2 size={18} />}
          label="logs"
          value={String(stats.completedLogs)}
          accent="text-[var(--cp-info)]"
        />

        <StatCard
          label="shields"
          value={`${settings.shieldCount}/3`}
          icon="🛡"
          accent="text-[var(--cp-accent)]"
        />
      </section>

      <MonthlyHeatmap
        selectedMonth={selectedMonth}
        habits={habits}
        completions={completions}
        goalPercentage={settings.dailyGoalPercentage}
        onPreviousMonth={() =>
          setSelectedMonth((currentMonth) => subMonths(currentMonth, 1))
        }
        onNextMonth={() =>
          setSelectedMonth((currentMonth) => addMonths(currentMonth, 1))
        }
      />

      <WeeklyReport
        selectedDate={today}
        habits={habits}
        completions={completions}
        goalPercentage={settings.dailyGoalPercentage}
      />

      <section className="mt-8 border-b border-(--cp-border) pb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-(--cp-accent)">$ week</h2>
          <span className="text-(--cp-muted)">
            goal {settings.dailyGoalPercentage}%
          </span>
        </div>

        <div className="space-y-3">
          {stats.weekProgress.map((day) => {
            const metGoal = day.percent >= settings.dailyGoalPercentage;

            return (
              <div
                key={day.dateKey}
                className="grid grid-cols-[64px_1fr_56px] items-center gap-3"
              >
                <span
                  className={
                    metGoal ? "text-(--cp-accent)" : "text-(--cp-muted)"
                  }
                >
                  {format(day.date, "EEE")}
                </span>

                <div className="cp-dot-bg h-4 border border-(--cp-border)">
                  <div
                    className={[
                      "h-full transition-all",
                      metGoal ? "bg-(--cp-accent)" : "bg-(--cp-dim)",
                    ].join(" ")}
                    style={{ width: `${day.percent}%` }}
                  />
                </div>

                <span
                  className={[
                    "text-right",
                    metGoal ? "text-(--cp-accent)" : "text-(--cp-muted)",
                  ].join(" ")}
                >
                  {day.percent}%
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-(--cp-accent)">$ habits</h2>
          <span className="text-(--cp-muted)">sorted by streak</span>
        </div>

        {stats.habitStats.length === 0 ? (
          <EmptyState
            command="$ habits --stats"
            title="no habit stats"
            message="complete a habit to start generating per-habit streak data."
          />
        ) : (
          <div className="space-y-3">
            {stats.habitStats.map(
              ({ habit, currentStreak, completionsForHabit }) => (
                <article key={habit.id} className="cp-panel p-3">
                  <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xl text-(--cp-text)">
                        <span className="mr-2 text-(--cp-muted)">
                          {habit.icon}
                        </span>
                        {habit.name}
                      </p>

                      <p className="mt-1 text-sm text-(--cp-muted)">
                        logs: {completionsForHabit} · routine: {habit.category}
                      </p>
                    </div>

                    <div
                      className={[
                        "inline-flex items-center gap-1 text-xl",
                        currentStreak > 0
                          ? "text-(--cp-accent)"
                          : "text-(--cp-muted)",
                      ].join(" ")}
                    >
                      <Flame size={18} />
                      {currentStreak}
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>

      <footer className="mt-8 border-t border-(--cp-border) pt-5 text-xl">
        <div className="flex items-center justify-between">
          <span>
            [<span className="text-(--cp-accent)">✓</span>] stats
          </span>
          <span className="text-(--cp-muted)">local-report</span>
        </div>
      </footer>
    </TerminalShell>
  );
}

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  accent: string;
};

function StatCard({ icon, label, value, accent }: StatCardProps) {
  return (
    <article className="cp-panel p-3">
      <div className={`mb-3 inline-flex items-center gap-2 ${accent}`}>
        {icon}
        <span className="text-sm">{label}</span>
      </div>

      <p className="text-3xl font-bold text-(--cp-text)">{value}</p>
    </article>
  );
}
