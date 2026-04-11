import { useState, ReactNode } from "react";
import { Link } from "wouter";

const ADMIN_KEY = "overpaying_admin";

interface AdminGuardProps {
  title?: string;
  children: ReactNode;
}

export function AdminGuard({ title = "Admin", children }: AdminGuardProps) {
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(ADMIN_KEY) === "1");
  const [key, setKey] = useState("");
  const [err, setErr] = useState(false);

  if (unlocked) return <>{children}</>;

  const attempt = () => {
    if (key === "refresh") {
      localStorage.setItem(ADMIN_KEY, "1");
      setUnlocked(true);
    } else {
      setErr(true);
      setTimeout(() => setErr(false), 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm border border-border rounded-xl p-8 bg-card shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Maintainer access</p>
        <h1 className="text-2xl font-bold mb-6 text-foreground">{title}</h1>
        <label className="block text-sm font-medium text-foreground mb-2">Maintainer key</label>
        <input
          type="password"
          className={`w-full border ${err ? "border-red-400" : "border-border"} rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4`}
          placeholder="Enter key to unlock"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && attempt()}
          autoFocus
        />
        {err && <p className="text-xs text-red-500 mb-3">Incorrect key.</p>}
        <button
          onClick={attempt}
          className="w-full bg-primary text-primary-foreground rounded-lg py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Unlock
        </button>
        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">← Back to public site</Link>
        </div>
      </div>
    </div>
  );
}
