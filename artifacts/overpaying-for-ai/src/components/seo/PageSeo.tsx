import { useEffect, useRef } from "react";

interface PageSeoProps {
  title: string;
  description: string;
  schema?: object | object[];
}

/**
 * PageSeo — headless component that updates document.title, meta description,
 * and injects JSON-LD schema script tags on mount. Cleans up schemas on unmount.
 * Safe to place anywhere in the render tree; renders nothing visible.
 */
export function PageSeo({ title, description, schema }: PageSeoProps) {
  const scriptIds = useRef<string[]>([]);

  useEffect(() => {
    document.title = title;

    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);
  }, [title, description]);

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
