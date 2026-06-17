export type AppView = "dashboard" | "habits" | "stats" | "profile";

type TopNavProps = {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
};

const navItems: Array<{
  id: AppView;
  label: string;
}> = [
  {
    id: "dashboard",
    label: "habits",
  },
  {
    id: "habits",
    label: "edit",
  },
  {
    id: "stats",
    label: "stats",
  },
  {
    id: "profile",
    label: "profile",
  },
];

export default function TopNav({ activeView, onChangeView }: TopNavProps) {
  return (
    <nav className="-mx-4 mb-6 border-b bg-(--cp-surface) border-(--cp-border)">
      <div className="grid grid-cols-4">
        {navItems.map((item) => {
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeView(item.id)}
              className={[
                "relative py-4 text-center text-lg tracking-wide transition",
                isActive ? "text-(--cp-accent)" : "text-(--cp-muted)",
              ].join(" ")}
            >
              <span>{item.label}</span>

              <span
                className={[
                  "absolute bottom-0 left-1/2 h-0.5 w-3/4 -translate-x-1/2 transition",
                  isActive ? "bg-(--cp-accent)" : "bg-transparent",
                ].join(" ")}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
