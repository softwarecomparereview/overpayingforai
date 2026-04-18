import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

const DEFAULT_TITLE = "Best AI Tools & Cost Comparison | OverpayingForAI";
const DEFAULT_DESCRIPTION = "Compare AI tools, pricing, and alternatives to avoid overpaying.";

interface PageSeoProps {
  title?: string;
  description?: string;
  schema?: object | object[];
  canonicalUrl?: string;
}

/**
 * PageSeo — headless component that updates document.title, meta description,
 * injects a canonical link tag, and injects JSON-LD schema script tags on mount.
 * Cleans up schemas on unmount. Safe to place anywhere in the render tree.
 */
export function PageSeo({ title, description, schema, canonicalUrl }: PageSeoProps) {
  const scriptIds = useRef<string[]>([]);
  // Subscribe to wouter's location so the canonical effect re-runs on SPA route
  // changes even when the caller does not pass an explicit `canonicalUrl`.
  // Without this, the canonical href can stick to the previous route's path.
  const [location] = useLocation();

  useEffect(() => {
    document.title = title || DEFAULT_TITLE;

    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description || DEFAULT_DESCRIPTION);
  }, [title, description]);

  useEffect(() => {
    // Resolve canonical:
    // 1) explicit canonicalUrl wins (caller controls query-string strategy)
    // 2) otherwise canonicalize to the bare pathname — strip query/hash so
    //    state-bearing URLs (?m=&i=&o=, ?ref=, ?utm_*=) collapse to the
    //    primary surface.
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : location || "/";
    const href = canonicalUrl
      ? `https://overpayingforai.com${canonicalUrl}`
      : `https://overpayingforai.com${pathname}`;

    const existing = document.querySelectorAll('link[rel="canonical"]');
    existing.forEach((el) => el.remove());

    const link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", href);
    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, [canonicalUrl, location]);

  useEffect(() => {
    if (!schema) return;

    const schemas = Array.isArray(schema) ? schema : [schema];
    const ids: string[] = [];

    schemas.forEach((s, i) => {
      const id = `schema-ld-page-${i}`;
      const existing = document.getElementById(id);
      if (existing) existing.remove();

      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = id;
      script.textContent = JSON.stringify(s);
      document.head.appendChild(script);
      ids.push(id);
    });

    scriptIds.current = ids;

    return () => {
      ids.forEach((id) => document.getElementById(id)?.remove());
    };
  }, [schema]);

  return null;
}
