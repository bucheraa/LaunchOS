import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isDemoMode } from "@/lib/demo/mode";
import {
  Zap, ArrowRight, Sparkles, BarChart3, FileText, ImageIcon,
  FlaskConical, CheckCircle2, Star, Clock, TrendingUp, Target,
  Search, Users, Rocket, ChevronRight, Play,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Describe your app",
    description: "Paste your app description (or App Store URL). That's all we need to get started.",
    icon: FileText,
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-500/10",
    iconColor: "text-violet-500",
  },
  {
    step: "02",
    title: "AI does the heavy lifting",
    description: "Within 30 seconds, LaunchOS generates audience personas, store copy variants, keyword lists, screenshot plans, A/B experiments and prioritised recommendations.",
    icon: Sparkles,
    color: "from-blue-500 to-cyan-600",
    bg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    step: "03",
    title: "Launch & iterate",
    description: "Push store copy directly to App Store Connect or Google Play. Track experiments, act on recommendations, and watch your CVR climb.",
    icon: Rocket,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
];

const BEFORE_AFTER = [
  { before: "2 days writing store copy", after: "2 minutes with AI generation" },
  { before: "Guessing which keywords work", after: "Data-backed keyword research" },
  { before: "No structured A/B strategy", after: "AI-generated experiment roadmap" },
  { before: "Screenshots without a plan", after: "Conversion-optimised screen sequence" },
  { before: "Scattered notes and spreadsheets", after: "One workspace for everything" },
  { before: "Slow manual store updates", after: "One-click push to App Store / Play" },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Product Analysis",
    outcome: "Know exactly who your users are",
    description: "Extract audience personas, value propositions, messaging angles, and key differentiators — in 30 seconds.",
    tag: "Saves ~4h",
    tagColor: "bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
  },
  {
    icon: Search,
    title: "Keyword Research",
    outcome: "Rank for the right keywords",
    description: "AI-suggested keywords enriched with real App Store autocomplete data. Colour-coded difficulty scores.",
    tag: "More organic installs",
    tagColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  },
  {
    icon: FileText,
    title: "Store Copy Generator",
    outcome: "Ship listings that convert",
    description: "Multiple variants per audience segment, for iOS and Android, in English and German. With character-count bars.",
    tag: "Saves ~2 days",
    tagColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  },
  {
    icon: ImageIcon,
    title: "Screenshot Planner",
    outcome: "Screenshots that sell",
    description: "Structured screen sequences with headlines, conversion goals and AI-rendered mockups — ready to upload.",
    tag: "Avg. +18% CVR",
    tagColor: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  },
  {
    icon: FlaskConical,
    title: "A/B Experiment Planner",
    outcome: "Never run a blind test again",
    description: "AI hypotheses with target metrics and expected uplifts. Track results with the built-in uplift calculator.",
    tag: "Avg. +31% CVR",
    tagColor: "bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400",
  },
  {
    icon: Users,
    title: "Competitor Intelligence",
    outcome: "Know what the competition is doing",
    description: "Automatically scrape competitor listings from the App Store and Google Play. Extract keywords, ratings, and insights.",
    tag: "Always-on intel",
    tagColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  },
  {
    icon: BarChart3,
    title: "Prioritised Recommendations",
    outcome: "Never miss a growth opportunity",
    description: "AI generates a living to-do list of improvements sorted by impact and effort. Work through them like a checklist.",
    tag: "Actionable instantly",
    tagColor: "bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400",
  },
  {
    icon: CheckCircle2,
    title: "One-Click Store Push",
    outcome: "Ship in seconds, not hours",
    description: "Integrated with App Store Connect and Google Play. Push optimised listings directly — no copy-pasting.",
    tag: "Saves ~1h per update",
    tagColor: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400",
  },
];

const METRICS = [
  { value: "30s", label: "to generate a full store listing", icon: Clock },
  { value: "+31%", label: "average CVR uplift reported", icon: TrendingUp },
  { value: "8×", label: "more A/B tests shipped per month", icon: FlaskConical },
  { value: "2h", label: "saved per app update on average", icon: Target },
];

