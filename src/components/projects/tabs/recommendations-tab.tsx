"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AILoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Sparkles, Lightbulb, CheckCircle2, TrendingUp, Zap, ArrowRight, Trophy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { ProjectWithRelations, RecommendationData } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  STORE_LISTING: "Store Listing",
  SCREENSHOTS:   "Screenshots",
  ASO:           "ASO",
  MONETIZATION:  "Monetization",
  ONBOARDING:    "Onboarding",
  RETENTION:     "Retention",
  ACQUISITION:   "Acquisition",
  OTHER:         "Other",
};

const EFFORT_LABELS: Record<string, string> = {
  LOW:    "Low effort",
  MEDIUM: "Medium effort",
  HIGH:   "High effort",
};

const PRIORITY_CONFIG: Record<string, { label: string; bg: string; border: string; dot: string; textColor: string }> = {
  CRITICAL: { label: "Critical", bg: "bg-red-50 dark:bg-red-950/20",     border: "border-red-200 dark:border-red-900",   dot: "bg-red-500",    textColor: "text-red-600 dark:text-red-400" },
  HIGH:     { label: "High",     bg: "bg-orange-50 dark:bg-orange-950/20",border: "border-orange-200 dark:border-orange-900",dot: "bg-orange-500",textColor: "text-orange-600 dark:text-orange-400" },
  MEDIUM:   { label: "Medium",   bg: "bg-yellow-50 dark:bg-yellow-950/20",border: "border-yellow-200 dark:border-yellow-900",dot:"bg-yellow-500",textColor: "text-yellow-700 dark:text-yellow-400" },
  LOW:      { label: "Low",      bg: "bg-blue-50 dark:bg-blue-950/20",   border: "border-blue-200 dark:border-blue-900",  dot: "bg-blue-400",   textColor: "text-blue-600 dark:text-blue-400" },
};

function RecCard({ rec, projectId }: { rec: RecommendationData; projectId: string }) {
  const [status, setStatus] = useState(rec.status);
  const [updating, setUpdating] = useState(false);
  const cfg = PRIORITY_CONFIG[rec.priority] ?? PRIORITY_CONFIG.LOW;
  const isDone = status === "DONE" || status === "DISMISSED";
  const isInProgress = status === "IN_PROGRESS";

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

  return (
    <div className={cn(
      "rounded-2xl border p-5 transition-all",
      isDone ? "opacity-50 bg-muted/20" : "bg-card hover:shadow-sm"
    )}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => updateStatus(status === "DONE" ? "OPEN" : "DONE")}
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
            status === "DONE"
              ? "border-emerald-500 bg-emerald-500 text-white"
              : isInProgress
              ? "border-violet-400 bg-violet-100 dark:bg-violet-900/30"
              : "border-muted-foreground/30 hover:border-emerald-400"
          )}
          disabled={updating}
        >
          {status === "DONE" && <CheckCircle2 className="h-3 w-3" />}
          {isInProgress && <span className="h-2 w-2 rounded-full bg-violet-500" />}
        </button>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className={cn("font-semibold text-sm leading-snug", isDone && "line-through text-muted-foreground")}>
              {rec.title}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold border", cfg.bg, cfg.border, cfg.textColor)}>
                {cfg.label}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {CATEGORY_LABELS[rec.category] ?? rec.category}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{rec.description}</p>

          {/* Impact + Effort chips */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {rec.impact && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 text-xs font-medium">
                <TrendingUp className="h-3 w-3" /> {rec.impact}
              </span>
            )}
            <span className="flex items-center gap-1 rounded-full bg-muted border border-border text-muted-foreground px-2.5 py-0.5 text-xs">
              <Zap className="h-3 w-3" /> {EFFORT_LABELS[rec.effort] ?? rec.effort}
            </span>
          </div>

          {/* Actions */}
          {!isDone && (
            <div className="flex gap-2">
              {status === "OPEN" && (
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus("IN_PROGRESS")} disabled={updating}>
                  Start <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              )}
              {status === "IN_PROGRESS" && (
                <Button size="sm" className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => updateStatus("DONE")} disabled={updating}>
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Mark done
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => updateStatus("DISMISSED")} disabled={updating}>
                Dismiss
              </Button>
            </div>
          )}
          {isDone && (
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => updateStatus("OPEN")} disabled={updating}>
              Reopen
            </Button>
          )}
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
  const donePct = recs.length > 0 ? Math.round((done.length / recs.length) * 100) : 0;

  // Group open by priority
  const byPriority: Record<string, RecommendationData[]> = { CRITICAL: [], HIGH: [], MEDIUM: [], LOW: [] };
  for (const r of open) {
    const bucket = r.priority in byPriority ? r.priority : "LOW";
    byPriority[bucket].push(r);
  }

  return (
    <div className="p-6 space-y-6">

      {/* Generate / Progress header */}
      {recs.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/10 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 shadow-md">
              <Lightbulb className="h-7 w-7 text-white" />
            </div>
          </div>
          <h2 className="text-lg font-bold mb-1">Generate AI Recommendations</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Our AI analyses your app and suggests prioritised improvements for your store listing, ASO, and growth.
          </p>
          {loading ? (
            <AILoadingState message="Generating recommendations…" />
          ) : (
            <Button onClick={generate} size="lg" className="bg-gradient-to-r from-orange-400 to-amber-500 hover:opacity-90 text-white border-0">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Recommendations
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Progress card */}
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
                  {done.length === recs.length
                    ? <Trophy className="h-5 w-5 text-amber-500" />
                    : <Lightbulb className="h-5 w-5 text-orange-500" />}
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {done.length === recs.length ? "All done! 🎉" : `${open.length} action${open.length !== 1 ? "s" : ""} remaining`}
                  </p>
                  <p className="text-xs text-muted-foreground">{done.length} of {recs.length} completed</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{donePct}%</span>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={generate} disabled={loading}>
                  <Sparkles className="mr-1 h-3 w-3" /> Regenerate
                </Button>
              </div>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-500"
                style={{ width: `${donePct}%` }}
              />
            </div>
          </div>

          {loading && <AILoadingState message="Generating recommendations…" />}
        </>
      )}

      {/* Priority groups */}
      {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((priority) => {
        const group = byPriority[priority];
        if (!group.length) return null;
        const cfg = PRIORITY_CONFIG[priority];
        return (
          <div key={priority}>
            <div className="flex items-center gap-2 mb-3">
              <span className={cn("h-2 w-2 rounded-full", cfg.dot)} />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {cfg.label} · {group.length}
              </h2>
            </div>
            <div className="space-y-3">
              {group.map((r) => <RecCard key={r.id} rec={r} projectId={project.id} />)}
            </div>
          </div>
        );
      })}

      {/* Completed */}
      {done.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Completed · {done.length}
            </h2>
          </div>
          <div className="space-y-3">
            {done.map((r) => <RecCard key={r.id} rec={r} projectId={project.id} />)}
          </div>
        </div>
      )}

      {recs.length === 0 && !loading && (
        <EmptyState
          icon={Lightbulb}
          title="No recommendations yet"
          description="Generate AI recommendations to get a prioritised list of improvements."
        />
      )}
    </div>
  );
}
