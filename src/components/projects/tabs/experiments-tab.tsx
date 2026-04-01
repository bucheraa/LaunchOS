"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { AILoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Sparkles, FlaskConical, Target, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { ProjectWithRelations, ExperimentData } from "@/types";

function ExperimentCard({ exp }: { exp: ExperimentData }) {
  const [updating, setUpdating] = useState(false);

  async function updateStatus(status: string) {
    setUpdating(true);
    try {
      await fetch(`/api/projects/${exp.projectId}/experiments/${exp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      window.location.reload();
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-sm leading-snug">{exp.name}</h3>
          <div className="flex items-center gap-2 shrink-0">
            <PriorityBadge priority={exp.priority} />
            <StatusBadge status={exp.status} />
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Hypothesis</p>
            <p className="leading-relaxed">{exp.hypothesis}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Target className="h-3 w-3" /> Elements
              </p>
              <div className="flex flex-wrap gap-1">
                {exp.elements.map((el, i) => (
                  <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {el}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Target Metric
              </p>
              <p className="text-xs">{exp.targetMetric}</p>
            </div>
            {exp.expectedImpact && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Expected Impact</p>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">{exp.expectedImpact}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t flex gap-2">
          {exp.status === "PLANNED" && (
            <Button size="sm" variant="outline" onClick={() => updateStatus("RUNNING")}>
              Start Test
            </Button>
          )}
          {exp.status === "RUNNING" && (
            <>
              <Button size="sm" variant="outline" onClick={() => updateStatus("PAUSED")}>
                Pause
              </Button>
              <Button size="sm" variant="outline" onClick={() => updateStatus("COMPLETED")}>
                Complete
              </Button>
            </>
          )}
          {exp.status === "PAUSED" && (
            <Button size="sm" variant="outline" onClick={() => updateStatus("RUNNING")}>
              Resume
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectExperimentsTab({ project }: { project: ProjectWithRelations }) {
  const [loading, setLoading] = useState(false);

  async function generateIdeas() {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/experiments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const json = await res.json();
        toast({ title: "Generation failed", description: json.error, variant: "destructive" });
        return;
      }
      toast({ title: "Experiment ideas generated!" });
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  const experiments = project.experiments ?? [];
  const grouped = {
    RUNNING: experiments.filter((e) => e.status === "RUNNING"),
    PLANNED: experiments.filter((e) => e.status === "PLANNED"),
    COMPLETED: experiments.filter((e) => e.status === "COMPLETED"),
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">AI Experiment Ideas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <AILoadingState message="Generating experiment ideas..." />
          ) : (
            <div className="flex items-center gap-3">
              <Button onClick={generateIdeas} disabled={loading}>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Ideas
              </Button>
              <p className="text-sm text-muted-foreground">
                AI will suggest A/B tests based on your store listing and analysis.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {experiments.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="No experiments yet"
          description="Generate experiment ideas with AI, or add your own A/B test hypotheses."
        />
      ) : (
        <div className="space-y-6">
          {grouped.RUNNING.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Running ({grouped.RUNNING.length})
              </h2>
              <div className="space-y-3">
                {grouped.RUNNING.map((e) => <ExperimentCard key={e.id} exp={e} />)}
              </div>
            </div>
          )}
          {grouped.PLANNED.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Planned ({grouped.PLANNED.length})
              </h2>
              <div className="space-y-3">
                {grouped.PLANNED.map((e) => <ExperimentCard key={e.id} exp={e} />)}
              </div>
            </div>
          )}
          {grouped.COMPLETED.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Completed ({grouped.COMPLETED.length})
              </h2>
              <div className="space-y-3">
                {grouped.COMPLETED.map((e) => <ExperimentCard key={e.id} exp={e} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
