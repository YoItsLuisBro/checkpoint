import { useCheckpointStore } from "../../store/useCheckpointStore";
import PWAStatus from "./PWAStatus";

type TerminalShellProps = {
  children: React.ReactNode;
};

export default function TerminalShell({ children }: TerminalShellProps) {
  const theme = useCheckpointStore(
    (state) => state.settings.theme ?? "terminal",
  );

  return (
    <main data-theme={theme} className="cp-app">
      <section className="cp-shell">
        <PWAStatus />
        {children}
      </section>
    </main>
  );
}
