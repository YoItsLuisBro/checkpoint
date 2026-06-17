import TerminalShell from "../components/layout/TerminalShell";
import TopNav, { type AppView } from "../components/layout/TopNav";

type PlaceholderPageProps = {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
};

const pageCopy: Record<
  "stats" | "profile",
  {
    title: string;
    subtitle: string;
    status: string;
  }
> = {
  stats: {
    title: "$ stats",
    subtitle: "// streak reports, weekly logs, and completion history.",
    status: "coming soon",
  },
  profile: {
    title: "$ profile",
    subtitle: "// settings, themes, exports, and local backups.",
    status: "coming soon",
  },
};

export default function PlaceholderPage({
  activeView,
  onChangeView,
}: PlaceholderPageProps) {
  const copy = activeView === "profile" ? pageCopy.profile : pageCopy.stats;

  return (
    <TerminalShell>
      <TopNav activeView={activeView} onChangeView={onChangeView} />

      <header className="space-y-2">
        <h1 className="text-[22px] leading-none tracking-tight">
          <span className="text-emerald-400">checkpoint</span>
          <span className="text-yellow-400">[local]</span>
          <span className="text-sky-300">@{activeView}</span>{" "}
          <span className="text-emerald-400">#</span> <span>{copy.status}</span>
        </h1>

        <p className="text-lg leading-tight text-zinc-500">{copy.subtitle}</p>
      </header>

      <section className="mt-10 border border-zinc-800 bg-zinc-950 p-4">
        <p className="text-xl text-emerald-400">{copy.title}</p>
        <p className="mt-3 text-zinc-500">
          This screen is wired into the navigation. We’ll build it after the
          streak engine.
        </p>
      </section>
    </TerminalShell>
  );
}
