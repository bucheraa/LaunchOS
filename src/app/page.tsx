import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Zap,
  ArrowRight,
  Sparkles,
  BarChart3,
  FileText,
  ImageIcon,
  FlaskConical,
  CheckCircle2,
  Star,
} from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI App Analysis",
    description:
      "Paste your app description and let AI extract audience segments, value propositions, and messaging angles in seconds.",
  },
  {
    icon: FileText,
    title: "Store Copy Generator",
    description:
      "Generate optimized iOS and Android store listings — multiple variants per audience, in English and German.",
  },
  {
    icon: ImageIcon,
    title: "Screenshot Planner",
    description:
      "Get a structured screenshot sequence plan with headlines, feature focus, and conversion goals for each screen.",
  },
  {
    icon: FlaskConical,
    title: "Experiment Planner",
    description:
      "AI suggests high-impact A/B tests with clear hypotheses, target metrics, and expected outcomes.",
  },
  {
    icon: BarChart3,
    title: "Recommendations",
    description:
      "Prioritized, actionable to-do list of improvements for your app store presence — updated as you add data.",
  },
  {
    icon: CheckCircle2,
    title: "Integration Ready",
    description:
      "Pre-built connector layer for App Store Connect, Google Play, RevenueCat, and Stripe.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "LaunchOS cut our store copy writing time from 2 days to 2 hours. The AI understands ASO better than most consultants.",
    author: "Marcus K.",
    role: "Head of Growth, Fintech Startup",
  },
  {
    quote:
      "The experiment planner alone is worth it. We've run 12 A/B tests in 6 weeks and improved our CVR by 31%.",
    author: "Sarah M.",
    role: "ASO Lead, Gaming Studio",
  },
  {
    quote:
      "Finally a tool that thinks about mobile app marketing holistically. From analysis to execution in one workspace.",
    author: "Tom B.",
    role: "Indie Developer",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">LaunchOS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">
                Get started <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="container py-24 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              AI-powered mobile app launch platform
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Launch your app{" "}
              <span className="text-primary">smarter</span>, not harder
            </h1>
            <p className="mb-8 text-lg text-muted-foreground max-w-2xl mx-auto">
              LaunchOS uses AI to transform your app description into optimized store
              listings, screenshot plans, A/B test strategies, and actionable growth
              recommendations — all in one workspace.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Start free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">View demo</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No credit card required · Free plan available
            </p>
          </div>
        </section>

        {/* Social proof bar */}
        <section className="border-y bg-muted/30">
          <div className="container py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>iOS & Android</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Multi-locale (EN + DE)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>GPT-4o powered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>ASO best practices built-in</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>App Store Connect ready</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container py-24">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              Everything you need to launch
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From analysis to execution — LaunchOS covers the full launch workflow for
              mobile apps on iOS and Android.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border bg-card p-6 space-y-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-y bg-muted/20 py-20">
          <div className="container">
            <h2 className="mb-12 text-center text-2xl font-bold tracking-tight">
              Trusted by mobile teams
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <div key={t.author} className="rounded-xl border bg-card p-6 space-y-4">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className="text-sm font-semibold">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="container py-24">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Simple pricing</h2>
            <p className="text-muted-foreground">Start free, scale as you grow.</p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {[
              {
                name: "Free",
                price: "€0",
                period: "/month",
                features: ["3 projects", "5 AI analyses", "Basic store copy", "Community support"],
                cta: "Get started",
                highlighted: false,
              },
              {
                name: "Starter",
                price: "€49",
                period: "/month",
                features: [
                  "10 projects",
                  "50 AI analyses",
                  "All store copy features",
                  "Screenshot planner",
                  "Experiment planner",
                  "Email support",
                ],
                cta: "Start free trial",
                highlighted: true,
              },
              {
                name: "Growth",
                price: "€149",
                period: "/month",
                features: [
                  "Unlimited projects",
                  "Unlimited AI usage",
                  "All integrations",
                  "Custom locales",
                  "Priority support",
                  "API access",
                ],
                cta: "Contact sales",
                highlighted: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-6 ${
                  plan.highlighted
                    ? "border-primary bg-primary/5 shadow-md"
                    : "bg-card"
                }`}
              >
                {plan.highlighted && (
                  <div className="mb-3 inline-block rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                    Most popular
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                </div>
                <ul className="mb-6 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  asChild
                >
                  <Link href="/signup">{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t">
          <div className="container py-24 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Ready to launch smarter?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Join hundreds of mobile teams using LaunchOS to ship better app store
              listings and grow organic installs.
            </p>
            <Button size="lg" asChild>
              <Link href="/signup">
                Create free account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary">
              <Zap className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-medium text-foreground">LaunchOS</span>
          </div>
          <p>© {new Date().getFullYear()} LaunchOS. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <Link href="#" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
