import { requireAuth, getWorkspace } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Folders, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { timeAgo, categoryLabel, platformLabel } from "@/lib/utils";

export default async function ProjectsPage() {
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
        actions={
          <Button size="sm" asChild>
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
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-5 h-full flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-lg">
                        {project.name.charAt(0)}
                      </div>
                      <StatusBadge status={project.status} />
                    </div>
                    <h3 className="font-semibold mb-1">{project.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      {categoryLabel(project.category)} · {project.platform.map(platformLabel).join(" & ")}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-4">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between border-t pt-3 mt-auto text-xs text-muted-foreground">
                      <div className="flex gap-4">
                        <span>{project._count.listingVariants} variants</span>
                        <span>{project._count.experiments} experiments</span>
                        {project._count.recommendations > 0 && (
                          <span className="text-orange-500 font-medium">
                            {project._count.recommendations} open
                          </span>
                        )}
                      </div>
                      <span>{timeAgo(project.updatedAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
