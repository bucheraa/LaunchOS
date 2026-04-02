"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PriorityBadge } from "@/components/shared/status-badge";
import { AILoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Sparkles, FlaskConical, Target, TrendingUp, TrendingDown,
  ChevronDown, ChevronUp, Play, Pause, CheckCircle2, Trophy,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { ProjectWithRelations, ExperimentData } from "@/types";

const STATUS_CONFIG: Record<string, { label: string; bg: string; dot: string; text: string }> = {
  PLANNED:   { label: "Planned",   bg: "bg-slate-100 dark:bg-slate-800",   dot: "bg-slate-400",   text: "text-slate-600 dark:text-slate-400" },
  RUNNING:   { label: "Running",   bg: "bg-blue-100 dark:bg-blue-900/30",  dot: "bg-blue-500",    text: "text-blue-700 dark:text-blue-400" },
  PAUSED:    { label: "Paused",    bg: "bg-yellow-100 dark:bg-yellow-900/30",dot:"bg-yellow-400",  text: "text-yellow-700 dark:text-yellow-400" },
  COMPLETED: { label: "Completed", bg: "bg-emerald-100 dark:bg-emerald-900/20",dot:"bg-emerald-500",text: "text-emerald-700 dark:text-emerald-400" },
  CANCELLED: { label: "Cancelled", bg: "bg-muted",                         dot: "bg-muted-foreground",text: "text-muted-foreground" },
};

function ResultForm({ exp, onSaved }: { exp: ExperimentData; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    baselineValue: exp.baselineValue?.toString() ?? "",
    resultValue:   exp.resultValue?.toString()   ?? "",
    sampleSize:    exp.sampleSize?.toString()    ?? "",
    confidence:    exp.confidence?.toString()    ?? "",
    winner:        exp.winner  ?? "",
    result:        exp.result  ?? "",
  });

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const uplift =
    form.baselineValue !== "" && form.resultValue !== ""
      ? (((parseFloat(form.resultValue) - parseFloat(form.baselineValue)) / parseFloat(form.baselineValue)) * 100).toFixed(1)
      : null;

  async function save() {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      if (form.baselineValue !== "") body.baselineValue = parseFloat(form.baselineValue);
      if (form.resultValue   !== "") body.resultValue   = parseFloat(form.resultValue);
      if (form.sampleSize    !== "") body.sampleSize    = parseInt(form.sampleSize, 10);
      if (form.confidence    !== "") body.confidence    = parseFloat(form.confidence);
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

  const upliftPositive = uplift !== null && parseFloat(uplift) > 0;
  const upliftNegative = uplift !== null && parseFloat(uplift) < 0;

  return (
    <div className="mt-4 rounded-2xl border bg-muted/30 p-5 space-y-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Enter Results</p>

      {/* Uplift preview */}
      {uplift !== null && (
        <div className={cn(
          "flex items-center gap-3 rounded-xl px-4 py-3",
          upliftPositive ? "bg-emerald-100 dark:bg-emerald-900/20" :
          upliftNegative ? "bg-red-100 dark:bg-red-900/20" : "bg-muted"
        )}>
          {upliftPositive
            ? <TrendingUp className="h-6 w-6 text-emerald-500 shrink-0" />
            : upliftNegative
            ? <TrendingDown className="h-6 w-6 text-red-500 shrink-0" />
            : null}
          <div>
            <p className={cn("text-xl font-bold leading-none",
              upliftPositive ? "text-emerald-600 dark:text-emerald-400" :
              upliftNegative ? "text-red-600 dark:text-red-400" : ""
            )}>
              {parseFloat(uplift) > 0 ? "+" : ""}{uplift}%
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Conversion uplift</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { key: "baselineValue" as const, label: "Baseline CVR (%)", placeholder: "e.g. 3.2" },
          { key: "resultValue"   as const, label: "Variant CVR (%)",  placeholder: "e.g. 4.1" },
          { key: "sampleSize"    as const, label: "Sample size",       placeholder: "e.g. 5000" },
          { key: "confidence"    as const, label: "Confidence (%)",    placeholder: "e.g. 95" },
        ].map(({ key, label, placeholder }) => (
          <div key={key} className="space-y-1.5">
            <Label className="text-xs">{label}</Label>
            <Input
              type="number"
              step="0.01"
              placeholder={placeholder}
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Winner</Label>
          <Select value={form.winner} onValueChange={(v) => set("winner", v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select winner" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="A">A — Control</SelectItem>
              <SelectItem value="B">B — Variant</SelectItem>
              <SelectItem value="inconclusive">Inconclusive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Key takeaway</Label>
          <Input
            placeholder="e.g. Emotional headline outperformed…"
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
  const statusCfg = STATUS_CONFIG[exp.status] ?? STATUS_CONFIG.PLANNED;

  const hasResults = exp.baselineValue != null || exp.resultValue != null;
  const uplift =
    exp.baselineValue != null && exp.resultValue != null
      ? (((exp.resultValue - exp.baselineValue) / exp.baselineValue) * 100).toFixed(1)
      : null;
  const upliftNum = uplift !== null ? parseFloat(uplift) : null;

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
    <div className="rounded-2xl border bg-card overflow-hidden hover:shadow-sm transition-shadow">
      {/* Status stripe */}
      <div className={cn("h-1 w-full", statusCfg.dot.replace("bg-", "bg-"))} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-snug mb-1">{exp.name}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", statusCfg.bg, statusCfg.text)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg.dot)} />
                {statusCfg.label}
              </span>
              <PriorityBadge priority={exp.priority} />
            </div>
          </div>

          {/* Big uplift callout */}
          {upliftNum !== null && (
            <div className={cn(
              "flex flex-col items-center justify-center rounded-xl px-3 py-2 min-w-[72px] shrink-0",
              upliftNum > 0 ? "bg-emerald-100 dark:bg-emerald-900/20" :
              upliftNum < 0 ? "bg-red-100 dark:bg-red-900/20" : "bg-muted"
            )}>
              <span className={cn("text-xl font-black leading-none",
                upliftNum > 0 ? "text-emerald-600 dark:text-emerald-400" :
                upliftNum < 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
              )}>
                {upliftNum > 0 ? "+" : ""}{uplift}%
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">uplift</span>
            </div>
          )}
        </div>

        {/* Hypothesis */}
        <div className="mb-4 rounded-xl bg-muted/40 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Hypothesis</p>
          <p className="text-sm leading-relaxed">{exp.hypothesis}</p>
        </div>

        {/* Meta grid */}
        <div className="grid gap-3 sm:grid-cols-3 mb-4 text-xs">
          <div>
            <p className="text-muted-foreground font-medium mb-1 flex items-center gap-1">
              <Target className="h-3 w-3" /> Elements
            </p>
            <div className="flex flex-wrap gap-1">
              {exp.elements.map((el, i) => (
                <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-xs">{el}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground font-medium mb-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Target Metric
            </p>
            <p>{exp.targetMetric}</p>
          </div>
          {exp.expectedImpact && (
            <div>
              <p className="text-muted-foreground font-medium mb-1">Expected Impact</p>
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold">{exp.expectedImpact}</p>
            </div>
          )}
        </div>

        {/* A vs B results summary */}
        {hasResults && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase mb-1">A — Control</p>
              <p className="text-lg font-bold">{exp.baselineValue != null ? `${exp.baselineValue}%` : "—"}</p>
            </div>
            <div className={cn("rounded-xl p-3 text-center", upliftNum !== null && upliftNum > 0 ? "bg-emerald-100 dark:bg-emerald-900/20" : "bg-muted/50")}>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase mb-1">B — Variant</p>
              <p className="text-lg font-bold">{exp.resultValue != null ? `${exp.resultValue}%` : "—"}</p>
            </div>
          </div>
        )}

        {exp.winner && (
          <div className="flex items-center gap-2 mb-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2">
            <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              Winner: {exp.winner === "A" ? "A — Control" : exp.winner === "B" ? "B — Variant" : "Inconclusive"}
            </span>
          </div>
        )}

        {exp.result && (
          <p className="text-xs text-muted-foreground italic mb-4 px-1">"{exp.result}"</p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 items-center pt-3 border-t">
          {exp.status === "PLANNED" && (
            <Button size="sm" className="h-7 text-xs gap-1.5 bg-blue-500 hover:bg-blue-600 text-white border-0" onClick={() => updateStatus("RUNNING")} disabled={updating}>
              <Play className="h-3 w-3" /> Start Test
            </Button>
          )}
          {exp.status === "RUNNING" && (
            <>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => updateStatus("PAUSED")} disabled={updating}>
                <Pause className="h-3 w-3" /> Pause
              </Button>
              <Button size="sm" className="h-7 text-xs gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white border-0" onClick={() => updateStatus("COMPLETED")} disabled={updating}>
                <CheckCircle2 className="h-3 w-3" /> Complete
              </Button>
            </>
          )}
          {exp.status === "PAUSED" && (
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => updateStatus("RUNNING")} disabled={updating}>
              <Play className="h-3 w-3" /> Resume
            </Button>
          )}

          {["RUNNING", "COMPLETED", "PAUSED"].includes(exp.status) && (
            <Button size="sm" variant="ghost" onClick={() => setShowResults((v) => !v)} className="ml-auto h-7 text-xs gap-1">
              {showResults ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {showResults ? "Hide results" : "Enter results"}
            </Button>
          )}
        </div>

        {showResults && (
          <ResultForm exp={exp} onSaved={() => window.location.reload()} />
        )}
      </div>
    </div>
  );
}

const LANE_CONFIG = [
  { key: "RUNNING",   label: "Running",   dotClass: "bg-blue-500",    count: 0, description: "Tests currently active" },
  { key: "PLANNED",   label: "Planned",   dotClass: "bg-slate-400",   count: 0, description: "Ready to be started" },
  { key: "COMPLETED", label: "Completed", dotClass: "bg-emerald-500", count: 0, description: "Finished — review results" },
] as const;

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
    RUNNING:   experiments.filter((e) => e.status === "RUNNING"),
    PLANNED:   experiments.filter((e) => e.status === "PLANNED"),
    COMPLETED: experiments.filter((e) => ["COMPLETED", "CANCELLED"].includes(e.status)),
  };

  return (
    <div className="p-6 space-y-6">

      {/* Generate */}
      {experiments.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/10 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
              <FlaskConical className="h-7 w-7 text-white" />
            </div>
          </div>
          <h2 className="text-lg font-bold mb-1">Generate A/B Experiment Ideas</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Our AI suggests data-driven A/B test hypotheses based on your store listing and analysis — ready to run.
          </p>
          {loading ? (
            <AILoadingState message="Generating experiment ideas…" />
          ) : (
            <Button onClick={generateIdeas} size="lg" className="bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 text-white border-0">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Ideas
            </Button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-xl border bg-card px-5 py-3">
          <div className="flex items-center gap-3">
            {LANE_CONFIG.map(({ key, label, dotClass }) => {
              const count = grouped[key].length;
              if (!count) return null;
              return (
                <div key={key} className="flex items-center gap-1.5 text-sm">
                  <span className={cn("h-2 w-2 rounded-full", dotClass)} />
                  <span className="font-bold">{count}</span>
                  <span className="text-muted-foreground">{label}</span>
                </div>
              );
            })}
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={generateIdeas} disabled={loading}>
            <Sparkles className="h-3.5 w-3.5" /> More Ideas
          </Button>
        </div>
      )}

      {loading && <AILoadingState message="Generating experiment ideas…" />}

      {/* Lanes */}
      {LANE_CONFIG.map(({ key, label, dotClass, description }) => {
        const group = grouped[key];
        if (!group.length) return null;
        return (
          <div key={key}>
            <div className="flex items-center gap-2 mb-3">
              <span className={cn("h-2.5 w-2.5 rounded-full", key === "RUNNING" ? "animate-pulse " + dotClass : dotClass)} />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {label} · {group.length}
              </h2>
              <span className="text-xs text-muted-foreground">— {description}</span>
            </div>
            <div className="space-y-4">
              {group.map((e) => <ExperimentCard key={e.id} exp={e} />)}
            </div>
          </div>
        );
      })}

      {experiments.length === 0 && !loading && (
        <EmptyState
          icon={FlaskConical}
          title="No experiments yet"
          description="Generate AI experiment ideas or manually track your A/B test hypotheses."
        />
      )}
    </div>
  );
}
