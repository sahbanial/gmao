import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { clearAuthSession, getStoredUser } from "../auth/auth-session";
import { Icon } from "../ui/icon";

const PROFILE_PHOTO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA9FilJPq9gYyL10BOb4CcAo-AdMzGSD_HzpcMeWksa2NH6a7CVFlR9eYUTOnTBfUfdlphA-838cBkw4t3fbdKh7y2QaAA3WQnXfQzCWu8AvocPFzfsoNEAWeMUhqM7agP3KdormRiWm6_Lw2a4XglvLnp1eCF79wfDXM_7OaCNDWAx-gYAUHcq5AMPi6Xdzpnno8r1kpG71_tgir2ECyk2-L75QJfC9ObOVqIwPxJUhbyGC6TBr8aeOg";

const tabs = [
  { to: "/", label: "Dashboard", icon: "dashboard", end: true },
  { to: "/machines/MA03", label: "Machines", icon: "precision_manufacturing", end: false },
  { to: "/report", label: "Report", icon: "report_problem", end: false },
  { to: "/tasks", label: "Tasks", icon: "build", end: false },
] as const;

export function AppShell() {
  const location = useLocation();
  const user = getStoredUser();
  const userDisplayName = user ? `${user.firstName} ${user.lastName}` : "Utilisateur";
  const isTransactional = location.pathname.startsWith("/downtimes/");
  const isReport = location.pathname === "/report";
  const isMachine = location.pathname.startsWith("/machines/");
  const showBrand = !isTransactional && !isMachine;

  function handleLogout(): void {
    clearAuthSession();
    window.location.assign("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-on-background antialiased selection:bg-primary-container selection:text-on-primary-container md:flex-row">
      {isTransactional ? null : (
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r-2 border-outline-variant bg-surface-container md:flex">
          <div className="flex items-center gap-sm p-lg">
            <Icon name="precision_manufacturing" className="text-headline-md text-primary" />
            <span className="text-headline-md font-bold text-primary">IndustriOS</span>
          </div>
          <ul className="flex-1 space-y-sm overflow-y-auto px-sm py-sm">
            {tabs.map((tab) => (
              <li key={tab.to}>
                <NavLink
                  to={tab.to}
                  end={tab.end}
                  className={({ isActive }) =>
                    `flex items-center gap-md rounded-full px-md py-sm transition-colors ${
                      isActive
                        ? "bg-secondary-container font-bold text-on-secondary-container"
                        : "text-on-surface-variant hover:bg-surface-container-highest"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon filled={isActive} name={tab.icon} />
                      <span className="text-body-md">{tab.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="border-t-2 border-outline-variant p-lg">
            <div className="flex items-center gap-md">
              <img
                alt=""
                className="h-10 w-10 rounded-full border-2 border-outline-variant object-cover"
                src={PROFILE_PHOTO}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-body-md font-semibold text-on-surface">
                  {userDisplayName}
                </div>
                <div className="text-body-sm text-on-surface-variant">
                  {user?.role ?? "Maintenance"}
                </div>
              </div>
            </div>
            <button
              className="mt-md flex min-h-11 w-full items-center justify-center rounded-xl border-2 border-outline-variant px-md text-body-md font-semibold text-on-surface transition-colors hover:bg-surface-container-highest"
              onClick={handleLogout}
              type="button"
            >
              Déconnexion
            </button>
          </div>
        </aside>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className={`sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b-2 border-outline-variant bg-surface px-margin-mobile ${
            isReport ? "md:hidden" : ""
          }`}
        >
          <div className="flex items-center gap-sm">
            {isTransactional ? (
              <Link
                aria-label="Retour"
                className="-ml-2 rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container"
                to="/"
              >
                <Icon filled={false} name="arrow_back" />
              </Link>
            ) : null}
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-surface-variant">
              <img alt="" className="h-full w-full object-cover" src={PROFILE_PHOTO} />
            </div>
            {showBrand ? (
              <h1 className="hidden text-headline-md font-bold text-primary md:block">Brand</h1>
            ) : (
              <h1 className="text-headline-md font-bold text-primary">Machine: MA03</h1>
            )}
          </div>
          {showBrand ? (
            <h2 className="absolute left-1/2 -translate-x-1/2 text-headline-md font-semibold text-primary md:absolute">
              Machine: MA03
            </h2>
          ) : null}
          <div className="flex items-center gap-sm">
            <span className="hidden max-w-[120px] truncate text-body-sm font-semibold text-on-surface sm:inline md:hidden">
              {userDisplayName}
            </span>
            <button
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full px-sm text-body-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container md:hidden"
              onClick={handleLogout}
              type="button"
            >
              Déconnexion
            </button>
            <button
              aria-label="Notifications"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-transform duration-100 hover:bg-surface-container active:scale-95 md:flex"
              type="button"
            >
              <Icon filled={false} name="notifications" />
            </button>
          </div>
        </header>
        <main
          className={`flex-1 ${isTransactional ? "pb-lg" : "pb-[100px] md:pb-0"} ${
            isReport ? "flex flex-col" : ""
          }`}
        >
          <Outlet />
        </main>
        {isTransactional ? null : (
          <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t-2 border-outline-variant bg-surface px-2 py-3 md:hidden">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center rounded-full px-4 py-1 transition-all duration-200 ${
                    isActive
                      ? "scale-90 bg-secondary-container text-on-secondary-container"
                      : "text-on-surface-variant hover:bg-surface-container-highest"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon filled={isActive} name={tab.icon} />
                    <span className="mt-1 font-label-caps text-label-caps">{tab.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
