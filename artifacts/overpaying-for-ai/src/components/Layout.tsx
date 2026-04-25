import { useState } from "react";
import { Link, useLocation } from "wouter";
import { SearchBox } from "@/components/search/SearchBox";

const navLinks = [
  { href: "/calculator", label: "Calculator" },
  { href: "/decision-engine", label: "Decision Engine" },
  { href: "/compare", label: "Comparisons" },
  { href: "/ai-types", label: "AI Types" },
  { href: "/resources", label: "Resources" },
  { href: "/audit/ai-cost-reliability-audit", label: "Audit" },
  { href: "/contact", label: "Contact" },
];

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.304 10.011a3.5 3.5 0 1 1 .707-.707l2.343 2.343a.5.5 0 0 1-.707.707L9.304 10.011Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const closeSearch = () => setSearchOpen(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        {/* ── Main header row ──────────────────────────────────── */}
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
            {/* Desktop search icon */}
            <button
              onClick={() => {
                setSearchOpen((v) => !v);
                setMenuOpen(false);
              }}
              aria-label={searchOpen ? "Close search" : "Open search"}
              title="Search"
              className={`hidden md:flex items-center justify-center w-8 h-8 rounded transition-colors ${
                searchOpen
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {searchOpen ? (
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : (
                <SearchIcon />
              )}
            </button>

            <Link
              href="/calculator"
              className="text-xs sm:text-sm bg-primary text-primary-foreground px-3 sm:px-4 py-1 sm:py-1.5 rounded font-medium hover:bg-primary/90 transition-colors"
              data-testid="nav-cta"
            >
              <span className="hidden sm:inline">Calculate Cost</span>
              <span className="sm:hidden">Calculate</span>
            </Link>

            {/* Mobile: search icon + hamburger */}
            <button
              onClick={() => {
                setSearchOpen(false);
                setMenuOpen((v) => !v);
              }}
              aria-label="Toggle navigation menu"
              className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 rounded hover:bg-muted transition-colors"
            >
              <span
                className={`block w-5 h-0.5 bg-foreground transition-transform origin-center ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
              />
              <span className={`block w-5 h-0.5 bg-foreground transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
              <span
                className={`block w-5 h-0.5 bg-foreground transition-transform origin-center ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* ── Desktop search row (expands below header bar) ────── */}
        {searchOpen && (
          <div className="hidden md:block border-t border-border bg-background px-4 py-3">
            <div className="max-w-2xl mx-auto">
              <SearchBox
                placeholder="Search AI pricing, comparisons, guides…"
                onClose={closeSearch}
                autoFocus
              />
            </div>
          </div>
        )}

        {/* ── Mobile menu ───────────────────────────────────────── */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-2">
            {/* Search at top of mobile menu */}
            <div className="pb-1">
              <SearchBox
                placeholder="Search pages…"
                onClose={closeMenu}
              />
            </div>
            <div className="border-t border-border/60 pt-1 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
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
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Sitewide fallback CTA — ensures every page has at least one monetised touchpoint */}
      <div className="border-t border-border bg-muted/40 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-muted-foreground text-center sm:text-left">
            <span className="font-semibold text-foreground">Not sure which AI is cheapest for your use case?</span>{" "}
            Find out in 30 seconds — no signup required.
          </p>
          <div className="flex items-center gap-3 flex-shrink-0">
            <a href="/calculator" className="bg-primary text-primary-foreground font-medium px-4 py-1.5 rounded-lg hover:bg-primary/90 transition-colors text-sm">
              Calculate Cost
            </a>
            <a href="/decision-engine" className="text-muted-foreground hover:text-foreground transition-colors">
              Decision Engine →
            </a>
          </div>
        </div>
      </div>

      <footer className="border-t border-border bg-muted/30 mt-0">
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
            <p className="mb-2 flex flex-wrap gap-x-0 gap-y-1">
              <Link href="/audit/ai-cost-reliability-audit" className="hover:text-foreground transition-colors">AI Cost Audit</Link>
              <span className="mx-2">·</span>
              <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
              <span className="mx-2">·</span>
              <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
              <span className="mx-2">·</span>
              <Link href="/media-kit" className="hover:text-foreground transition-colors">Media Kit</Link>
              <span className="mx-2">·</span>
              <Link href="/affiliate-disclosure" className="hover:text-foreground transition-colors">Affiliate Disclosure</Link>
              <span className="mx-2">·</span>
              <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <span className="mx-2">·</span>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            </p>
            <p>© 2026 OverpayingForAI · A product by Aniruddh Consultancy Pty Ltd · Built by <a href="https://www.linkedin.com/in/aniruddhpanvalkar" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">Aniruddh</a></p>
            <p>All content © 2026 Aniruddh Consultancy Pty Ltd. Unauthorized reproduction prohibited.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
