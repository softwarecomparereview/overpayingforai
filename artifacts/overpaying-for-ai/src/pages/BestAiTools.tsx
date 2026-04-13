import { Link } from "wouter";
import { PageSeo } from "@/components/seo/PageSeo";
import { InternalLinks } from "@/components/seo/InternalLinks";
import { SeoContentBlock } from "@/components/seo/SeoContentBlock";
import { CTABlock } from "@/components/monetization/CTABlock";
import { trackGaEvent } from "@/utils/ga4";
import bestOfData from "@/data/best-of.json";
import aiTypesData from "@/data/aiTypes.json";

const PILLAR_LINKS = [
  { href: "/calculator", text: "AI Cost Calculator" },
  { href: "/decision-engine", text: "Decision Engine" },
  { href: "/ai-types/coding-ai", text: "Best AI for Coding" },
  { href: "/ai-types/writing-ai", text: "Best AI for Writing" },
  { href: "/ai-types/research-ai", text: "Best AI for Research" },
  { href: "/compare/gpt-4o-vs-gpt-4o-mini-cost", text: "GPT-4o vs GPT-4o mini" },
  { href: "/compare/claude-vs-gpt-cost", text: "Claude vs GPT-4o" },
  { href: "/compare/deepseek-vs-gpt4o-cost", text: "DeepSeek vs GPT-4o" },
  { href: "/best/best-ai-under-20-per-month", text: "Best AI Under $20/month" },
  { href: "/best/best-ai-for-coding-on-a-budget", text: "Best AI for Coding on a Budget" },
  { href: "/best/best-free-ai-tools-for-builders", text: "Free AI Tools for Builders" },
  { href: "/guides/how-to-reduce-ai-cost", text: "How to Reduce AI Cost" },
];

const CHEAPEST_MODELS = [
  {
    name: "DeepSeek V3",
    provider: "DeepSeek",
    cost: "~$0.27/1M input tokens",
    bestFor: "Coding, writing, general reasoning",
    badge: "Cheapest API",
    href: "/compare/deepseek-vs-gpt4o-cost",
  },
  {
    name: "Gemini 1.5 Flash",
    provider: "Google",
    cost: "~$0.075/1M input tokens",
    bestFor: "Fast summaries, classification, light tasks",
    badge: "Speed + Value",
    href: "/ai-types/research-ai",
  },
  {
    name: "Claude Haiku 3",
    provider: "Anthropic",
    cost: "~$0.25/1M input tokens",
    bestFor: "Structured output, customer support",
    badge: "Best for structure",
    href: "/compare/claude-haiku-vs-gpt4o-mini",
  },
  {
    name: "GPT-4o mini",
    provider: "OpenAI",
    cost: "~$0.15/1M input tokens",
    bestFor: "General chat, simple code, extraction",
    badge: "OpenAI's budget pick",
    href: "/compare/gpt-4o-vs-gpt-4o-mini-cost",
  },
];

const STARTING_POINT_LINKS = [
  { href: "/calculator", title: "AI cost calculator", description: "Get a personalized answer based on your usage and budget." },
  { href: "/compare", title: "Top comparison pages", description: "Jump into the largest pricing gaps and quickest savings wins." },
  { href: "/ai-types", title: "Best pages by AI type", description: "Choose by use case and avoid paying for unnecessary model quality." },
];

