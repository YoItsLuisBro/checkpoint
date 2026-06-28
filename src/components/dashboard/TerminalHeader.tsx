import { getReadableDate } from "../../lib/dates";
import { useCheckpointStore } from "../../store/useCheckpointStore";

export default function TerminalHeader() {
  const username = useCheckpointStore(
    (state) => state.settings.username || "user",
  );

  return (
    <header>
      <p className="text-sm text-(--cp-muted)">{username}@checkpoint # daily</p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold leading-none tracking-tight text-(--cp-text)">
            CHECKPOINT
          </h1>

          <p className="mt-2 text-sm text-(--cp-muted)">
            // {getReadableDate()}
          </p>
        </div>
      </div>
    </header>
  );
}
