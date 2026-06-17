import type { AppSettings } from "../../types/checkpoint";

type TerminalHeaderProps = {
  settings: AppSettings;
};

export default function TerminalHeader({ settings }: TerminalHeaderProps) {
  return (
    <header className="space-y-2">
      <h1 className="text-[22px] leading-none tracking-tight">
        <span className="text-(--cp-accent)">{settings.username}</span>
        <span className="text-(--cp-warn)">[{settings.planLabel}]</span>
        <span className="text-(--cp-info)">
          @{settings.machineName}
        </span>{" "}
        <span className="text-(--cp-accent)">#</span>{" "}
        <span className="text-(--cp-text)">daily</span>
      </h1>

      <p className="text-lg leading-tight text-(--cp-muted)">
        // technically, reading this counts as screen time.
        <br />
        make it count.
      </p>
    </header>
  );
}
