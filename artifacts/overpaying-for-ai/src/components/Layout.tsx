import { Link, useLocation } from "wouter";

const navLinks = [
  { href: "/calculator", label: "Calculator" },
  { href: "/decision-engine", label: "Decision Engine" },
  { href: "/compare/claude-vs-gpt-cost", label: "Comparisons" },
  { href: "/best/best-ai-under-20-per-month", label: "Best Lists" },
  { href: "/guides/how-to-reduce-ai-cost", label: "Guides" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-base text-foreground hover:text-primary transition-colors">
            <span className="text-primary font-mono text-sm bg-primary/10 px-2 py-0.5 rounded">$</span>
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
          <Link
            href="/calculator"
            className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded font-medium hover:bg-primary/90 transition-colors"
            data-testid="nav-cta"
          >
            Calculate Cost
          </Link>
        </div>
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
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-xs text-muted-foreground/75 leading-relaxed text-center sm:text-left">
            <p>© 2026 OverpayingForAI · A product by Assetize Consultancy Pty Ltd</p>
            <p>Built by Aniruddh · Pricing data may change — verify with providers</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
