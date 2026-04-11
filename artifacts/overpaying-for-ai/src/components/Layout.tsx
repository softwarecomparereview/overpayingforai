import { useState } from "react";
import { Link, useLocation } from "wouter";

const navLinks = [
  { href: "/calculator", label: "Calculator" },
  { href: "/decision-engine", label: "Decision Engine" },
  { href: "/compare/claude-vs-gpt-cost", label: "Comparisons" },
  { href: "/ai-types", label: "AI Types" },
  { href: "/resources", label: "Resources" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-bold text-sm sm:text-base text-foreground hover:text-primary transition-colors flex-shrink-0"
          >
            <span className="text-primary font-mono text-xs sm:text-sm bg-primary/10 px-1.5 sm:px-2 py-0.5 rounded">$</span>
            OverpayingForAI
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  location.startsWith(link.href)
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 ml-auto">
            <Link
              href="/calculator"
              className="text-xs sm:text-sm bg-primary text-primary-foreground px-3 sm:px-4 py-1 sm:py-1.5 rounded font-medium hover:bg-primary/90 transition-colors"
              data-testid="nav-cta"
            >
              <span className="hidden sm:inline">Calculate Cost</span>
              <span className="sm:hidden">Calculate</span>
            </Link>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 rounded hover:bg-muted transition-colors"
            >
              <span
                className={`block w-5 h-0.5 bg-foreground transition-transform origin-center ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
              />
              <span
                className={`block w-5 h-0.5 bg-foreground transition-opacity ${menuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block w-5 h-0.5 bg-foreground transition-transform origin-center ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
              />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 rounded text-sm transition-colors ${
                  location.startsWith(link.href)
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-muted/30 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
            <div>
              <p className="font-semibold text-foreground mb-3">Tools</p>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/calculator" className="hover:text-foreground transition-colors">Cost Calculator</Link></li>
                <li><Link href="/decision-engine" className="hover:text-foreground transition-colors">Decision Engine</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-3">Comparisons</p>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/compare/claude-vs-gpt-cost" className="hover:text-foreground transition-colors">Claude vs GPT-4o</Link></li>
                <li><Link href="/compare/chatgpt-vs-cursor-cost" className="hover:text-foreground transition-colors">ChatGPT vs Cursor</Link></li>
                <li><Link href="/compare/subscription-vs-api-ai-cost" className="hover:text-foreground transition-colors">Subscription vs API</Link></li>
                <li><Link href="/compare/deepseek-vs-gpt4o-cost" className="hover:text-foreground transition-colors">DeepSeek vs GPT-4o</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-3">Best Lists</p>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/best/best-ai-for-coding-on-a-budget" className="hover:text-foreground transition-colors">Best for Coding</Link></li>
                <li><Link href="/best/best-ai-under-20-per-month" className="hover:text-foreground transition-colors">Under $20/month</Link></li>
                <li><Link href="/best/best-free-ai-tools-for-builders" className="hover:text-foreground transition-colors">Best Free Tools</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-3">Guides</p>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/guides/how-to-reduce-ai-cost" className="hover:text-foreground transition-colors">Reduce AI Costs</Link></li>
                <li><Link href="/guides/token-cost-explained" className="hover:text-foreground transition-colors">Token Cost Explained</Link></li>
                <li><Link href="/guides/when-to-use-api-vs-subscription" className="hover:text-foreground transition-colors">API vs Subscription</Link></li>
                <li><Link href="/resources" className="hover:text-foreground transition-colors">All Resources</Link></li>
                <li><Link href="/changelog" className="hover:text-foreground transition-colors">Pricing Data</Link></li>
                <li><Link href="/pricing-changelog" className="hover:text-foreground transition-colors">Pricing Changelog</Link></li>
                <li><Link href="/ai-types" className="hover:text-foreground transition-colors">Browse AI Types</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-xs text-muted-foreground/75 leading-relaxed text-center sm:text-left">
            <p>© 2026 OverpayingForAI · A product by Assetize Consultancy Pty Ltd · Built by <a href="https://www.linkedin.com/in/aniruddhpanvalkar" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">Aniruddh</a></p>
            <p>All content © 2026 Assetize Consultancy Pty Ltd. Unauthorized reproduction prohibited.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
