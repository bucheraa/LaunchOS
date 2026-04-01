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
  CheckCircle2,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { formatDate, timeAgo, categoryLabel, platformLabel } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await requireAuth();
  const workspace = await getWorkspace(session.user.id!);
  if (!workspace) return null;

  const projects = await db.project.findMany({
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

  const stats = {
    totalProjects: projects.length,
    totalVariants: projects.reduce((a, p) => a + p._count.listingVariants, 0),
    totalExperiments: projects.reduce((a, p) => a + p._count.experiments, 0),
    openRecommendations: projects.reduce(
      (a, p) => a + p.recommendations.length,
      0
    ),
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

  return (
    <div>
      <Header
        title="Dashboard"
        actions={
          <Button size="sm" asChild>
            <Link href="/projects/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Project
            </Link>
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Projects", value: stats.totalProjects, icon: Folders, color: "text-blue-500" },
            { label: "Store Variants", value: stats.totalVariants, icon: TrendingUp, color: "text-green-500" },
            { label: "Experiments", value: stats.totalExperiments, icon: FlaskConical, color: "text-purple-500" },
            { label: "Open Recommendations", value: stats.openRecommendations, icon: Lightbulb, color: "text-orange-500" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-0.5">{stat.value}</p>
                  </div>
                  <div className={`rounded-lg bg-muted p-2 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Recent Projects</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/projects">
                      View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
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
                    {projects.map((project) => (
                      <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                          {project.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{project.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {categoryLabel(project.category)} ·{" "}
                            {project.platform.map(platformLabel).join(" & ")}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <StatusBadge status={project.status} />
                          <span className="text-xs text-muted-foreground hidden sm:block">
                            {timeAgo(project.updatedAt)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Recommendations */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Top Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {allRecommendations.length === 0 ? (
                  <EmptyState
                    icon={CheckCircle2}
                    title="No open recommendations"
                    description="Run an analysis to get actionable suggestions."
                    className="border-0 rounded-none"
                  />
                ) : (
                  <div className="divide-y">
                    {allRecommendations.map((rec) => (
                      <div key={rec.id} className="px-6 py-3.5">
                        <div className="flex items-start gap-2">
                          <StatusBadge status={rec.priority} className="mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium line-clamp-2">{rec.title}</p>
                            <Link
                              href={`/projects/${rec.projectId}?tab=recommendations`}
                              className="text-xs text-muted-foreground hover:text-primary"
                            >
                              {rec.projectName}
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
