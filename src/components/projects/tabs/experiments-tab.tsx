"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { AILoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Sparkles, FlaskConical, Target, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { ProjectWithRelations, ExperimentData } from "@/types";

function ResultForm({
  exp,
  onSaved,
}: {
  exp: ExperimentData;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    baselineValue: exp.baselineValue?.toString() ?? "",
    resultValue: exp.resultValue?.toString() ?? "",
    sampleSize: exp.sampleSize?.toString() ?? "",
    confidence: exp.confidence?.toString() ?? "",
    winner: exp.winner ?? "",
    result: exp.result ?? "",
  });

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      if (form.baselineValue !== "") body.baselineValue = parseFloat(form.baselineValue);
      if (form.resultValue !== "") body.resultValue = parseFloat(form.resultValue);
      if (form.sampleSize !== "") body.sampleSize = parseInt(form.sampleSize, 10);
      if (form.confidence !== "") body.confidence = parseFloat(form.confidence);
      if (form.winner) body.winner = form.winner;
      if (form.result) body.result = form.result;

      const res = await fetch(`/api/projects/${exp.projectId}/experiments/${exp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json();
        toast({ title: "Save failed", description: json.error, variant: "destructive" });
        return;
      }
      toast({ title: "Results saved" });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  const uplift =
    form.baselineValue !== "" && form.resultValue !== ""
      ? (((parseFloat(form.resultValue) - parseFloat(form.baselineValue)) / parseFloat(form.baselineValue)) * 100).toFixed(1)
      : null;

  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Result Tracking
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Baseline CVR (%)</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="e.g. 3.2"
            value={form.baselineValue}
            onChange={(e) => set("baselineValue", e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Variant CVR (%)</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="e.g. 4.1"
            value={form.resultValue}
            onChange={(e) => set("resultValue", e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Sample Size</Label>
          <Input
            type="number"
            placeholder="e.g. 5000"
            value={form.sampleSize}
            onChange={(e) => set("sampleSize", e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Confidence (%)</Label>
          <Input
            type="number"
            step="0.1"
            min="0"
            max="100"
            placeholder="e.g. 95"
            value={form.confidence}
            onChange={(e) => set("confidence", e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>

      {uplift !== null && (
        <div className={cn(
          "rounded-md px-3 py-2 text-sm font-medium",
          parseFloat(uplift) > 0
            ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
            : parseFloat(uplift) < 0
            ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            : "bg-muted text-muted-foreground"
        )}>
          Uplift: {parseFloat(uplift) > 0 ? "+" : ""}{uplift}%
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Winner</Label>
          <Select value={form.winner} onValueChange={(v) => set("winner", v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select winner" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="A">A (Control)</SelectItem>
              <SelectItem value="B">B (Variant)</SelectItem>
              <SelectItem value="inconclusive">Inconclusive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Notes / Summary</Label>
          <Input
            placeholder="Key takeaway…"
            value={form.result}
            onChange={(e) => set("result", e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>

      <Button size="sm" onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save Results"}
      </Button>
    </div>
  );
}

function ExperimentCard({ exp }: { exp: ExperimentData }) {
  const [updating, setUpdating] = useState(false);
  const [showResults, setShowResults] = useState(false);

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

  const hasResults = exp.baselineValue != null || exp.resultValue != null;
  const uplift =
    exp.baselineValue != null && exp.resultValue != null
      ? (((exp.resultValue - exp.baselineValue) / exp.baselineValue) * 100).toFixed(1)
      : null;

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

          {/* Summary of existing results */}
          {hasResults && (
            <div className="rounded-lg bg-muted/40 p-3 grid gap-2 sm:grid-cols-4 text-xs">
              {exp.baselineValue != null && (
                <div>
                  <p className="text-muted-foreground mb-0.5">Baseline</p>
                  <p className="font-semibold">{exp.baselineValue}%</p>
                </div>
              )}
              {exp.resultValue != null && (
                <div>
                  <p className="text-muted-foreground mb-0.5">Variant</p>
                  <p className="font-semibold">{exp.resultValue}%</p>
                </div>
              )}
              {uplift !== null && (
                <div>
                  <p className="text-muted-foreground mb-0.5">Uplift</p>
                  <p className={cn(
                    "font-semibold",
                    parseFloat(uplift) > 0 ? "text-green-600 dark:text-green-400" : "text-red-500"
                  )}>
                    {parseFloat(uplift) > 0 ? "+" : ""}{uplift}%
                  </p>
                </div>
              )}
              {exp.winner && (
                <div>
                  <p className="text-muted-foreground mb-0.5">Winner</p>
                  <p className="font-semibold capitalize">{exp.winner === "A" ? "A (Control)" : exp.winner === "B" ? "B (Variant)" : "Inconclusive"}</p>
                </div>
              )}
            </div>
          )}

          {exp.result && (
            <p className="text-xs text-muted-foreground italic">"{exp.result}"</p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t flex flex-wrap gap-2 items-center">
          {exp.status === "PLANNED" && (
            <Button size="sm" variant="outline" onClick={() => updateStatus("RUNNING")} disabled={updating}>
              Start Test
            </Button>
          )}
          {exp.status === "RUNNING" && (
            <>
              <Button size="sm" variant="outline" onClick={() => updateStatus("PAUSED")} disabled={updating}>
                Pause
              </Button>
              <Button size="sm" variant="outline" onClick={() => updateStatus("COMPLETED")} disabled={updating}>
                Complete
              </Button>
            </>
          )}
          {exp.status === "PAUSED" && (
            <Button size="sm" variant="outline" onClick={() => updateStatus("RUNNING")} disabled={updating}>
              Resume
            </Button>
          )}

          {(exp.status === "RUNNING" || exp.status === "COMPLETED" || exp.status === "PAUSED") && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowResults((v) => !v)}
              className="ml-auto text-xs"
            >
              {showResults ? <ChevronUp className="h-3.5 w-3.5 mr-1" /> : <ChevronDown className="h-3.5 w-3.5 mr-1" />}
              {showResults ? "Hide" : "Enter Results"}
            </Button>
          )}
        </div>

        {showResults && (
          <div className="mt-3">
            <ResultForm exp={exp} onSaved={() => window.location.reload()} />
          </div>
        )}
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
    COMPLETED: experiments.filter((e) => ["COMPLETED", "CANCELLED"].includes(e.status)),
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">AI Experiment Ideas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <AILoadingState message="Generating experiment ideas…" />
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
          description="Generate experiment ideas with AI, or start tracking your own A/B test hypotheses."
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
