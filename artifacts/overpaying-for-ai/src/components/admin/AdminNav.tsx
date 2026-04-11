import { Link, useLocation } from "wouter";

const ADMIN_KEY = "overpaying_admin";

const NAV_LINKS = [
  { href: "/admin/pricing-refresh", label: "Pricing Refresh" },
  { href: "/admin/affiliates", label: "Affiliates" },
  { href: "/admin/affiliate-audit", label: "Audit Dashboard" },
];

export function AdminNav({ title }: { title: string }) {
  const [location] = useLocation();

  const handleLock = () => {
    localStorage.removeItem(ADMIN_KEY);
    window.location.href = "/";
  };

  const TODAY = new Date().toISOString().split("T")[0];

  return (
    <div className="border-b border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">Admin</span>
          <h1 className="font-bold text-foreground text-sm sm:text-base">{title}</h1>
          <nav className="hidden sm:flex items-center gap-1 ml-2">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  location === l.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:block">{TODAY}</span>
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">← Public site</Link>
          <button
            onClick={handleLock}
            className="text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1"
          >
            Lock
          </button>
        </div>
      </div>
      {/* Mobile nav */}
      <div className="sm:hidden flex gap-1 mt-2 flex-wrap">
        {NAV_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
              location === l.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
