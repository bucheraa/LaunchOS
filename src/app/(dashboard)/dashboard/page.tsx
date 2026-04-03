import { requireAuth, getWorkspace } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Folders, Plus, TrendingUp, FlaskConical, Lightbulb, ArrowRight,
  CheckCircle2, Zap, Target, BarChart3, Clock, Rocket, Sparkles,
  AlertTriangle, Search, FileText, ChevronRight, Timer, Brain,
  Trophy, Activity, Star, TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { timeAgo, categoryLabel, platformLabel } from "@/lib/utils";
import { isDemoMode } from "@/lib/demo/mode";
import { getDemoProjects } from "@/lib/demo/store";
import { cn } from "@/lib/utils";

const PLAN_LIMITS: Record<string, { projects: number; aiGenerations: number }> = {
  FREE:    { projects: 3,        aiGenerations: 50 },
  STARTER: { projects: 10,       aiGenerations: 500 },
  GROWTH:  { projects: Infinity, aiGenerations: Infinity },
};

function getAsoScore(project: { _count?: { listingVariants?: number; experiments?: number; recommendations?: number } }) {
  const variants = project._count?.listingVariants ?? 0;
  const exps     = project._count?.experiments     ?? 0;
  const openRecs = project._count?.recommendations ?? 0;
  return Math.max(10, Math.min(100, 30 + variants * 10 + exps * 15 - openRecs * 5));
}

function getAsoColor(score: number) {
  if (score >= 70) return { text: "text-emerald-500", bg: "bg-emerald-500", ring: "#10b981" };
  if (score >= 40) return { text: "text-amber-500",   bg: "bg-amber-500",   ring: "#f59e0b" };
  return              { text: "text-red-500",          bg: "bg-red-500",     ring: "#ef4444" };
}

