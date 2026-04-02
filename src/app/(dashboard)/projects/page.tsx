import { requireAuth, getWorkspace } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Folders, Plus, Smartphone, Monitor, FlaskConical, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { timeAgo, categoryLabel, platformLabel } from "@/lib/utils";
import { isDemoMode } from "@/lib/demo/mode";
import { getDemoProjects } from "@/lib/demo/store";

const CATEGORY_COLORS: Record<string, string> = {
  PRODUCTIVITY:  "from-blue-500 to-cyan-500",
  GAMES:         "from-pink-500 to-rose-500",
  HEALTH:        "from-green-500 to-emerald-500",
  FINANCE:       "from-yellow-500 to-amber-500",
  SOCIAL:        "from-violet-500 to-purple-500",
  EDUCATION:     "from-indigo-500 to-blue-500",
  ENTERTAINMENT: "from-orange-500 to-red-500",
  UTILITIES:     "from-slate-500 to-zinc-500",
};

function getProjectGradient(category: string) {
  return CATEGORY_COLORS[category] ?? "from-violet-500 to-purple-600";
}

export default async function ProjectsPage() {
  const session = await requireAuth();
  const workspace = await getWorkspace(session.user.id!);
  if (!workspace) return null;

  const projects = isDemoMode
    ? getDemoProjects().map((project) => ({
        ...project,
        _count: {
          listingVariants: project._count?.listingVariants ?? 0,
          experiments: project._count?.experiments ?? 0,
          recommendations:
            project.recommendations?.filter((r) => r.status === "OPEN").length ?? 0,
          audienceSegments: project._count?.audienceSegments ?? 0,
        },
      }))
    : await db.project.findMany({
        where: { workspaceId: workspace.id },
        include: {
          _count: {
            select: {
              listingVariants: true,
              experiments: true,
              recommendations: { where: { status: "OPEN" } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

  return (
    <div>
      <Header
        title="Projects"
        subtitle={`${projects.length} project${projects.length !== 1 ? "s" : ""}`}
        actions={
          <Button size="sm" className="h-8" asChild>
            <Link href="/projects/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Project
            </Link>
          </Button>
        }
      />

      <div className="p-6">
        {projects.length === 0 ? (
          <EmptyState
            icon={Folders}
            title="No projects yet"
            description="Create your first project to start generating AI-powered launch materials."
            action={
              <Button asChild>
                <Link href="/projects/new">
                  <Plus className="mr-1.5 h-4 w-4" /> Create Project
                </Link>
              </Button>
            }
            className="mt-4"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const gradient = getProjectGradient(project.category);
              return (
                <Link key={project.id} href={`/projects/${project.id}`} className="group">
                  <div className="rounded-2xl border bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-200 overflow-hidden h-full flex flex-col">
                    {/* Coloured banner */}
                    <div className={`h-2 w-full bg-gradient-to-r ${gradient}`} />

                    <div className="p-5 flex flex-col flex-1">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white font-bold text-lg shadow-sm`}>
                          {project.name.charAt(0)}
                        </div>
                        <StatusBadge status={project.status} />
                      </div>

                      {/* Name & category */}
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors mb-0.5">{project.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1">
                          {project.platform.includes("IOS") && <Smartphone className="h-3 w-3" />}
                          {project.platform.includes("ANDROID") && <Monitor className="h-3 w-3" />}
                        </span>
                        {categoryLabel(project.category)}
                      </p>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground line-clamp-2 flex-1 mb-4 leading-relaxed">
                        {project.description ?? "No description provided."}
                      </p>

                      {/* Stats footer */}
                      <div className="flex items-center justify-between border-t pt-3 mt-auto">
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {project._count.listingVariants}
                          </span>
                          <span className="flex items-center gap-1">
                            <FlaskConical className="h-3 w-3" />
                            {project._count.experiments}
                          </span>
                          {project._count.recommendations > 0 && (
                            <span className="flex items-center gap-1 text-orange-500 font-medium">
                              <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
                              {project._count.recommendations} open
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeAgo(project.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Add new project card */}
            <Link href="/projects/new" className="group">
              <div className="rounded-2xl border border-dashed bg-muted/20 hover:border-primary hover:bg-primary/5 transition-all duration-200 h-full min-h-[180px] flex flex-col items-center justify-center gap-3 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                  <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">New Project</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Add an app to optimize</p>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
