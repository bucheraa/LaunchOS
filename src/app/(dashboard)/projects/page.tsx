import { requireAuth, getWorkspace } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ProjectsGrid } from "@/components/projects/projects-grid";
import { Folders, Plus, Trophy, TrendingUp, AlertTriangle, BarChart3 } from "lucide-react";
import Link from "next/link";
import { isDemoMode } from "@/lib/demo/mode";
import { getDemoProjects } from "@/lib/demo/store";
import { cn } from "@/lib/utils";

function getAsoScore(p: { _count?: { listingVariants?: number; experiments?: number; recommendations?: number } }) {
  const variants = p._count?.listingVariants ?? 0;
  const exps     = p._count?.experiments     ?? 0;
  const openRecs = p._count?.recommendations ?? 0;
  return Math.max(10, Math.min(100, 30 + variants * 10 + exps * 15 - openRecs * 5));
}

export default async function ProjectsPage() {
  const session = await requireAuth();
  const workspace = await getWorkspace(session.user.id!);
  if (!workspace) return null;

  const projects = isDemoMode
    ? getDemoProjects().map((project) => ({
        ...project,
        recommendations: (project.recommendations ?? [])
          .filter((r) => r.status === "OPEN")
          .slice(0, 1),
        _count: {
          listingVariants:  project._count?.listingVariants ?? 0,
          experiments:      project._count?.experiments ?? 0,
          recommendations:  project.recommendations?.filter((r) => r.status === "OPEN").length ?? 0,
          keywordSets:      project._count?.keywordSets ?? 0,
        },
      }))
    : await db.project.findMany({
        where: { workspaceId: workspace.id },
        include: {
          analysis: { select: { analysisStatus: true } },
          _count: {
            select: {
              listingVariants: true,
              experiments: true,
              recommendations: { where: { status: "OPEN" } },
              keywordSets: true,
            },
          },
          recommendations: {
            where: { status: "OPEN" },
            orderBy: { priority: "desc" },
            take: 1,
          },
        },
        orderBy: { updatedAt: "desc" },
      });

  // Portfolio summary stats
  const scores       = projects.map(getAsoScore);
  const avgScore     = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const launchReady  = scores.filter((s) => s >= 70).length;
  const inProgress   = scores.filter((s) => s >= 40 && s < 70).length;
  const needsWork    = scores.filter((s) => s < 40).length;
  const totalActions = projects.reduce((a, p) => a + (p._count?.recommendations ?? 0), 0);

  return (
    <div>
      <Header
        title="Projects"
        subtitle="Your App Store portfolio — health & launch readiness at a glance"
        actions={
          <Button size="sm" className="h-8 bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 border-0" asChild>
            <Link href="/projects/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Project
            </Link>
          </Button>
        }
      />

      <div className="p-6 space-y-6">

        {projects.length === 0 ? (
          <EmptyState
            icon={Folders}
            title="No projects yet"
            description="Create your first project and let AI generate your entire App Store launch kit — analysis, keywords, store copy, screenshots and A/B experiments — in under 2 minutes."
            action={
              <Button asChild className="bg-gradient-to-r from-violet-500 to-purple-600 border-0">
                <Link href="/projects/new">
                  <Plus className="mr-1.5 h-4 w-4" /> Create first project
                </Link>
              </Button>
            }
            className="mt-4 py-20"
          />
        ) : (
          <>
            {/* ── Portfolio Summary Bar ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Avg. ASO Score",
                  value: avgScore,
                  suffix: "/100",
                  icon: BarChart3,
                  color: avgScore >= 70 ? "text-emerald-600 dark:text-emerald-400" : avgScore >= 40 ? "text-amber-600 dark:text-amber-400" : "text-red-500",
                  bg: "bg-muted/40",
                  border: "border",
                },
                {
                  label: "Launch Ready",
                  value: launchReady,
                  suffix: ` app${launchReady !== 1 ? "s" : ""}`,
                  icon: Trophy,
                  color: "text-emerald-600 dark:text-emerald-400",
                  bg: "bg-emerald-50 dark:bg-emerald-950/20",
                  border: "border-emerald-200 dark:border-emerald-800",
                },
                {
                  label: "In Progress",
                  value: inProgress,
                  suffix: ` app${inProgress !== 1 ? "s" : ""}`,
                  icon: TrendingUp,
                  color: "text-amber-600 dark:text-amber-400",
                  bg: "bg-amber-50 dark:bg-amber-950/20",
                  border: "border-amber-200 dark:border-amber-800",
                },
                {
                  label: "Open Actions",
                  value: totalActions,
                  suffix: ` rec${totalActions !== 1 ? "s" : ""}`,
                  icon: AlertTriangle,
                  color: totalActions > 0 ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground",
                  bg: totalActions > 0 ? "bg-orange-50 dark:bg-orange-950/20" : "bg-muted/40",
                  border: totalActions > 0 ? "border-orange-200 dark:border-orange-800" : "border",
                },
              ].map((stat) => (
                <div key={stat.label} className={cn("flex items-center gap-3 rounded-xl p-4 border", stat.bg, stat.border)}>
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background/60 border")}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                  <div className="min-w-0">
                    <p className={cn("text-xl font-black leading-none tabular-nums", stat.color)}>
                      {stat.value}<span className="text-xs font-semibold">{stat.suffix}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Projects Grid with filter ── */}
            <ProjectsGrid projects={projects} />
          </>
        )}
      </div>
    </div>
  );
}
