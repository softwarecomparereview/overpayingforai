import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { searchSite, type SiteSearchEntry } from "@/utils/siteSearch";
import { trackSearch } from "@/utils/analytics";

interface SearchBoxProps {
  placeholder?: string;
  onClose?: () => void;
  autoFocus?: boolean;
  className?: string;
}

const FALLBACK_LINKS = [
  { href: "/pricing/chatgpt-pricing", label: "ChatGPT pricing" },
  { href: "/compare", label: "All comparisons" },
  { href: "/calculator", label: "Calculator" },
  { href: "/best", label: "Best lists" },
];

export function SearchBox({
  placeholder = "Search pages, tools, comparisons…",
  onClose,
  autoFocus = false,
  className = "",
}: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SiteSearchEntry[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const noResultsTrackedRef = useRef<string>("");

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [autoFocus]);

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        onClose?.();
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [onClose]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    setActiveIndex(-1);

    if (!q.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const found = searchSite(q);
    setResults(found);
    setShowDropdown(true);

    // Track no-results once per distinct query
    if (q.trim().length >= 2 && found.length === 0 && noResultsTrackedRef.current !== q.trim()) {
      noResultsTrackedRef.current = q.trim();
      trackSearch("no_results", {
        query: q.trim(),
        result_count: 0,
        page_location: window.location.pathname,
      });
    }
  }, []);

  const navigateTo = useCallback(
    (entry: SiteSearchEntry) => {
      trackSearch("result_click", {
        query: query.trim(),
        result_count: results.length,
        clicked_slug: entry.href,
        page_location: window.location.pathname,
      });
      setQuery("");
      setResults([]);
      setShowDropdown(false);
      setLocation(entry.href);
      onClose?.();
    },
    [query, results.length, setLocation, onClose],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        setShowDropdown(false);
        onClose?.();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) return;

        trackSearch("submit", {
          query: trimmed,
          result_count: results.length,
          page_location: window.location.pathname,
        });

        if (activeIndex >= 0 && results[activeIndex]) {
          navigateTo(results[activeIndex]);
        } else if (results.length > 0) {
          navigateTo(results[0]);
        }
      }
    },
    [query, results, activeIndex, navigateTo, onClose],
  );

  const clearQuery = () => {
    setQuery("");
    setResults([]);
    setShowDropdown(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const noResults = showDropdown && query.trim().length >= 2 && results.length === 0;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.304 10.011a3.5 3.5 0 1 1 .707-.707l2.343 2.343a.5.5 0 0 1-.707.707L9.304 10.011Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
          </svg>
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (query.trim()) setShowDropdown(true); }}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          aria-label="Search site"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          className="w-full bg-muted/60 border border-border rounded-lg pl-9 pr-8 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/40 transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={clearQuery}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {(showDropdown && results.length > 0) && (
        <ul
          role="listbox"
          aria-label="Search results"
          className="absolute top-full left-0 right-0 mt-1.5 bg-background border border-border rounded-lg shadow-lg z-[200] overflow-hidden divide-y divide-border/60"
        >
          {results.map((entry, i) => (
            <li key={entry.href} role="option" aria-selected={i === activeIndex}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); navigateTo(entry); }}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                  i === activeIndex ? "bg-muted" : "hover:bg-muted/60"
                }`}
              >
                <span className="flex-shrink-0 mt-px text-xs font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded whitespace-nowrap">
                  {entry.pageType}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-snug truncate">{entry.title}</p>
                  {entry.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-1">{entry.description}</p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* No results state */}
      {noResults && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-background border border-border rounded-lg shadow-lg z-[200] px-4 py-5">
          <p className="text-sm text-muted-foreground mb-3">
            No results for <span className="font-semibold text-foreground">"{query}"</span>. Try one of these:
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {FALLBACK_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs text-primary hover:underline font-medium"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setShowDropdown(false);
                  onClose?.();
                }}
              >
                {link.label} →
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