const TESTIMONIALS = [
  {
    quote: "LaunchOS cut our store copy writing time from 2 days to 2 hours. The AI understands ASO better than most consultants we've worked with.",
    author: "Marcus K.",
    role: "Head of Growth, Fintech Startup",
    stars: 5,
  },
  {
    quote: "The experiment planner alone is worth it. We've run 12 A/B tests in 6 weeks and improved our CVR by 31%. It just tells you what to test next.",
    author: "Sarah M.",
    role: "ASO Lead, Gaming Studio",
    stars: 5,
  },
  {
    quote: "Finally a tool that thinks about mobile marketing holistically. From analysis to execution in one workspace. The recommendations tab is gold.",
    author: "Tom B.",
    role: "Indie Developer",
    stars: 5,
  },
];

const PLANS = [
  {
    name: "Free",
    price: "€0",
    period: "/month",
    desc: "Perfect to try it out",
    features: [
      "3 projects",
      "5 AI analyses / month",
      "Basic store copy generation",
      "Community support",
    ],
    cta: "Get started free",
    highlighted: false,
    ctaVariant: "outline" as const,
  },
  {
    name: "Starter",
    price: "€49",
    period: "/month",
    desc: "For solo founders & small teams",
    badge: "Most popular",
    features: [
      "10 projects",
      "50 AI analyses / month",
      "All store copy features",
      "Keyword research",
      "Screenshot planner + mockups",
      "A/B experiment planner",
      "Competitor analysis",
      "App Store Connect integration",
    ],
    cta: "Start 14-day free trial",
    highlighted: true,
    ctaVariant: "default" as const,
  },
  {
    name: "Growth",
    price: "€149",
    period: "/month",
    desc: "For scaling teams & agencies",
    features: [
      "Unlimited projects",
      "Unlimited AI usage",
      "All integrations (Apple, Google, RevenueCat)",
      "Custom locales",
      "Team members",
      "Priority support",
      "API access",
    ],
    cta: "Contact sales",
    highlighted: false,
    ctaVariant: "outline" as const,
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const authHref = isDemoMode ? "/dashboard" : "/login";
  const ctaHref  = isDemoMode ? "/dashboard" : "/signup";

  return (
    <div className="flex min-h-screen flex-col bg-background">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 shadow-sm">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">LaunchOS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it works</Link>
            <Link href="#features"     className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#pricing"      className="hover:text-foreground transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={authHref}>Log in</Link>
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 border-0" asChild>
              <Link href={ctaHref}>
                Try for free <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          {/* Gradient backdrop */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-violet-50 via-background to-background dark:from-violet-950/20 dark:via-background" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[500px] rounded-full bg-violet-400/10 blur-3xl" />

          <div className="container py-24 text-center">
            <div className="mx-auto max-w-3xl">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 px-4 py-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
                <Sparkles className="h-3 w-3" />
                AI-powered ASO & app launch platform
              </div>

              {/* Headline */}
              <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
                Go from app idea to{" "}
                <span className="bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
                  #1 ranked listing
                </span>
                {" "}in hours
              </h1>

              {/* Subheadline */}
              <p className="mb-8 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                LaunchOS automates every step of your App Store launch — from AI product analysis and keyword research, to store copy, screenshot plans, A/B experiments and actionable recommendations. All in one workspace.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <Button size="lg" className="h-12 px-6 bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 border-0 text-base" asChild>
                  <Link href={ctaHref}>
                    <Rocket className="mr-2 h-4 w-4" />
                    Start free — no card needed
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-6 text-base gap-2" asChild>
                  <Link href={authHref}>
                    <Play className="h-4 w-4" />
                    View live demo
                  </Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Free plan available · Setup in under 2 minutes</p>
            </div>
          </div>
        </section>

        {/* ── Metrics bar ── */}
        <section className="border-y bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-indigo-500/5">
          <div className="container py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {METRICS.map((m) => (
              <div key={m.label} className="flex flex-col items-center text-center gap-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 mb-1">
                  <m.icon className="h-5 w-5 text-violet-500" />
                </div>
                <p className="text-2xl font-extrabold bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">{m.value}</p>
                <p className="text-xs text-muted-foreground leading-snug">{m.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" className="container py-24">
          <div className="mb-14 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-3">How it works</p>
            <h2 className="text-3xl font-bold tracking-tight mb-3">Launch in 3 steps</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              No learning curve. LaunchOS turns your app description into a complete launch kit automatically.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-[52px] left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-0.5 bg-gradient-to-r from-violet-500/30 via-blue-500/30 to-emerald-500/30" />
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="relative flex flex-col items-center text-center p-8 rounded-2xl border bg-card hover:shadow-md transition-shadow">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border-2 border-background bg-muted px-2.5 py-0.5 text-[10px] font-black text-muted-foreground">
                  {step.step}
                </div>
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg`}>
                  <step.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-base mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Before / After ── */}
        <section className="border-y bg-muted/20 py-20">
          <div className="container">
            <div className="mb-12 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-3">The old way vs LaunchOS</p>
              <h2 className="text-3xl font-bold tracking-tight">Stop doing this manually</h2>
            </div>
            <div className="mx-auto max-w-3xl grid gap-3">
              {BEFORE_AFTER.map(({ before, after }) => (
                <div key={before} className="grid grid-cols-2 gap-3 items-stretch">
                  <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 text-red-500 text-xs font-bold">✕</span>
                    <p className="text-sm text-muted-foreground">{before}</p>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/10 px-4 py-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500 text-xs font-bold">✓</span>
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">{after}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="container py-24">
          <div className="mb-14 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-3">Features</p>
            <h2 className="text-3xl font-bold tracking-tight mb-3">Everything in one place</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              LaunchOS covers the full ASO and app launch workflow. No more jumping between tools.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="group rounded-2xl border bg-card p-5 space-y-3 hover:shadow-md hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${f.tagColor.replace("text-", "bg-").replace(" dark:bg-", " dark:bg-").split(" ")[0]}/10`}>
                    <f.icon className={`h-5 w-5 ${f.iconColor ?? "text-violet-500"}`} />
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${f.tagColor}`}>
                    {f.tag}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-0.5">{f.title}</p>
                  <h3 className="font-bold text-sm leading-snug">{f.outcome}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="border-y bg-gradient-to-r from-violet-500/5 via-background to-background py-20">
          <div className="container">
            <div className="mb-12 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-3">Testimonials</p>
              <h2 className="text-3xl font-bold tracking-tight">Loved by mobile teams</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <div key={t.author} className="rounded-2xl border bg-card p-6 space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-2 border-t">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500 text-white font-bold text-sm shrink-0">
                      {t.author.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.author}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="container py-24">
          <div className="mb-14 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-3">Pricing</p>
            <h2 className="text-3xl font-bold tracking-tight mb-3">Simple, transparent pricing</h2>
            <p className="text-muted-foreground">Start free. No credit card required.</p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 flex flex-col ${
                  plan.highlighted
                    ? "border-violet-400 dark:border-violet-600 bg-gradient-to-b from-violet-500/5 to-background shadow-xl shadow-violet-500/10 relative"
                    : "bg-card"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="font-bold text-base">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{plan.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                </div>
                <ul className="mb-6 space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${plan.highlighted ? "text-violet-500" : "text-emerald-500"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${plan.highlighted ? "bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 border-0 text-white" : ""}`}
                  variant={plan.ctaVariant}
                  asChild
                >
                  <Link href={ctaHref}>
                    {plan.cta} {plan.highlighted && <ArrowRight className="ml-1.5 h-3.5 w-3.5" />}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">All plans include a 14-day free trial · Cancel anytime · GDPR compliant</p>
        </section>

        {/* ── Final CTA ── */}
        <section className="border-t">
          <div className="container py-24">
            <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-12 text-center text-white shadow-2xl shadow-violet-500/20 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)" }} />
              <div className="relative">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                    <Rocket className="h-7 w-7 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight mb-3">
                  Ready to dominate the charts?
                </h2>
                <p className="text-violet-200 mb-8 max-w-sm mx-auto leading-relaxed">
                  Join mobile teams who use LaunchOS to ship better listings, run smarter experiments, and grow organic installs — on autopilot.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button size="lg" className="h-12 bg-white text-violet-700 hover:bg-violet-50 border-0 font-bold" asChild>
                    <Link href={ctaHref}>
                      Start free today <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 border-white/30 text-white hover:bg-white/10" asChild>
                    <Link href={authHref}>View demo first</Link>
                  </Button>
                </div>
                <p className="mt-4 text-xs text-violet-300">No credit card · Free plan forever · 2-minute setup</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t">
        <div className="container py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-700">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="font-bold text-foreground text-sm">LaunchOS</span>
          </Link>
          <p>© {new Date().getFullYear()} LaunchOS. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
