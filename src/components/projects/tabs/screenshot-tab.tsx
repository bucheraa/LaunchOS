"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AILoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Sparkles, ImageIcon, Monitor, Smartphone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { platformLabel, cn } from "@/lib/utils";
import type { ProjectWithRelations, ScreenItem, ScreenshotPlanData } from "@/types";

const SCREEN_TYPE_COLORS = {
  hero: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  feature: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  social_proof: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  cta: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
};

function ScreenCard({ screen, index }: { screen: ScreenItem; index: number }) {
  return (
    <div className="flex gap-4 rounded-lg border bg-card p-4">
      {/* Screen number */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted font-bold text-lg text-muted-foreground">
        {screen.order}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm leading-tight">{screen.headline}</h3>
          <span className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
            SCREEN_TYPE_COLORS[screen.screenType as keyof typeof SCREEN_TYPE_COLORS] ?? "bg-muted text-muted-foreground"
          )}>
            {screen.screenType.replace("_", " ")}
          </span>
        </div>
        {screen.subtext && (
          <p className="text-sm text-muted-foreground mb-2">{screen.subtext}</p>
        )}
        <div className="grid gap-2 sm:grid-cols-3 text-xs">
          <div>
            <span className="font-medium text-muted-foreground">Feature: </span>
            {screen.feature}
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Goal: </span>
            {screen.goal}
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Background: </span>
            {screen.backgroundHint}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: ScreenshotPlanData }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm">{plan.name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {platformLabel(plan.platform)} · {plan.locale.toUpperCase()} · {plan.screens.length} screens
            </p>
          </div>
          <StatusBadge status={plan.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {plan.screens.map((screen, i) => (
          <ScreenCard key={i} screen={screen} index={i} />
        ))}
      </CardContent>
    </Card>
  );
}

export function ProjectScreenshotTab({ project }: { project: ProjectWithRelations }) {
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState<"IOS" | "ANDROID">(
    project.platform.includes("IOS") ? "IOS" : "ANDROID"
  );
  const [planName, setPlanName] = useState("");

  async function generate() {
    if (!planName) {
      toast({ title: "Enter a plan name", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/screenshots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, planName }),
      });
      if (!res.ok) {
        const json = await res.json();
        toast({ title: "Generation failed", description: json.error, variant: "destructive" });
        return;
      }
      toast({ title: "Screenshot plan generated!" });
      setPlanName("");
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  const plans = project.screenshotPlans ?? [];

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Generate Screenshot Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Platform</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as "IOS" | "ANDROID")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {project.platform.map((p) => (
                    <SelectItem key={p} value={p}>{platformLabel(p)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Plan name</Label>
              <Input
                placeholder="e.g. iOS Performance v1"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <AILoadingState message="Planning your screenshots..." />
          ) : (
            <Button onClick={generate} disabled={loading}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Plan
            </Button>
          )}
        </CardContent>
      </Card>

      {plans.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No screenshot plans yet"
          description="Generate a plan to get a structured sequence of screenshots with headlines and conversion goals."
        />
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan as ScreenshotPlanData} />
          ))}
        </div>
      )}
    </div>
  );
}
