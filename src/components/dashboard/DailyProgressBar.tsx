type DailyProgressBarProps = {
  completed: number;
  total: number;
  percent: number;
  goal: number;
};

export default function DailyProgressBar({
  completed,
  total,
  percent,
  goal,
}: DailyProgressBarProps) {
  return (
    <section className="mt-4 space-y-2">
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <div className="h-5 border cp-dot-bg border-(--cp-border)">
          <div
            className="h-full bg-(--cp-accent) transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="text-xl text-(--cp-accent)">
          {percent}%{" "}
          <span className="text-(--cp-muted)">
            [{completed}/{total}]
          </span>
        </div>
      </div>

      <p className="text-xl text-(--cp-muted)">// goal: {goal}%</p>
    </section>
  );
}