import { Shield } from "lucide-react";

type ShieldPanelProps = {
  shieldCount: number;
  maxShields: number;
  currentPercent: number;
  goalPercent: number;
  isShielded: boolean;
  canUseShield: boolean;
  onUseShield: () => void;
};

export default function ShieldPanel({
  shieldCount,
  maxShields,
  currentPercent,
  goalPercent,
  isShielded,
  canUseShield,
  onUseShield,
}: ShieldPanelProps) {
  return (
    <section className="mt-4 border border-(--cp-border) bg-(--cp-panel) p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl text-(--cp-accent)">
            <Shield size={20} />$ shields
          </h2>

          <p className="mt-1 text-sm text-(--cp-muted)">
            // earn 1 shield every 7 goal days. max {maxShields}.
          </p>
        </div>

        <span className="border border-(--cp-accent) bg-(--cp-accent-soft) px-3 py-1 text-(--cp-accent)">
          [{shieldCount}/{maxShields}]
        </span>
      </div>

      <div className="mt-4 border border-(--cp-border) bg-(--cp-surface) p-3 text-sm">
        {isShielded ? (
          <p className="text-(--cp-accent)">
            [protected] this day is shielded and will not break your daily goal
            streak.
          </p>
        ) : currentPercent >= goalPercent ? (
          <p className="text-(--cp-accent)">
            [safe] daily goal met. no shield needed.
          </p>
        ) : (
          <p className="text-(--cp-muted)">
            [risk] current progress {currentPercent}% / goal {goalPercent}%.
          </p>
        )}
      </div>

      {!isShielded && (
        <button
          type="button"
          onClick={onUseShield}
          disabled={!canUseShield}
          className={[
            "mt-4 w-full border px-4 py-3 text-sm font-bold",
            canUseShield
              ? "border-(--cp-warn) text-(--cp-warn)"
              : "border-(--cp-border) text-(--cp-muted) opacity-60",
          ].join(" ")}
        >
          use shield on this day
        </button>
      )}
    </section>
  );
}
