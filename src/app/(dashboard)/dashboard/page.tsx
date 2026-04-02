import { requireAuth, getWorkspace } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Folders,
  Plus,
  TrendingUp,
  FlaskConical,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Zap,
  Target,
  BarChart3,
  Clock,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { timeAgo, categoryLabel, platformLabel } from "@/lib/utils";
import { isDemoMode } from "@/lib/demo/mode";
import { getDemoProjects } from "@/lib/demo/store";

const PLAN_LIMITS: Record<string, { projects: number; aiGenerations: number }> = {
  FREE:    { projects: 3,         aiGenerations: 50 },
  STARTER: { projects: 10,        aiGenerations: 500 },
  GROWTH:  { projects: Infinity,  aiGenerations: Infinity },
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getAsoScore(project: { _count?: { listingVariants?: number; experiments?: number; recommendations?: number } }) {
  // Heuristic: each variant/experiment adds score, open recommendations subtract
  const variants  = project._count?.listingVariants ?? 0;
  const exps      = project._count?.experiments ?? 0;
  const openRecs  = project._count?.recommendations ?? 0;
  const raw = Math.min(100, 30 + variants * 10 + exps * 15 - openRecs * 5);
  return Math.max(10, raw);
}

export default async function DashboardPage() {
  const session = await requireAuth();
  const workspace = await getWorkspace(session.user.id!);
  if (!workspace) return null;

  const plan = workspace.plan ?? "FREE";

  const projects = isDemoMode
    ? getDemoProjects()
        .map((project) => ({
          ...project,
          recommendations: (project.recommendations ?? [])
            .filter((r) => r.status === "OPEN")
            .slice(0, 2),
        }))
        .slice(0, 10)
    : await db.project.findMany({
        where: { workspaceId: workspace.id },
        include: {
          _count: {
            select: {
              listingVariants: true,
              experiments: true,
              recommendations: true,
            },
          },
          recommendations: {
            where: { status: "OPEN" },
            orderBy: { priority: "desc" },
            take: 2,
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      });

  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE;

  const stats = {
    totalProjects:       projects.length,
    totalVariants:       projects.reduce((a, p) => a + (p._count?.listingVariants ?? 0), 0),
    totalExperiments:    projects.reduce((a, p) => a + (p._count?.experiments ?? 0), 0),
    openRecommendations: projects.reduce((a, p) => a + p.recommendations.length, 0),
  };

  const allRecommendations = projects
    .flatMap((p) =>
      p.recommendations.map((r) => ({ ...r, projectName: p.name, projectId: p.id }))
    )
    .sort((a, b) => {
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return (order[a.priority as keyof typeof order] ?? 2) - (order[b.priority as keyof typeof order] ?? 2);
    })
    .slice(0, 5);

  const topProject = projects.length > 0
    ? [...projects].sort((a, b) => getAsoScore(b) - getAsoScore(a))[0]
    : null;

  const projectUsagePct = limits.projects === Infinity ? 100 : Math.round((stats.totalProjects / limits.projects) * 100);
  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div>
      <Header
        title="Dashboard"
        actions={
          <Button size="sm" asChild className="h-8">
            <Link href="/projects/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Project
            </Link>
          </Button>
        }
      />

      <div className="p-6 space-y-6">

        {/* Hero greeting */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 text-white shadow-lg">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)" }} />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-violet-200">{getGreeting()}</p>
              <h2 className="text-2xl font-bold mt-0.5">{firstName} 👋</h2>
              <p className="text-sm text-violet-200 mt-2 max-w-sm">
                {stats.totalProjects === 0
                  ? "Create your first project and let AI power your App Store launch."
                  : `You have ${stats.openRecommendations} open recommendation${stats.openRecommendations !== 1 ? "s" : ""} waiting — let's crush those rankings.`}
              </p>
            </div>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              {limits.projects !== Infinity && (
                <p className="text-[10px] text-violet-200 text-center whitespace-nowrap">
                  {stats.totalProjects}/{limits.projects} projects
                </p>
              )}
            </div>
          </div>

          {/* Plan usage bar (only for FREE / limited plans) */}
          {limits.projects !== Infinity && (
            <div className="relative mt-4">
              <div className="flex items-center justify-between text-[11px] text-violet-200 mb-1">
                <span>Project usage</span>
                <span>{stats.totalProjects}/{limits.projects}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{ width: `${projectUsagePct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Projects",
              value: stats.totalProjects,
              icon: Folders,
              gradient: "from-blue-500/10 to-cyan-500/10",
              iconColor: "text-blue-500",
              iconBg: "bg-blue-500/10",
              href: "/projects",
            },
            {
              label: "Store Variants",
              value: stats.totalVariants,
              icon: TrendingUp,
              gradient: "from-emerald-500/10 to-green-500/10",
              iconColor: "text-emerald-500",
              iconBg: "bg-emerald-500/10",
              href: null,
            },
            {
              label: "Experiments",
              value: stats.totalExperiments,
              icon: FlaskConical,
              gradient: "from-violet-500/10 to-purple-500/10",
              iconColor: "text-violet-500",
              iconBg: "bg-violet-500/10",
              href: null,
            },
            {
              label: "Open Actions",
              value: stats.openRecommendations,
              icon: Lightbulb,
              gradient: "from-orange-500/10 to-amber-500/10",
              iconColor: "text-orange-500",
              iconBg: "bg-orange-500/10",
              href: null,
            },
          ].map((stat) => (
            <Card
              key={stat.label}
              className={`bg-gradient-to-br ${stat.gradient} border hover:shadow-md transition-shadow`}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`rounded-xl p-2 ${stat.iconBg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                  {stat.href && (
                    <Link href={stat.href} className={`text-xs ${stat.iconColor} hover:underline flex items-center gap-0.5`}>
                      View <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardHeader className="py-4 px-5 border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-blue-500/10 p-1.5">
                      <Folders className="h-4 w-4 text-blue-500" />
                    </div>
                    <CardTitle className="text-sm font-semibold">Recent Projects</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                    <Link href="/projects">
                      View all <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {projects.length === 0 ? (
                  <EmptyState
                    icon={Folders}
                    title="No projects yet"
                    description="Create your first project to get started."
                    action={
                      <Button size="sm" asChild>
                        <Link href="/projects/new">
                          <Plus className="mr-1.5 h-3.5 w-3.5" /> New Project
                        </Link>
                      </Button>
                    }
                    className="border-0 rounded-none"
                  />
                ) : (
                  <div className="divide-y">
                    {projects.slice(0, 6).map((project) => {
                      const score = getAsoScore(project);
                      return (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          className="group flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold text-sm shadow-sm">
                            {project.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{project.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {categoryLabel(project.category)} · {project.platform.map(platformLabel).join(" & ")}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            {/* ASO Score mini */}
                            <div className="hidden sm:flex flex-col items-center gap-0.5">
                              <div className="flex items-center gap-1">
                                <BarChart3 className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs font-medium">{score}</span>
                              </div>
                              <span className="text-[9px] text-muted-foreground">ASO</span>
                            </div>
                            <StatusBadge status={project.status} />
                            <span className="text-xs text-muted-foreground hidden md:flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {timeAgo(project.updatedAt)}
                            </span>
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
          <div className="space-y-6">

            {/* Top Recommendations */}
            <Card className="overflow-hidden">
              <CardHeader className="py-4 px-5 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-orange-500/10 p-1.5">
                    <Lightbulb className="h-4 w-4 text-orange-500" />
                  </div>
                  <CardTitle className="text-sm font-semibold">Top Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {allRecommendations.length === 0 ? (
                  <EmptyState
                    icon={CheckCircle2}
                    title="All clear!"
                    description="Run an analysis to get actionable suggestions."
                    className="border-0 rounded-none py-6"
                  />
                ) : (
                  <div className="divide-y">
                    {allRecommendations.map((rec) => (
                      <Link
                        key={rec.id}
                        href={`/projects/${rec.projectId}?tab=recommendations`}
                        className="flex items-start gap-3 px-5 py-3 hover:bg-muted/40 transition-colors"
                      >
                        <StatusBadge status={rec.priority} className="mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium line-clamp-2 leading-snug">{rec.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{rec.projectName}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="overflow-hidden">
              <CardHeader className="py-4 px-5 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-violet-500/10 p-1.5">
                    <Zap className="h-4 w-4 text-violet-500" />
                  </div>
                  <CardTitle className="text-sm font-semibold">Quick Start</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Link
                  href="/projects/new"
                  className="flex items-center gap-3 rounded-xl border border-dashed p-3 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors">
                    <Plus className="h-4 w-4 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">New Project</p>
                    <p className="text-[11px] text-muted-foreground">Start an ASO campaign</p>
                  </div>
                </Link>
                {topProject && (
                  <Link
                    href={`/projects/${topProject.id}?tab=analysis`}
                    className="flex items-center gap-3 rounded-xl border p-3 hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                      <Target className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">Analyse {topProject.name}</p>
                      <p className="text-[11px] text-muted-foreground">Run AI analysis</p>
                    </div>
                  </Link>
                )}
                <Link
                  href="/settings"
                  className="flex items-center gap-3 rounded-xl border p-3 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Connect Store</p>
                    <p className="text-[11px] text-muted-foreground">Apple &amp; Google integrations</p>
                  </div>
                </Link>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
