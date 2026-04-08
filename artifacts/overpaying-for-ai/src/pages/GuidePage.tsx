import { useParams, Link } from "wouter";
import guidesData from "@/data/guides.json";

const guides = guidesData as typeof guidesData;

export function GuidePage() {
  const { slug } = useParams<{ slug: string }>();
  const guide = guides.find((g) => g.slug === slug);

  if (!guide) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Guide not found</h1>
        <p className="text-muted-foreground mb-6">That guide doesn't exist yet.</p>
        <Link href="/" className="text-primary hover:underline">Back to home</Link>
      </div>
    );
  }

  return (
    <article className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <span>Guides</span>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-muted-foreground">{guide.readTime}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">Updated {guide.updatedAt}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">{guide.title}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">{guide.description}</p>
      </div>

      {/* Content */}
      <div className="prose-like space-y-8 mb-10">
        {guide.sections.map((section, i) => (
          <section key={i}>
            <h2 className="text-xl font-bold text-foreground mb-3">{section.heading}</h2>
            <div className="text-muted-foreground leading-relaxed space-y-3">
              {section.content.split("\n\n").map((para, j) => {
                if (para.startsWith("-")) {
                  const items = para.split("\n").filter((l) => l.startsWith("-"));
                  return (
                    <ul key={j} className="list-disc list-inside space-y-1.5 ml-2">
                      {items.map((item, k) => (
                        <li key={k} className="text-muted-foreground text-sm">
                          {item.replace(/^-\s*/, "")}
                        </li>
                      ))}
                    </ul>
                  );
                }
                return <p key={j} className="text-sm sm:text-base">{para}</p>;
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Key Takeaways */}
      {guide.keyTakeaways && guide.keyTakeaways.length > 0 && (
        <div className="border border-primary/20 bg-primary/5 rounded-lg p-5 mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">Key Takeaways</h2>
          <ul className="space-y-2">
            {guide.keyTakeaways.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-primary mt-0.5 flex-shrink-0">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Internal Links */}
      <section className="border-t border-border pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">Related</h2>
        <div className="flex flex-wrap gap-3">
          {guide.internalLinks.map((link) => (
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
    </article>
  );
}

export function GuideIndex() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">AI Cost Guides</h1>
      <p className="text-muted-foreground mb-8">Practical guides for reducing AI spend and making smarter model choices.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {guides.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`}>
            <div className="border border-border rounded-lg p-5 hover:border-primary/40 hover:bg-muted/30 transition-colors cursor-pointer h-full">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">{g.readTime}</span>
              </div>
              <h2 className="font-semibold text-foreground mb-2 text-base">{g.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{g.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
