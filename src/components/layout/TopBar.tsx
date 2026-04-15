import { useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/common";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/transactions": "Transactions",
  "/budgets": "Budgets",
  "/insights": "AI Insights",
  "/settings": "Settings",
};

export function TopBar() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? "Dashboard";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="topbar">
      <span className="topbar__title">{title}</span>
      <div className="topbar__right">
        <span className="topbar__date">{today}</span>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell size={16} />
        </Button>
      </div>
    </header>
  );
}
