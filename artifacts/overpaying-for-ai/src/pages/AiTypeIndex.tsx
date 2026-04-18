import { Link } from "wouter";
import { track } from "@/utils/analytics";
import aiTypesData from "@/data/aiTypes.json";
import { PageSeo } from "@/components/seo/PageSeo";
import { InternalLinks } from "@/components/seo/InternalLinks";
import { getPrimaryCta } from "@/utils/affiliateResolver";

const FEATURED_TOOLS: Array<{ providerId: string; label: string; note: string }> = [
  { providerId: "anthropic", label: "Claude", note: "Strongest default across writing, research & coding." },
  { providerId: "openai", label: "ChatGPT / OpenAI", note: "Best ecosystem; mini API is cheapest serious model." },
  { providerId: "deepseek", label: "DeepSeek V3", note: "~10× cheaper than GPT-4o for routine inference." },
  { providerId: "google", label: "Gemini", note: "Best free tier right now for chat & long context." },
];

const LIVE_CATEGORIES = aiTypesData;
const COMING_SOON_CATEGORIES = [
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

      <section className="border-b border-border bg-slate-900 text-white py-14 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1.3fr_0.9fr] gap-6 items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">AI Types</p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Browse by AI type</h1>
              <p className="text-white/60 text-base max-w-2xl leading-relaxed">
                Not all AI tools work the same — or cost the same. Find the cheapest viable option for your specific use case.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/15 text-white/70">{LIVE_CATEGORIES.length} live categories</span>
                <span className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/15 text-white/70">{COMING_SOON_CATEGORIES.length} coming soon</span>
                <span className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/15 text-white/70">Coding, writing, research, support</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Fastest ways to start</p>
              <div className="space-y-3">
                <Link
                  href="/calculator"
                  onClick={() => track("overpaying_cta_clicked", { sourceSurface: "ai_types_index", variant: "hero_calculator" })}
                  className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:border-white/20 hover:bg-white/10 transition-colors"
                >
                  <p className="text-sm font-semibold text-white">Open the calculator</p>
                  <p className="text-xs text-white/60 mt-1">Best when you already know your usage and want the cheapest model.</p>
                </Link>
                <Link
                  href="/decision-engine"
                  onClick={() => track("overpaying_cta_clicked", { sourceSurface: "ai_types_index", variant: "hero_decision_engine" })}
                  className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:border-white/20 hover:bg-white/10 transition-colors"
                >
                  <p className="text-sm font-semibold text-white">Use the decision engine</p>
                  <p className="text-xs text-white/60 mt-1">Best when you need a stack recommendation, not just a price check.</p>
                </Link>
                <Link
                  href="/resources"
                  onClick={() => track("card_clicked", { sourceSurface: "ai_types_index", cardType: "hero_resources", slug: "resources" })}
                  className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:border-white/20 hover:bg-white/10 transition-colors"
                >
                  <p className="text-sm font-semibold text-white">Browse all resources</p>
                  <p className="text-xs text-white/60 mt-1">Best when you want guides, comparisons, and best-of pages together.</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-slate-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Start here</p>
              <h2 className="font-bold text-foreground mb-2">Choose by real use case</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">Each category groups tools by the job to be done, not by hype or vendor marketing.</p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Best for</p>
              <h2 className="font-bold text-foreground mb-2">Quick budget-based discovery</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">Useful when you want the cheapest viable option for coding, writing, research, or support tasks.</p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">What to expect</p>
              <h2 className="font-bold text-foreground mb-2">6 live categories, 3 in the pipeline</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">Browse live categories now, and use the calculator or decision engine when you need a direct answer faster.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Recommended tools</p>
          <h2 className="text-2xl font-bold text-foreground mb-1">Tools that show up across most categories</h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-2xl">
            Four providers cover the cheapest viable answer for most AI workloads. Open the category page if you want a tighter shortlist.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FEATURED_TOOLS.map(({ providerId, label, note }) => {
              const cta = getPrimaryCta(providerId, "default");
              return (
                <a
                  key={providerId}
                  href={cta.href}
                  target={cta.target}
                  rel={cta.rel}
                  data-testid={`ai-types-hub-cta-${providerId}`}
                  onClick={() => track("overpaying_cta_clicked", { sourceSurface: "ai_types_index", variant: `featured_${providerId}` })}
                  className="block rounded-xl border border-border bg-white p-4 hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <p className="font-semibold text-foreground text-sm mb-1">{label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">{note}</p>
                  <span className="text-xs font-medium text-primary">{cta.label} →</span>
                </a>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Some links are sponsored. We only feature tools we'd recommend regardless.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Live now</p>
            <h2 className="text-2xl font-bold text-foreground">Explore active AI categories</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">Start with the category that matches your work, then use the calculator or decision engine when you need a more exact answer.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {LIVE_CATEGORIES.map((cat) => {
              const colorClass = COLOR_MAP[cat.color ?? "slate"] ?? COLOR_MAP.slate;
              return (
                <Link
                  key={cat.slug}
                  href={`/ai-types/${cat.slug}`}
                  onClick={() => track("card_clicked", { sourceSurface: "ai_types_index", slug: cat.slug })}
                  className="group block border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-sm transition-all bg-white"
                >
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl border mb-4 ${colorClass}`}>
                    {cat.icon}
                  </div>
                  <h2 className="font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors">{cat.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{cat.tagline}</p>
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/70">
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">Live category</span>
                    <span className="text-xs text-primary font-medium">Explore category →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-slate-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Coming soon</p>
            <h2 className="text-2xl font-bold text-foreground">More categories in progress</h2>
            <p className="text-sm text-muted-foreground mt-1">These are planned, but not fleshed out enough to be useful yet.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMING_SOON_CATEGORIES.map((cat) => {
              const colorClass = COLOR_MAP[cat.color ?? "slate"] ?? COLOR_MAP.slate;
              return (
                <div key={cat.slug} className="border border-border/50 rounded-2xl p-6 bg-white/70 opacity-75">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl border mb-4 ${colorClass}`}>
                    {cat.icon}
                  </div>
                  <h2 className="font-bold text-muted-foreground mb-1.5">{cat.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{cat.tagline}</p>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Coming soon</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-white py-10">
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
