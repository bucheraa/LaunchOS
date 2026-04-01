"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { AILoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Sparkles, Lightbulb, CheckCircle2, TrendingUp, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { ProjectWithRelations, RecommendationData } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  STORE_LISTING: "Store Listing",
  SCREENSHOTS: "Screenshots",
  ASO: "ASO",
  MONETIZATION: "Monetization",
  ONBOARDING: "Onboarding",
  RETENTION: "Retention",
  ACQUISITION: "Acquisition",
  OTHER: "Other",
};

const EFFORT_LABELS: Record<string, string> = {
  LOW: "Low effort",
  MEDIUM: "Medium effort",
  HIGH: "High effort",
};

function RecCard({ rec, projectId }: { rec: RecommendationData; projectId: string }) {
  const [status, setStatus] = useState(rec.status);
  const [updating, setUpdating] = useState(false);

  async function updateStatus(newStatus: string) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/recommendations/${rec.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setStatus(newStatus);
    } finally {
      setUpdating(false);
    }
  }

  const isDone = status === "DONE" || status === "DISMISSED";

  return (
    <div className={cn("rounded-lg border bg-card p-5 transition-opacity", isDone && "opacity-60")}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <button
            onClick={() => updateStatus(status === "DONE" ? "OPEN" : "DONE")}
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
              status === "DONE"
                ? "border-green-500 bg-green-500 text-white"
                : "border-muted-foreground/30 hover:border-green-500"
            )}
          >
            {status === "DONE" && <CheckCircle2 className="h-3 w-3" />}
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={cn("font-semibold text-sm", isDone && "line-through")}>{rec.title}</h3>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                {CATEGORY_LABELS[rec.category] ?? rec.category}
              </span>
              <PriorityBadge priority={rec.priority} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{rec.description}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {rec.impact && (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3" />
                {rec.impact}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {EFFORT_LABELS[rec.effort] ?? rec.effort}
            </span>
          </div>
          <div className="mt-3 flex gap-2">
            {status === "OPEN" && (
              <Button size="sm" variant="outline" onClick={() => updateStatus("IN_PROGRESS")}>
                Start
              </Button>
            )}
            {status === "IN_PROGRESS" && (
              <Button size="sm" variant="outline" onClick={() => updateStatus("DONE")}>
                Mark done
              </Button>
            )}
            {!isDone && (
              <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => updateStatus("DISMISSED")}>
                Dismiss
              </Button>
            )}
            {isDone && (
              <Button size="sm" variant="ghost" onClick={() => updateStatus("OPEN")}>
                Reopen
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectRecommendationsTab({ project }: { project: ProjectWithRelations }) {
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const json = await res.json();
        toast({ title: "Generation failed", description: json.error, variant: "destructive" });
        return;
      }
      toast({ title: "Recommendations generated!" });
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  const recs = project.recommendations ?? [];
  const open = recs.filter((r) => r.status === "OPEN" || r.status === "IN_PROGRESS");
  const done = recs.filter((r) => r.status === "DONE");

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <AILoadingState message="Generating recommendations..." />
          ) : (
            <div className="flex items-center gap-3">
              <Button onClick={generate} disabled={loading}>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Recommendations
              </Button>
              <p className="text-sm text-muted-foreground">
                AI analyzes your app to suggest prioritized improvements.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {recs.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No recommendations yet"
          description="Generate AI recommendations to get a prioritized list of improvements for your app."
        />
      ) : (
        <div className="space-y-6">
          {open.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                To do · {open.length}
              </h2>
              <div className="space-y-3">
                {open.map((r) => <RecCard key={r.id} rec={r} projectId={project.id} />)}
              </div>
            </div>
          )}
          {done.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Completed · {done.length}
              </h2>
              <div className="space-y-3">
                {done.map((r) => <RecCard key={r.id} rec={r} projectId={project.id} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
