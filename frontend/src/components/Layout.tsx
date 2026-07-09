import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-line sticky top-0 bg-ink/90 backdrop-blur z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3 font-display font-semibold text-lg">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2.5 h-5 bg-[#00836C] rounded-sm transform -skew-x-12 shadow-[0_0_10px_rgba(0,131,108,0.3)]" />
              <span className="w-2.5 h-5 bg-[#F58220] rounded-sm transform -skew-x-12 shadow-[0_0_10px_rgba(245,130,32,0.3)]" />
            </div>
            <span className="tracking-tight text-white font-bold">
              IDBI <span className="text-alert">TrustFabric</span>
            </span>
          </NavLink>
          <nav className="flex items-center gap-1 text-sm font-medium">
            {[
              { to: "/", label: "Overview", end: true },
              { to: "/customer", label: "Customer Wallet" },
              { to: "/admin", label: "Fraud Console" },
            ].map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md transition-colors ${
                    isActive ? "bg-surface2 text-alert font-semibold" : "text-fog hover:text-paper"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-line py-6 text-center text-xs text-fog font-mono">
        IDBI Innovate 2026 — Wildcard Open Track 05 · Novel Banking Innovation
      </footer>
    </div>
  );
}
