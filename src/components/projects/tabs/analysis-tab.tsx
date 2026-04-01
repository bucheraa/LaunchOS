"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AILoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Sparkles, CheckCircle2, Users, MessageSquare, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { ProjectWithRelations } from "@/types";

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
      {/* Run Analysis Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">AI Product Analysis</CardTitle>
          <CardDescription>
            Analyze your app to extract audience segments, value propositions, and messaging angles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasAnalysis && (
            <div className="space-y-1.5">
              <Label htmlFor="context">Additional context (optional)</Label>
              <Textarea
                id="context"
                placeholder="Any extra context — competitor apps, specific user feedback, market research..."
                rows={3}
                value={extraContext}
                onChange={(e) => setExtraContext(e.target.value)}
              />
            </div>
          )}

          {loading ? (
            <AILoadingState message="Analyzing your app..." />
          ) : (
            <Button onClick={runAnalysis} disabled={loading}>
              <Sparkles className="mr-2 h-4 w-4" />
              {hasAnalysis ? "Re-analyze" : "Run Analysis"}
            </Button>
          )}
        </CardContent>
      </Card>

      {hasAnalysis && (
        <>
          {/* Product Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Product Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{analysis.productSummary}</p>
              {analysis.keyDifferentiators.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Key Differentiators</p>
                  <ul className="space-y-1.5">
                    {analysis.keyDifferentiators.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audience Segments */}
          {(project.audienceSegments?.length ?? 0) > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Audience Segments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {project.audienceSegments?.map((seg) => (
                    <div key={seg.id} className="px-6 py-5">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm">{seg.name}</h3>
                        {seg.isPrimary && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{seg.description}</p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {seg.painPoints.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1.5">Pain Points</p>
                            <ul className="space-y-1">
                              {seg.painPoints.map((p, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                  <span className="mt-1.5 h-1 w-1 rounded-full bg-destructive shrink-0" />
                                  {p}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {seg.goals.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1.5">Goals</p>
                            <ul className="space-y-1">
                              {seg.goals.map((g, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                  <span className="mt-1.5 h-1 w-1 rounded-full bg-green-500 shrink-0" />
                                  {g}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      {seg.demographics && (
                        <p className="text-xs text-muted-foreground mt-3 italic">{seg.demographics}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Value Props */}
          {(project.valuePropitions?.length ?? 0) > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Value Propositions</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {project.valuePropitions?.map((vp) => (
                    <div key={vp.id} className="px-6 py-4">
                      <h3 className="font-semibold text-sm mb-1">{vp.headline}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{vp.description}</p>
                      <span className="inline-block rounded-full bg-green-100 dark:bg-green-900/20 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                        {vp.benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Messaging Angles */}
          {(project.messagingAngles?.length ?? 0) > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Messaging Angles
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {project.messagingAngles?.map((angle) => (
                    <div key={angle.id} className="px-6 py-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                          {angle.angle}
                        </span>
                        <span className="text-xs text-muted-foreground">{angle.tone}</span>
                      </div>
                      <h3 className="font-bold text-base mb-1">{angle.headline}</h3>
                      {angle.subheadline && (
                        <p className="text-sm text-muted-foreground mb-2">{angle.subheadline}</p>
                      )}
                      {angle.bodyText && (
                        <p className="text-sm leading-relaxed">{angle.bodyText}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!hasAnalysis && !loading && (
        <EmptyState
          icon={Sparkles}
          title="No analysis yet"
          description="Run the AI analysis to discover audience segments, value propositions, and messaging angles."
        />
      )}
    </div>
  );
}
