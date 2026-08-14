import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { to: "/", label: "Dashboard" },
  { to: "/machines/MA03", label: "Machines" },
  { to: "/report", label: "Report" },
  { to: "/tasks", label: "Tasks" },
] as const;

export function AppShell() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-[var(--color-background)]">
      <header className="flex items-center justify-between border-b border-[var(--color-outline)] px-4 py-3">
        <div className="text-sm font-semibold text-[var(--color-primary)]">
          Machine: MA03
        </div>
        <div className="text-xs uppercase tracking-wide text-[var(--color-on-surface-variant)]">
          IndustriOS
        </div>
      </header>
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 mx-auto flex max-w-md border-t border-[var(--color-outline)] bg-white">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === "/"}
            className={({ isActive }) =>
              `flex-1 py-3 text-center text-xs font-semibold ${
                isActive
                  ? "bg-[var(--color-secondary-container)] text-[#5c2400]"
                  : "text-[var(--color-on-surface-variant)]"
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
