import { Link } from "wouter";

export interface InternalLink {
  href: string;
  text: string;
}

const FALLBACK_LINKS: InternalLink[] = [
  { href: "/best", text: "Best AI Tools" },
  { href: "/ai-types", text: "Browse AI Types" },
  { href: "/calculator", text: "AI Cost Calculator" },
  { href: "/compare", text: "Compare Models" },
  { href: "/ai-types/writing-ai", text: "Best AI for Writing" },
  { href: "/ai-types/coding-ai", text: "Best AI for Coding" },
];

interface InternalLinksProps {
  links?: InternalLink[];
  heading?: string;
  maxLinks?: number;
}

/**
 * InternalLinks — renders a "Related" link strip for SEO and user navigation.
 * Caps at maxLinks (default 8) to keep the list scannable.
 * Falls back to site-wide links if no links are provided.
 */
export function InternalLinks({ links, heading = "Related", maxLinks = 8 }: InternalLinksProps) {
  const displayLinks = (links && links.length > 0) ? links : FALLBACK_LINKS;

  return (
    <section className="border-t border-border pt-8 mt-10">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">{heading}</h2>
      <div className="flex flex-wrap gap-3">
        {displayLinks.slice(0, maxLinks).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm px-3 py-1.5 rounded border border-border bg-muted/30 hover:bg-muted transition-colors text-foreground"
          >
            {link.text}
          </Link>
        ))}
      </div>
    </section>
  );
}
