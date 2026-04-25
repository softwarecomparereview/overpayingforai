import { Link } from "wouter";
import { trackInternalLinkClick } from "@/utils/analytics";

export interface InternalLink {
  href: string;
  text: string;
}

const FALLBACK_LINKS: InternalLink[] = [
  { href: "/calculator", text: "AI Cost Calculator" },
  { href: "/best", text: "Best AI Tools" },
  { href: "/ai-types", text: "Browse AI Types" },
  { href: "/compare", text: "Compare Models" },
  { href: "/best/best-ai-under-20-per-month", text: "Best AI Under $20/month" },
  { href: "/ai-types/writing-ai", text: "Best AI for Writing" },
];

interface InternalLinksProps {
  links?: InternalLink[];
  heading?: string;
  maxLinks?: number;
  trackingContext?: { pageSlug: string; pageType: string };
}

/**
 * InternalLinks — renders a "Related" link strip for SEO and user navigation.
 * Caps at maxLinks (default 8) to keep the list scannable.
 * Falls back to site-wide links if no links are provided.
 * When trackingContext is supplied, fires internal_link_click on every click.
 */
export function InternalLinks({ links, heading = "Related", maxLinks = 8, trackingContext }: InternalLinksProps) {
  const displayLinks = (links && links.length > 0) ? links : FALLBACK_LINKS;

  return (
    <section className="border-t border-border pt-8 mt-10">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">{heading}</h2>
      <div className="flex flex-wrap gap-3">
        {displayLinks.slice(0, maxLinks).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={
              trackingContext
                ? () =>
                    trackInternalLinkClick({
                      pageSlug: trackingContext.pageSlug,
                      pageType: trackingContext.pageType,
                      ctaLabel: link.text,
                      destinationSlug: link.href,
                    })
                : undefined
            }
            className="text-sm px-3 py-1.5 rounded border border-border bg-muted/30 hover:bg-muted transition-colors text-foreground"
          >
            {link.text}
          </Link>
        ))}
      </div>
    </section>
  );
}
