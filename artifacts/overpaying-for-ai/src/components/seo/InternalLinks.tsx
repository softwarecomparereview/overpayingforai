import { Link } from "wouter";

export interface InternalLink {
  href: string;
  text: string;
}

interface InternalLinksProps {
  links: InternalLink[];
  heading?: string;
  maxLinks?: number;
}

/**
 * InternalLinks — renders a "Related" link strip for SEO and user navigation.
 * Caps at maxLinks (default 5) to keep the list scannable.
 */
export function InternalLinks({ links, heading = "Related", maxLinks = 5 }: InternalLinksProps) {
  if (!links || links.length === 0) return null;

  return (
    <section className="border-t border-border pt-8 mt-10">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">{heading}</h2>
      <div className="flex flex-wrap gap-3">
        {links.slice(0, maxLinks).map((link) => (
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
