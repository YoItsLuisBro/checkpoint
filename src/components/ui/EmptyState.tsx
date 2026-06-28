import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  message: string;
  command?: string;
  action?: ReactNode;
};

export default function EmptyState({
  title,
  message,
  command = "$ checkpoint status",
  action,
}: EmptyStateProps) {
  return (
    <section className="border border-(--cp-border) bg-(--cp-panel) p-4">
      <p className="text-sm text-(--cp-muted)">{command}</p>

      <div className="mt-4 space-y-2">
        <p className="text-xl text-(--cp-accent)">[empty] {title}</p>

        <p className="text-sm leading-relaxed text-(--cp-muted)">
          // {message}
        </p>
      </div>

      {action && <div className="mt-4">{action}</div>}
    </section>
  );
}
