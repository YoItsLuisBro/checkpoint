import { useMemo } from "react";
import {
  eachDayOfInterval,
  format,
  startOfWeek,
  endOfWeek,
  subDays,
} from "date-fns";
import { Flame, Shield, Activity, CheckCircle2 } from "lucide-react";

import TerminalShell from "../components/layout/TerminalShell";
import TopNav, { type AppView } from "../components/layout/TopNav";
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
  const habits = useCheckpointStore((state) => state.habits);
  const completions = useCheckpointStore((state) => state.completions);
  const settings = useCheckpointStore((state) => state.settings);

  const today = useMemo(() => new Date(), []);
  const activeHabits = habits.filter((habit) => !habit.archivedAt);

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
      const progress = getDayProgressPercent(
        activeHabits,
        completions,
        dateKey,
      );

      return {
        date: day,
        dateKey,
        ...progress,
      };
    });

    const thirtyDayProgress = last30Days.map((day) => {
      const dateKey = toDateKey(day);
      return getDayProgressPercent(activeHabits, completions, dateKey);
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
      activeHabits,
      completions,
      today,
      settings.dailyGoalPercentage,
    );

    const perfectDaysThisWeek = getPerfectDaysThisWeek(
      activeHabits,
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
  }, [activeHabits, completions, settings.dailyGoalPercentage, today]);

  return (
    <TerminalShell>
      <TopNav activeView={activeView} onChangeView={onChangeView} />

      <header className="space-y-2">
        <h1 className="text-[22px] leading-none tracking-tight">
          <span className="text-emerald-400">checkpoint</span>
          <span className="text-yellow-400">[local]</span>
          <span className="text-sky-300">@stats</span>{" "}
          <span className="text-emerald-400">#</span> <span>report</span>
        </h1>

        <p className="text-lg leading-tight text-zinc-500">
          // your behavior leaves logs.
          <br />
          read them honestly.
        </p>
      </header>

      <section className="mt-8 grid grid-cols-2 gap-3">
        <StatCard
          icon={<Flame size={18} />}
          label="daily streak"
          value={`${stats.dailyStreak}d`}
          accent="text-emerald-400"
        />

        <StatCard
          icon={<Shield size={18} />}
          label="perfect week"
          value={String(stats.perfectDaysThisWeek)}
          accent="text-cyan-300"
        />

        <StatCard
          icon={<Activity size={18} />}
          label="30d avg"
          value={`${stats.thirtyDayAverage}%`}
          accent="text-yellow-400"
        />

        <StatCard
          icon={<CheckCircle2 size={18} />}
          label="logs"
          value={String(stats.completedLogs)}
          accent="text-indigo-300"
        />
      </section>

      <section className="mt-8 border-b border-zinc-800 pb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-emerald-400">$ week</h2>
          <span className="text-zinc-500">
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
                  className={metGoal ? "text-emerald-400" : "text-zinc-500"}
                >
                  {format(day.date, "EEE")}
                </span>

                <div className="h-4 border border-zinc-800 bg-zinc-950 bg-[radial-gradient(#1f2937_1px,transparent_1px)] bg-size-[4px_4px]">
                  <div
                    className={[
                      "h-full transition-all",
                      metGoal ? "bg-emerald-400" : "bg-zinc-700",
                    ].join(" ")}
                    style={{ width: `${day.percent}%` }}
                  />
                </div>

                <span
                  className={[
                    "text-right",
                    metGoal ? "text-emerald-400" : "text-zinc-500",
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
          <h2 className="text-2xl font-bold text-emerald-400">$ habits</h2>
          <span className="text-zinc-500">sorted by streak</span>
        </div>

        {stats.habitStats.length === 0 ? (
          <p className="text-zinc-600">// no active habits found</p>
        ) : (
          <div className="space-y-3">
            {stats.habitStats.map(
              ({ habit, currentStreak, completionsForHabit }) => (
                <article
                  key={habit.id}
                  className="border border-zinc-800 bg-zinc-950 p-3"
                >
                  <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xl text-zinc-100">
                        <span className="mr-2 text-zinc-500">{habit.icon}</span>
                        {habit.name}
                      </p>

                      <p className="mt-1 text-sm text-zinc-600">
                        logs: {completionsForHabit} · routine: {habit.category}
                      </p>
                    </div>

                    <div
                      className={[
                        "inline-flex items-center gap-1 text-xl",
                        currentStreak > 0
                          ? "text-emerald-400"
                          : "text-zinc-500",
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

      <footer className="mt-8 border-t border-zinc-800 pt-5 text-xl">
        <div className="flex items-center justify-between">
          <span>
            [<span className="text-emerald-400">✓</span>] stats
          </span>
          <span className="text-zinc-500">local-report</span>
        </div>
      </footer>
    </TerminalShell>
  );
}

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
};

function StatCard({ icon, label, value, accent }: StatCardProps) {
  return (
    <article className="border border-zinc-800 bg-zinc-950 p-3">
      <div className={`mb-3 inline-flex items-center gap-2 ${accent}`}>
        {icon}
        <span className="text-sm">{label}</span>
      </div>

      <p className="text-3xl font-bold text-zinc-100">{value}</p>
    </article>
  );
}
