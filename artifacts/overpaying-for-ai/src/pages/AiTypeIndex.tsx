import { Link } from "wouter";
import { track } from "@/utils/analytics";
import aiTypesData from "@/data/aiTypes.json";
import { PageSeo } from "@/components/seo/PageSeo";
import { InternalLinks } from "@/components/seo/InternalLinks";

const ALL_CATEGORIES = [
  ...aiTypesData,
  { slug: "design-ai", title: "Design AI", icon: "🎨", tagline: "AI for image generation and creative work", description: "Coming soon", color: "pink" },
  { slug: "video-audio-ai", title: "Video & Audio AI", icon: "🎬", tagline: "AI for video editing, voiceover, and audio", description: "Coming soon", color: "red" },
  { slug: "automation-agents", title: "Automation & Agents", icon: "🤖", tagline: "AI agents for workflows and automation", description: "Coming soon", color: "gray" },
];

const COLOR_MAP: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700 border-slate-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  teal: "bg-teal-50 text-teal-700 border-teal-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  pink: "bg-pink-50 text-pink-400 border-pink-100",
  red: "bg-red-50 text-red-400 border-red-100",
  gray: "bg-gray-50 text-gray-400 border-gray-100",
};

export function AiTypeIndex() {
  return (
    <div className="bg-white">
      <PageSeo
        title="Browse AI Types & Categories | OverpayingForAI"
        description="Find the cheapest AI tool for your specific use case — coding, writing, research, data, and more. Compare pricing by category."
        canonicalUrl="/ai-types"
      />
      <section className="border-b border-border bg-slate-900 text-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">AI Types</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Browse by AI type</h1>
          <p className="text-white/60 text-base max-w-xl leading-relaxed">
            Not all AI tools work the same — or cost the same. Find the cheapest viable option for your specific use case.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_CATEGORIES.map((cat) => {
              const colorClass = COLOR_MAP[cat.color ?? "slate"] ?? COLOR_MAP["slate"];
              const isLive = aiTypesData.some((d) => d.slug === cat.slug);
              return (
                <div key={cat.slug}>
                  {isLive ? (
                    <Link
                      href={`/ai-types/${cat.slug}`}
                      onClick={() => track("card_clicked", { sourceSurface: "ai_types_index", slug: cat.slug })}
                      className="group block border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-sm transition-all bg-white"
                    >
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl border mb-4 ${colorClass}`}>
                        {cat.icon}
                      </div>
                      <h2 className="font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors">{cat.title}</h2>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{cat.tagline}</p>
                      <span className="text-xs text-primary font-medium">Explore category →</span>
                    </Link>
                  ) : (
                    <div className="border border-border/50 rounded-2xl p-6 bg-muted/20 opacity-60">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl border mb-4 ${colorClass}`}>
                        {cat.icon}
                      </div>
                      <h2 className="font-bold text-muted-foreground mb-1.5">{cat.title}</h2>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{cat.tagline}</p>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Coming soon</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-slate-50 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-foreground mb-1">Not sure where to start?</h2>
            <p className="text-sm text-muted-foreground">Answer 5 questions and get personalised model recommendations.</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/decision-engine"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "ai_types_index", variant: "decision_engine" })}
              className="inline-flex items-center gap-2 bg-foreground text-background font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-foreground/80 transition-colors"
            >
              Find my cheapest stack →
            </Link>
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 border border-border text-muted-foreground hover:text-foreground font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              Open calculator
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-2 pb-12">
        <InternalLinks
          links={[
            { href: "/best", text: "Best AI Tools" },
            { href: "/calculator", text: "AI Cost Calculator" },
            { href: "/decision-engine", text: "Decision Engine" },
            { href: "/compare", text: "Compare Models" },
            { href: "/guides", text: "Cost Guides" },
            { href: "/best/best-ai-under-20-per-month", text: "Best AI Under $20/month" },
          ]}
          heading="Explore more"
        />
      </section>
    </div>
  );
}
