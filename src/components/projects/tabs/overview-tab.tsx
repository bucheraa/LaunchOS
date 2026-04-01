import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate, timeAgo } from "@/lib/utils";
import type { ProjectWithRelations } from "@/types";
import { Lightbulb, FlaskConical, FileText, Users } from "lucide-react";
import Link from "next/link";

export function ProjectOverviewTab({ project }: { project: ProjectWithRelations }) {
  const openRecs = project.recommendations?.filter((r) => r.status === "OPEN") ?? [];
  const runningExps = project.experiments?.filter((e) => e.status === "RUNNING") ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Audience Segments", value: project.audienceSegments?.length ?? 0, icon: Users },
          { label: "Store Variants", value: project.listingVariants?.length ?? 0, icon: FileText },
          { label: "Running Experiments", value: runningExps.length, icon: FlaskConical },
          { label: "Open Recommendations", value: openRecs.length, icon: Lightbulb },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
                <s.icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">About this app</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {project.description}
            </p>
            {project.mainFeatures.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Key Features</p>
                <ul className="space-y-1">
                  {project.mainFeatures.map((f, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="pt-2 border-t text-xs text-muted-foreground flex gap-4">
              <span>Created {formatDate(project.createdAt)}</span>
              <span>Updated {timeAgo(project.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Top Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {openRecs.length === 0 ? (
              <EmptyState
                icon={Lightbulb}
                title="No open recommendations"
                description="Run an analysis to get suggestions."
                className="border-0 rounded-none py-8"
              />
            ) : (
              <div className="divide-y">
                {openRecs.slice(0, 4).map((rec) => (
                  <div key={rec.id} className="px-6 py-3">
                    <div className="flex items-start gap-2">
                      <PriorityBadge priority={rec.priority} className="mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{rec.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {rec.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Audience Segments */}
      {(project.audienceSegments?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Audience Segments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {project.audienceSegments?.map((seg) => (
                <div key={seg.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{seg.name}</p>
                        {seg.isPrimary && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{seg.description}</p>
                      {seg.painPoints.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {seg.painPoints.map((p, i) => (
                            <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
