"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AILoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Sparkles, CheckCircle2, Users, MessageSquare, Zap, Target, TrendingUp,
  HeartHandshake, AlertCircle, RefreshCw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { ProjectWithRelations } from "@/types";
import { cn } from "@/lib/utils";

const SEGMENT_COLORS = [
  { from: "from-violet-400",  to: "to-purple-500",  bg: "bg-violet-500/10",   text: "text-violet-600 dark:text-violet-400",  pain: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400",    goal: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400" },
  { from: "from-blue-400",    to: "to-cyan-500",    bg: "bg-blue-500/10",     text: "text-blue-600 dark:text-blue-400",      pain: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400",    goal: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400" },
  { from: "from-emerald-400", to: "to-teal-500",    bg: "bg-emerald-500/10",  text: "text-emerald-600 dark:text-emerald-400",pain: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400",    goal: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400" },
  { from: "from-orange-400",  to: "to-amber-500",   bg: "bg-orange-500/10",   text: "text-orange-600 dark:text-orange-400",  pain: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400",    goal: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400" },
];

const ANGLE_ICONS: Record<string, React.ElementType> = {
  EMOTIONAL:    HeartHandshake,
  FUNCTIONAL:   Zap,
  SOCIAL:       Users,
  AUTHORITY:    Target,
  SCARCITY:     AlertCircle,
  CURIOSITY:    Sparkles,
  PROBLEM:      AlertCircle,
  SOLUTION:     CheckCircle2,
};

export function ProjectAnalysisTab({ project }: { project: ProjectWithRelations }) {
  const [loading, setLoading] = useState(false);
  const [extraContext, setExtraContext] = useState("");

  async function runAnalysis() {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ additionalContext: extraContext }),
      });
      if (!res.ok) {
        const json = await res.json();
        toast({ title: "Analysis failed", description: json.error, variant: "destructive" });
        return;
      }
      toast({ title: "Analysis complete!", description: "Audience segments and messaging angles generated." });
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  const analysis = project.analysis;
  const hasAnalysis = analysis?.analysisStatus === "COMPLETED";

  return (
    <div className="p-6 space-y-6">

      {/* Run / Re-run Analysis */}
      {!hasAnalysis ? (
        <div className="rounded-2xl border-2 border-dashed border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-500/5 to-purple-500/5 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-lg font-bold mb-1">Run AI Analysis</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Our AI analyses your app description to surface audience personas, value propositions and compelling messaging angles.
          </p>
          <div className="max-w-md mx-auto space-y-4">
            {loading ? (
              <AILoadingState message="Analysing your app — this takes about 30 seconds…" />
            ) : (
              <>
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="context" className="text-xs font-medium">Additional context <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Textarea
                    id="context"
                    placeholder="e.g. competitor apps, user feedback, target market, unique features…"
                    rows={3}
                    value={extraContext}
                    onChange={(e) => setExtraContext(e.target.value)}
                    className="resize-none"
                  />
                </div>
                <Button onClick={runAnalysis} size="lg" className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyse with AI
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-5 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium">Analysis complete</span>
          </div>
          <Button variant="ghost" size="sm" onClick={runAnalysis} disabled={loading} className="gap-1.5 text-xs">
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Re-analyse
          </Button>
        </div>
      )}

      {hasAnalysis && (
        <>
          {/* Product Summary */}
          <Card className="overflow-hidden">
            <CardHeader className="py-4 px-5 border-b bg-muted/30">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="rounded-lg bg-violet-500/10 p-1.5">
                  <Zap className="h-4 w-4 text-violet-500" />
                </div>
                Product Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <p className="text-sm leading-relaxed text-muted-foreground">{analysis.productSummary}</p>
              {analysis.keyDifferentiators.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Key Differentiators</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {analysis.keyDifferentiators.map((d, i) => (
                      <div key={i} className="flex items-start gap-2.5 rounded-xl border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 p-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audience Segments */}
          {(project.audienceSegments?.length ?? 0) > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" /> Audience Personas
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {project.audienceSegments?.map((seg, idx) => {
                  const c = SEGMENT_COLORS[idx % SEGMENT_COLORS.length];
                  return (
                    <div key={seg.id} className="rounded-2xl border bg-card overflow-hidden">
                      <div className={`h-1.5 bg-gradient-to-r ${c.from} ${c.to}`} />
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${c.from} ${c.to} text-white font-bold`}>
                            {seg.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold">{seg.name}</p>
                              {seg.isPrimary && (
                                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", c.bg, c.text)}>
                                  Primary
                                </span>
                              )}
                            </div>
                            {seg.demographics && <p className="text-xs text-muted-foreground">{seg.demographics}</p>}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{seg.description}</p>
                        <div className="grid grid-cols-2 gap-3">
                          {seg.painPoints.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-rose-500 uppercase tracking-wide mb-1.5">Pain Points</p>
                              <div className="flex flex-col gap-1">
                                {seg.painPoints.slice(0, 3).map((p, i) => (
                                  <span key={i} className={cn("rounded-lg border px-2 py-0.5 text-[11px]", c.pain)}>{p}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {seg.goals.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-1.5">Goals</p>
                              <div className="flex flex-col gap-1">
                                {seg.goals.slice(0, 3).map((g, i) => (
                                  <span key={i} className={cn("rounded-lg border px-2 py-0.5 text-[11px]", c.goal)}>{g}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Value Props */}
          {(project.valuePropitions?.length ?? 0) > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Value Propositions
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {project.valuePropitions?.map((vp, i) => (
                  <div key={vp.id} className="rounded-2xl border bg-card p-4 space-y-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                      <Target className="h-4 w-4 text-violet-500" />
                    </div>
                    <p className="text-sm font-semibold leading-snug">{vp.headline}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{vp.description}</p>
                    <span className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      ✓ {vp.benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messaging Angles */}
          {(project.messagingAngles?.length ?? 0) > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Messaging Angles
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {project.messagingAngles?.map((angle) => {
                  const AngleIcon = ANGLE_ICONS[angle.angle] ?? Sparkles;
                  return (
                    <div key={angle.id} className="rounded-2xl border bg-card overflow-hidden">
                      <div className="px-5 py-4 border-b bg-muted/30 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="rounded-lg bg-violet-500/10 p-1.5">
                            <AngleIcon className="h-3.5 w-3.5 text-violet-500" />
                          </div>
                          <span className="text-xs font-semibold capitalize">{angle.angle?.toLowerCase()}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground bg-muted rounded-full px-2 py-0.5 capitalize">
                          {angle.tone}
                        </span>
                      </div>
                      <div className="p-5">
                        <p className="text-base font-bold leading-snug mb-1">{angle.headline}</p>
                        {angle.subheadline && (
                          <p className="text-sm text-muted-foreground mb-3">{angle.subheadline}</p>
                        )}
                        {angle.bodyText && (
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{angle.bodyText}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {!hasAnalysis && !loading && (
        <EmptyState
          icon={Sparkles}
          title="No analysis yet"
          description="Run the AI analysis above to discover audience segments, value propositions, and messaging angles."
        />
      )}
    </div>
  );
}
