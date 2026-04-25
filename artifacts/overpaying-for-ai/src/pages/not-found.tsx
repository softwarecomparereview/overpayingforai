import { Link } from "wouter";
import { SearchBox } from "@/components/search/SearchBox";

const QUICK_LINKS = [
  { href: "/calculator", label: "AI Cost Calculator" },
  { href: "/compare", label: "Compare AI Tools" },
  { href: "/decision-engine", label: "Decision Engine" },
  { href: "/best", label: "Best AI by Use Case" },
  { href: "/pricing/chatgpt-pricing", label: "ChatGPT Pricing" },
  { href: "/guides/how-to-reduce-ai-cost", label: "Reduce AI Costs" },
];

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <p className="text-5xl font-bold text-primary font-mono mb-3">404</p>
          <h1 className="text-xl font-bold text-foreground mb-2">Page not found</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            That page doesn't exist — or the URL changed. Search for what you're looking for, or browse common pages below.
          </p>
        </div>

        <div className="mb-8">
          <SearchBox
            placeholder="Search AI pricing, comparisons, guides…"
            autoFocus
          />
        </div>

        <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors group"
            >
              <span className="text-sm text-foreground group-hover:text-primary transition-colors font-medium">
                {link.label}
              </span>
              <span className="text-muted-foreground text-xs">→</span>
            </Link>
          ))}
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
