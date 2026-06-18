import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const tabBase = "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs";

function tabClass({ isActive }: { isActive: boolean }) {
  // Active state is conveyed by weight + color (not color alone) and, for
  // assistive tech, by the aria-current that NavLink sets automatically.
  return `${tabBase} ${isActive ? "font-bold text-green-800" : "font-medium text-slate-600"}`;
}

export default function Layout() {
  const { role, householdName, member } = useAuth();
  const isParent = role === "parent";

  return (
    // Full-width frame. The bars below span the whole viewport while their
    // contents stay centered at max-w-2xl, so on wide desktop windows the
    // header/footer read as intentional app bars instead of cut-off strips.
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        onClick={(e) => {
          // Hash routing owns the URL hash, so focus the target manually
          // instead of letting the browser navigate to the fragment.
          e.preventDefault();
          const main = document.getElementById("main-content");
          main?.focus();
          main?.scrollIntoView();
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:shadow focus:ring-2 focus:ring-green-700"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3">
          <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" className="h-7 w-7" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">
              {householdName ?? "Bank of Dad"}
            </p>
            <p className="truncate text-xs leading-tight text-slate-600">
              {member?.display_name}
              {isParent ? " · Parent" : " · Kid"}
            </p>
          </div>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-2xl flex-1 px-4 py-4 pb-24 focus:outline-none"
      >
        <Outlet />
      </main>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-2xl">
          <NavLink to="/app" end className={tabClass}>
            <span className="text-xl" aria-hidden="true">
              🏠
            </span>
            Home
          </NavLink>
          <NavLink to="/app/reports" className={tabClass}>
            <span className="text-xl" aria-hidden="true">
              📊
            </span>
            {isParent ? "Reports" : "History"}
          </NavLink>
          {isParent && (
            <NavLink to="/app/family" className={tabClass}>
              <span className="text-xl" aria-hidden="true">
                👪
              </span>
              Family
            </NavLink>
          )}
          <NavLink to="/app/settings" className={tabClass}>
            <span className="text-xl" aria-hidden="true">
              ⚙️
            </span>
            Settings
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