function getHealthLabel(score: number) {
  if (score >= 70) return { label: "Launch Ready",    color: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" };
  if (score >= 40) return { label: "In Progress",     color: "text-amber-600 dark:text-amber-400",    dot: "bg-amber-500"   };
  return              { label: "Needs Attention",  color: "text-red-600 dark:text-red-400",        dot: "bg-red-500"     };
}

function getNextAction(projects: any[], stats: { totalProjects: number; openRecommendations: number }) {
  if (stats.totalProjects === 0) return {
    icon: Rocket, title: "Create your first project",
    description: "Add an app and let AI generate your entire launch kit in under 2 minutes.",
    href: "/projects/new", cta: "Create project",
    color: "from-violet-500/10 to-purple-500/10", border: "border-violet-200 dark:border-violet-800",
    iconBg: "bg-violet-500", iconColor: "text-white",
  };

  const noAnalysis = projects.find((p) => !p.analysis || p.analysis.analysisStatus !== "COMPLETED");
  if (noAnalysis) return {
    icon: Brain, title: `Run AI analysis on "${noAnalysis.name}"`,
    description: "Discover audience personas, value propositions and keyword opportunities in 30 seconds.",
    href: `/projects/${noAnalysis.id}?tab=analysis`, cta: "Analyse now →",
    color: "from-blue-500/10 to-cyan-500/10", border: "border-blue-200 dark:border-blue-800",
    iconBg: "bg-blue-500", iconColor: "text-white",
  };

  const noKeywords = projects.find((p) => (p._count?.keywordSets ?? 0) === 0);
  if (noKeywords) return {
    icon: Search, title: `Research keywords for "${noKeywords.name}"`,
    description: "Find high-volume, low-competition keywords to boost your organic ranking.",
    href: `/projects/${noKeywords.id}?tab=store-copy`, cta: "Research keywords →",
    color: "from-emerald-500/10 to-teal-500/10", border: "border-emerald-200 dark:border-emerald-800",
    iconBg: "bg-emerald-500", iconColor: "text-white",
  };

  const noCopy = projects.find((p) => (p._count?.listingVariants ?? 0) === 0);
  if (noCopy) return {
    icon: FileText, title: `Generate store copy for "${noCopy.name}"`,
    description: "Create optimised App Store and Google Play listings tailored to your audience.",
    href: `/projects/${noCopy.id}?tab=store-copy`, cta: "Generate copy →",
    color: "from-orange-500/10 to-amber-500/10", border: "border-orange-200 dark:border-orange-800",
    iconBg: "bg-orange-500", iconColor: "text-white",
  };

  if (stats.openRecommendations > 0) return {
    icon: AlertTriangle, title: `${stats.openRecommendations} AI recommendation${stats.openRecommendations !== 1 ? "s" : ""} waiting for you`,
    description: "Work through your prioritised growth actions to improve rankings and conversion.",
    href: "/projects", cta: "View actions →",
    color: "from-orange-500/10 to-amber-500/10", border: "border-orange-200 dark:border-orange-800",
    iconBg: "bg-orange-500", iconColor: "text-white",
  };

  return null;
}

export default async function DashboardPage() {
  const session = await requireAuth();
  const workspace = await getWorkspace(session.user.id!);
  if (!workspace) return null;

  const plan = workspace.plan ?? "FREE";

  const projects = isDemoMode
    ? getDemoProjects()
        .map((p) => ({
          ...p,
          recommendations: (p.recommendations ?? []).filter((r) => r.status === "OPEN").slice(0, 3),
        }))
        .slice(0, 10)
    : await db.project.findMany({
        where: { workspaceId: workspace.id },
        include: {
          analysis: { select: { analysisStatus: true } },
          _count: {
            select: {
              listingVariants: true,
              experiments: true,
              recommendations: true,
              keywordSets: true,
            },
          },
          recommendations: {
            where: { status: "OPEN" },
            orderBy: { priority: "desc" },
            take: 3,
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      });

  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE;

  const totalVariants    = projects.reduce((a, p) => a + (p._count?.listingVariants ?? 0), 0);
  const totalExperiments = projects.reduce((a, p) => a + (p._count?.experiments ?? 0), 0);
  const totalKeywords    = projects.reduce((a, p) => a + (p._count?.keywordSets ?? 0), 0);
  const totalAnalyses    = projects.filter((p) => p.analysis?.analysisStatus === "COMPLETED").length;
  const openRecs         = projects.reduce((a, p) => a + p.recommendations.length, 0);

  // Hours saved: listing ~2h, keyword set ~1h, experiment setup ~4h, analysis ~3h
  const hoursSaved = totalVariants * 2 + totalKeywords * 1 + totalExperiments * 4 + totalAnalyses * 3;

  const stats = {
    totalProjects:       projects.length,
    totalVariants,
    totalExperiments,
    openRecommendations: openRecs,
  };

  const allRecs = projects
    .flatMap((p) => p.recommendations.map((r) => ({ ...r, projectName: p.name, projectId: p.id })))
    .sort((a, b) => {
      const o = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return (o[a.priority as keyof typeof o] ?? 2) - (o[b.priority as keyof typeof o] ?? 2);
    })
    .slice(0, 5);

  // Portfolio-level ASO health
  const asoScores    = projects.map(getAsoScore);
  const avgAsoScore  = asoScores.length > 0 ? Math.round(asoScores.reduce((a, b) => a + b, 0) / asoScores.length) : 0;
  const launchReady  = asoScores.filter((s) => s >= 70).length;
  const needsWork    = asoScores.filter((s) => s < 40).length;

  const firstName  = session.user.name?.split(" ")[0] ?? "there";
  const nextAction = getNextAction(projects, stats);
  const hasActivity = totalVariants + totalExperiments + totalKeywords + totalAnalyses > 0;

  return (
    <div>
      <Header
        title={`Welcome back, ${firstName}`}
        subtitle="Your AI-powered App Store command center"
        actions={
          <Button size="sm" asChild className="h-8 bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 border-0">
            <Link href="/projects/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Project
            </Link>
          </Button>
        }
      />

      <div className="p-6 space-y-6">

        {/* ── AI Impact Panel ── */}
        {hasActivity ? (
          <div className="relative overflow-hidden rounded-2xl border border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-indigo-950/30 p-6">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-5" style={{ backgroundImage: "radial-gradient(circle at center, violet 0%, transparent 70%)" }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wide">LaunchOS AI has done this for you</p>
              </div>
              <p className="text-sm text-muted-foreground mb-5">Automating your App Store workflow so you can focus on building.</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    value: totalVariants,
                    label: "Store listings",
                    sublabel: "generated",
                    detail: `~${totalVariants * 2}h saved`,
                    icon: FileText,
                    color: "text-blue-500",
                    bg: "bg-blue-500/10",
                    border: "border-blue-200 dark:border-blue-800",
                  },
                  {
                    value: totalKeywords,
                    label: "Keyword sets",
                    sublabel: "researched",
                    detail: `${totalKeywords * 20}+ keywords`,
                    icon: Search,
                    color: "text-emerald-500",
                    bg: "bg-emerald-500/10",
                    border: "border-emerald-200 dark:border-emerald-800",
                  },
                  {
                    value: totalExperiments,
                    label: "A/B experiments",
                    sublabel: "designed",
                    detail: `~${totalExperiments * 4}h saved`,
                    icon: FlaskConical,
                    color: "text-violet-500",
                    bg: "bg-violet-500/10",
                    border: "border-violet-200 dark:border-violet-800",
                  },
                  {
                    value: hoursSaved,
                    label: "Hours saved",
                    sublabel: "estimated",
                    detail: "vs. manual work",
                    icon: Timer,
                    color: "text-orange-500",
                    bg: "bg-orange-500/10",
                    border: "border-orange-200 dark:border-orange-800",
                  },
                ].map((item) => (
                  <div key={item.label} className={`rounded-xl border ${item.border} bg-white/70 dark:bg-black/20 p-4`}>
                    <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${item.bg} mb-3`}>
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
                    <p className="text-xs font-semibold text-foreground">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">{item.sublabel} · {item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ── Get started hero (no activity yet) ── */
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 text-white shadow-lg">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)" }} />
            <div className="relative max-w-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 mb-4">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold mb-2">Ready for launch, {firstName}?</h2>
              <p className="text-violet-200 text-sm mb-6 leading-relaxed">
                LaunchOS will generate your store copy, research keywords, design A/B experiments and give you AI recommendations — all in one click.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="bg-white text-purple-700 hover:bg-white/90 font-semibold border-0">
                  <Link href="/projects/new">
                    <Plus className="mr-2 h-4 w-4" /> Create first project
                  </Link>
                </Button>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                {[
                  { value: "30s", label: "to generate store copy" },
                  { value: "+31%", label: "avg. CVR uplift" },
                  { value: "~8h", label: "saved per launch" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-white/10 py-3 px-2">
                    <p className="text-xl font-extrabold">{s.value}</p>
                    <p className="text-[11px] text-violet-200">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Smart next-action banner ── */}
        {nextAction && (
          <Link href={nextAction.href} className="group block">
            <div className={`flex items-center gap-4 rounded-2xl border bg-gradient-to-r ${nextAction.color} ${nextAction.border} p-4 hover:shadow-md transition-all`}>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${nextAction.iconBg}`}>
                <nextAction.icon className={`h-5 w-5 ${nextAction.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{nextAction.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{nextAction.description}</p>
              </div>
              <span className={`hidden sm:flex items-center gap-1 text-xs font-semibold shrink-0`}>
                {nextAction.cta} <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        )}

        {/* ── Main grid ── */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Project Health Overview */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardHeader className="py-4 px-5 border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-violet-500/10 p-1.5">
                      <Activity className="h-4 w-4 text-violet-500" />
                    </div>
                    <CardTitle className="text-sm font-semibold">Project Health</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                    <Link href="/projects">All projects <ArrowRight className="ml-1 h-3 w-3" /></Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {projects.length === 0 ? (
                  <EmptyState
                    icon={Folders}
                    title="No projects yet"
                    description="Create your first project to start tracking App Store health."
                    action={
                      <Button size="sm" asChild>
                        <Link href="/projects/new"><Plus className="mr-1.5 h-3.5 w-3.5" /> New Project</Link>
                      </Button>
                    }
                    className="border-0 rounded-none"
                  />
                ) : (
                  <div className="divide-y">
                    {projects.slice(0, 6).map((project) => {
                      const score  = getAsoScore(project);
                      const colors = getAsoColor(score);
                      const health = getHealthLabel(score);
                      const urgentRec = project.recommendations?.[0];
                      // Steps: analysis, keywords, copy, experiments
                      const steps = [
                        project.analysis?.analysisStatus === "COMPLETED",
                        (project._count?.keywordSets ?? 0) > 0,
                        (project._count?.listingVariants ?? 0) > 0,
                        (project._count?.experiments ?? 0) > 0,
                      ];
                      const stepsDone = steps.filter(Boolean).length;
                      return (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          className="group flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors"
                        >
                          {/* Avatar */}
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold text-sm shadow-sm">
                            {project.name.charAt(0)}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{project.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {/* Launch step dots */}
                              <div className="flex items-center gap-0.5">
                                {steps.map((done, i) => (
                                  <div key={i} className={cn("h-1.5 w-5 rounded-full", done ? "bg-emerald-500" : "bg-muted")} />
                                ))}
                              </div>
                              <span className="text-[10px] text-muted-foreground">{stepsDone}/4 steps</span>
                            </div>
                            {urgentRec && (
                              <p className="text-[10px] text-orange-600 dark:text-orange-400 mt-0.5 line-clamp-1 font-medium">
                                ⚡ {urgentRec.title}
                              </p>
                            )}
                          </div>

                          {/* ASO Score */}
                          <div className="flex flex-col items-center gap-0.5 shrink-0">
                            <div className={cn("text-lg font-black tabular-nums leading-none", colors.text)}>{score}</div>
                            <div className={cn("text-[9px] font-semibold uppercase tracking-wide", health.color)}>{health.label.split(" ")[0]}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-5">

            {/* Portfolio ASO Score */}
            {projects.length > 0 && (
              <Card className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">Portfolio Score</p>
                      <p className="text-3xl font-black tabular-nums leading-none" style={{ color: avgAsoScore >= 70 ? "#10b981" : avgAsoScore >= 40 ? "#f59e0b" : "#ef4444" }}>
                        {avgAsoScore}
                        <span className="text-sm font-medium text-muted-foreground">/100</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Average ASO health across {projects.length} app{projects.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-200 dark:border-violet-800">
                      <BarChart3 className="h-5 w-5 text-violet-500" />
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${avgAsoScore}%`,
                        background: avgAsoScore >= 70 ? "linear-gradient(to right, #10b981, #34d399)" : avgAsoScore >= 40 ? "linear-gradient(to right, #f59e0b, #fbbf24)" : "linear-gradient(to right, #ef4444, #f87171)"
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "Launch Ready", value: launchReady, color: "text-emerald-600 dark:text-emerald-400" },
                      { label: "In Progress",  value: projects.length - launchReady - needsWork, color: "text-amber-600 dark:text-amber-400" },
                      { label: "Needs Work",   value: needsWork,    color: "text-red-500" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg bg-muted/40 py-2">
                        <p className={cn("text-base font-black", s.color)}>{s.value}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Recommendations */}
            <Card className="overflow-hidden">
              <CardHeader className="py-3.5 px-5 border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-orange-500/10 p-1.5">
                      <Lightbulb className="h-4 w-4 text-orange-500" />
                    </div>
                    <CardTitle className="text-sm font-semibold">AI Recommendations</CardTitle>
                  </div>
                  {allRecs.length > 0 && (
                    <span className="rounded-full bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 text-[10px] font-bold text-orange-600 dark:text-orange-400">
                      {allRecs.length}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {allRecs.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 px-5 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 mb-1">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                    <p className="text-sm font-semibold">All clear!</p>
                    <p className="text-xs text-muted-foreground">Run AI recommendations inside a project to get prioritised growth actions.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {allRecs.map((rec) => {
                      const { dot, label } =
                        rec.priority === "CRITICAL" ? { dot: "bg-red-500",    label: "Critical" } :
                        rec.priority === "HIGH"     ? { dot: "bg-orange-500", label: "High" } :
                        rec.priority === "MEDIUM"   ? { dot: "bg-amber-500",  label: "Medium" } :
                                                      { dot: "bg-blue-400",   label: "Low" };
                      return (
                        <Link
                          key={rec.id}
                          href={`/projects/${rec.projectId}?tab=recommendations`}
                          className="flex items-start gap-3 px-5 py-3 hover:bg-muted/40 transition-colors group"
                        >
                          <div className={cn("mt-1.5 h-2 w-2 rounded-full shrink-0 ring-2 ring-offset-1", dot, "ring-offset-background", dot.replace("bg-", "ring-"))} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors">{rec.title}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{rec.projectName} · <span className="font-medium">{label}</span></p>
                          </div>
                        </Link>
                      );
                    })}
                    <div className="px-5 py-2.5 bg-muted/20">
                      <Link href="/projects" className="text-xs text-primary hover:underline flex items-center gap-1">
                        View all in projects <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick start / plan */}
            <Card className="overflow-hidden">
              <CardHeader className="py-3.5 px-5 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-violet-500/10 p-1.5">
                    <Zap className="h-4 w-4 text-violet-500" />
                  </div>
                  <CardTitle className="text-sm font-semibold">Quick Start</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-1.5">
                {[
                  { href: "/projects/new", icon: Plus,    bg: "bg-violet-500/10", color: "text-violet-600 dark:text-violet-400", title: "New Project",      desc: "AI generates full launch kit" },
                  { href: "/projects",     icon: Folders, bg: "bg-blue-500/10",   color: "text-blue-600 dark:text-blue-400",    title: "All Projects",     desc: "Portfolio & health scores" },
                  { href: "/settings",     icon: Zap,     bg: "bg-emerald-500/10",color: "text-emerald-600 dark:text-emerald-400",title: "Connect Stores", desc: "Apple & Google Play" },
                ].map((item) => (
                  <Link key={item.href + item.title} href={item.href} className="flex items-center gap-3 rounded-xl border p-2.5 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${item.bg} shrink-0`}>
                      <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Plan usage */}
            {limits.projects !== Infinity && (
              <div className="rounded-xl border border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs font-semibold">{plan} Plan</p>
                    <p className="text-[11px] text-muted-foreground">{projects.length} of {limits.projects} projects used</p>
                  </div>
                  <Button size="sm" variant="outline" asChild className="h-7 text-xs border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30">
                    <Link href="/settings">Upgrade</Link>
                  </Button>
                </div>
                <div className="h-1.5 rounded-full bg-violet-200 dark:bg-violet-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all"
                    style={{ width: `${Math.round((projects.length / limits.projects) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
