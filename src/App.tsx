import { useState } from "react";
import DashboardPage from "./pages/DashboardPage";
import HabitsPage from "./pages/HabitsPage";
import StatsPage from "./pages/StatsPage";
import ProfilePage from "./pages/ProfilePage";
import type { AppView } from "./components/layout/TopNav";

export default function App() {
  const [activeView, setActiveView] = useState<AppView>("dashboard");

  if (activeView === "habits") {
    return <HabitsPage activeView={activeView} onChangeView={setActiveView} />;
  }

  if (activeView === "stats") {
    return <StatsPage activeView={activeView} onChangeView={setActiveView} />;
  }

  if (activeView === "profile") {
    return <ProfilePage activeView={activeView} onChangeView={setActiveView} />;
  }

  return <DashboardPage activeView={activeView} onChangeView={setActiveView} />;
}