export function BestAiTools() {
  return (
    <div className="bg-white">
      <PageSeo
        title="Best AI Tools 2025: Cheapest Models Compared | OverpayingForAI"
        description="The definitive guide to the best AI tools in 2025. Compare pricing, quality, and use cases across OpenAI, Anthropic, Google, DeepSeek, and more — and stop overpaying."
        canonicalUrl="/best"
      />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-slate-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Best of 2025</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 leading-tight">
            The best AI tools — without the overpaying
          </h1>
          <p className="text-white/65 text-base max-w-2xl leading-relaxed mb-8">
            There are hundreds of AI tools available in 2025. Most people are using the wrong one for their
            budget. This guide covers the best AI tools by category, use case, and price — backed by real
            token-cost data, not marketing claims.
          </p>
          <p className="text-white/80 text-sm mb-6">
            Start here if you want the fastest path to a cheaper AI stack.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/calculator"
              onClick={() => trackGaEvent("best_cta_calculator_click")}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
            >
              Calculate my AI cost →
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 text-white/80 text-sm font-medium hover:underline"
            >
              Explore top comparisons →
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-foreground mb-3">Best starting points</h2>
          <p className="text-sm text-muted-foreground mb-6">Use one of these paths to reduce AI spend quickly.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {STARTING_POINT_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className="border border-border rounded-xl p-5 bg-slate-50 hover:border-primary/40 transition-colors">
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </Link>
            ))}
          </div>
          <div className="border border-primary/20 bg-primary/5 rounded-xl p-4">
            <p className="text-sm font-medium text-foreground">
              Need a personalized answer?{" "}
              <Link href="/calculator" onClick={() => trackGaEvent("best_cta_calculator_click")} className="text-primary hover:underline">
                Use the calculator →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── OVERVIEW ─────────────────────────────────────────────── */}
      <section className="border-b border-border py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Overview</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-5">What makes an AI tool "best"?</h2>
            <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p>
                The answer depends entirely on your use case. A solo developer using AI for code completion has
                wildly different needs — and a wildly different optimal budget — compared to a content team
                generating 100,000 words a month, or a startup building an AI-powered product that calls an
                API millions of times per day.
              </p>
              <p>
                Most "best AI tools" lists rank by popularity or brand name. We rank by <strong className="text-foreground">cost efficiency</strong>:
                which tool delivers the quality you need at the lowest verifiable price. All pricing on this
                site is sourced from official provider pages and reviewed regularly.
              </p>
              <p>
                The main factors we evaluate are: <strong className="text-foreground">token pricing</strong> (input and output cost per
                million tokens for API users), <strong className="text-foreground">subscription value</strong> (what you actually get
                for flat-rate plans), <strong className="text-foreground">task fit</strong> (does this model actually perform well at
                your specific workload?), and <strong className="text-foreground">free tier availability</strong> (can you validate
                before you spend?).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CHEAPEST AI MODELS ────────────────────────────────────── */}
      <section className="border-b border-border bg-slate-50 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Price leaders</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">The cheapest capable AI models in 2025</h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            These models deliver strong results at a fraction of the cost of flagship models like GPT-4o or
            Claude 3.5 Sonnet. For most everyday tasks, the quality gap is negligible — but the price gap is huge.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {CHEAPEST_MODELS.map((m) => (
              <Link
                key={m.name}
                href={m.href}
                className="group block border border-border bg-white rounded-xl p-5 hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <span className="inline-block text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded mb-3">
                  {m.badge}
                </span>
                <h3 className="font-bold text-foreground mb-0.5 group-hover:text-primary transition-colors">{m.name}</h3>
                <p className="text-xs text-muted-foreground mb-1">{m.provider}</p>
                <p className="text-sm font-mono font-semibold text-emerald-700 mb-2">{m.cost}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{m.bestFor}</p>
                <p className="text-xs text-primary font-medium mt-3">See comparison →</p>
              </Link>
            ))}
          </div>
          <div className="border border-amber-200 bg-amber-50 rounded-xl p-5">
            <p className="text-sm text-amber-900 leading-relaxed">
              <strong>Key insight:</strong> Most users who default to GPT-4o or Claude 3.5 Sonnet are spending
              5–15× more than they need to. For content generation, code explanation, summarisation, and chat,
              the cheaper models above produce near-identical results. Use our{" "}
              <Link href="/calculator" className="font-semibold underline">cost calculator</Link>{" "}
              to see your exact savings.
            </p>
          </div>
        </div>
      </section>

      {/* ── BY CATEGORY ──────────────────────────────────────────── */}
      <section className="border-b border-border py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">By category</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Best AI tools by use case</h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            Different tasks have fundamentally different cost profiles. Here's how to pick the right tool
            for each major use case — and what to avoid.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(aiTypesData as { slug: string; title: string; icon: string; tagline: string }[]).map((cat) => (
              <Link
                key={cat.slug}
                href={`/ai-types/${cat.slug}`}
                className="group block border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-sm transition-all bg-white"
              >
                <span className="text-2xl block mb-3">{cat.icon}</span>
                <h3 className="font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors text-sm">
                  {cat.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{cat.tagline}</p>
                <span className="text-xs text-primary font-medium">See best {cat.title.toLowerCase()} tools →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEST-OF LISTS ─────────────────────────────────────────── */}
      <section className="border-b border-border bg-slate-50 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Curated lists</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Ranked picks for every budget</h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            These lists are updated regularly as pricing changes. Each pick is ranked by cost-efficiency
            for its specific use case — not by affiliate commission.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {(bestOfData as { slug: string; title: string; description: string; category: string }[]).map((b) => (
              <Link
                key={b.slug}
                href={`/best/${b.slug}`}
                className="block border border-border bg-white rounded-lg p-5 hover:border-primary/40 hover:bg-muted/10 transition-colors"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded mb-3 inline-block">
                  {b.category}
                </span>
                <h3 className="font-semibold text-foreground mb-2 text-sm">{b.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{b.description}</p>
                <p className="text-xs text-primary font-medium mt-3">See full list →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW TO CHOOSE ─────────────────────────────────────────── */}
      <section className="border-b border-border py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Buying guide</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-5">How to choose the right AI tool</h2>
            <div className="space-y-5">
              <div className="flex gap-4 border border-border rounded-xl p-5 bg-white">
                <span className="text-emerald-600 font-bold text-lg shrink-0">1.</span>
                <div>
                  <h3 className="font-bold text-foreground text-sm mb-1.5">Define your primary task</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Are you generating text, writing code, doing research, or building a product? Each task
                    has a different quality threshold — and a different optimal price point. Don't pay for
                    GPT-4o quality when GPT-4o mini quality is sufficient.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 border border-border rounded-xl p-5 bg-white">
                <span className="text-emerald-600 font-bold text-lg shrink-0">2.</span>
                <div>
                  <h3 className="font-bold text-foreground text-sm mb-1.5">Estimate your monthly volume</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    For API users: estimate your monthly token usage (input + output). For subscription
                    users: think about how frequently you use the tool. Low-volume users usually pay less
                    with a subscription; high-volume users almost always save with API pricing. Use our
                    {" "}<Link href="/calculator" className="text-primary font-medium hover:underline">calculator</Link>{" "}
                    to run the numbers.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 border border-border rounded-xl p-5 bg-white">
                <span className="text-emerald-600 font-bold text-lg shrink-0">3.</span>
                <div>
                  <h3 className="font-bold text-foreground text-sm mb-1.5">Start with the cheapest viable model</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The right strategy is to start cheap and upgrade only if quality falls short. Most
                    teams default to premium models out of habit, not necessity. Try DeepSeek V3,
                    Gemini Flash, or Claude Haiku first — you may find they're all you need.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 border border-border rounded-xl p-5 bg-white">
                <span className="text-emerald-600 font-bold text-lg shrink-0">4.</span>
                <div>
                  <h3 className="font-bold text-foreground text-sm mb-1.5">Re-evaluate quarterly</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    AI pricing moves fast. GPT-4o dropped 50% in price in early 2025. Models that were
                    expensive six months ago may now be among the cheapest. Follow this site's{" "}
                    <Link href="/changelog" className="text-primary font-medium hover:underline">pricing changelog</Link>{" "}
                    or check back regularly to catch price drops.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI SUBSCRIPTION vs API ───────────────────────────────── */}
      <section className="border-b border-border bg-slate-50 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Pricing model</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-5">
              Subscription vs API: which is cheaper for you?
            </h2>
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
              <div className="border border-border bg-white rounded-xl p-5">
                <h3 className="font-bold text-foreground mb-3">Subscription plans</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2"><span className="text-emerald-600 shrink-0">✓</span> Predictable monthly cost</li>
                  <li className="flex gap-2"><span className="text-emerald-600 shrink-0">✓</span> Access to consumer UX (ChatGPT, Claude.ai)</li>
                  <li className="flex gap-2"><span className="text-emerald-600 shrink-0">✓</span> Good for casual or daily personal use</li>
                  <li className="flex gap-2"><span className="text-red-500 shrink-0">✗</span> Rate-limited — may not suit heavy use</li>
                  <li className="flex gap-2"><span className="text-red-500 shrink-0">✗</span> Often expensive at scale vs API</li>
                </ul>
              </div>
              <div className="border border-border bg-white rounded-xl p-5">
                <h3 className="font-bold text-foreground mb-3">API / token pricing</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2"><span className="text-emerald-600 shrink-0">✓</span> Pay only for what you use</li>
                  <li className="flex gap-2"><span className="text-emerald-600 shrink-0">✓</span> Scales with workload</li>
                  <li className="flex gap-2"><span className="text-emerald-600 shrink-0">✓</span> Access to cheaper/faster models</li>
                  <li className="flex gap-2"><span className="text-red-500 shrink-0">✗</span> Requires technical setup</li>
                  <li className="flex gap-2"><span className="text-red-500 shrink-0">✗</span> Variable cost can surprise at high volume</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Rule of thumb: if you spend more than 3–4 hours per week on AI tasks, the API is almost certainly
              cheaper than a subscription — even after accounting for the learning curve. Run your numbers in the{" "}
              <Link href="/calculator" className="text-primary font-medium hover:underline">calculator</Link>{" "}
              to confirm.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-14 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <CTABlock
            toolId="deepseek"
            toolName="DeepSeek V3"
            headline="Start with the cheapest capable model"
            savingsText="DeepSeek V3 is often 10× cheaper than GPT-4o for writing, coding, and general reasoning tasks."
            variant="primary"
            trackingContext={{ pageType: "best-pillar", sourceComponent: "BestAiTools/CTABlock" }}
          />
        </div>
      </section>

      <SeoContentBlock
        audience="Developers, content teams, startups, and anyone using AI tools who suspects they're paying too much. This guide is especially useful if you're choosing between ChatGPT Plus, Claude Pro, Gemini Advanced, or direct API access."
        notFor="Enterprise buyers requiring SSO, compliance certifications, or dedicated support SLAs should evaluate vendor contracts directly. This guide focuses on self-serve pricing for individuals and small teams."
        pricingInsight="The AI pricing landscape shifted dramatically in 2024–2025. GPT-4o dropped 50% in price, DeepSeek released models at a fraction of Western AI pricing, and Google's Gemini Flash became the fastest cheap option. The result: many users are paying for premium models they no longer need."
        alternatives="If none of the models here suit your needs, also consider: Mistral (strong for European data compliance), Llama 3.3 via Groq (fast and cheap open-source), or Perplexity for search-augmented tasks. Use the decision engine to get a personalised recommendation."
        verdict="The best AI tool in 2025 is the cheapest one that meets your quality bar. Most users can save 50–80% by switching from a default flagship model to a smarter, cheaper alternative — without any noticeable quality drop. Start with the calculator, then check the category pages."
      />

      <section className="py-12 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <InternalLinks links={PILLAR_LINKS} heading="Explore more" maxLinks={12} />
        </div>
      </section>
    </div>
  );
}
