"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AILoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Sparkles, ImageIcon, Download, Loader2, Smartphone, Monitor, Target, Star, Users, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { platformLabel, cn } from "@/lib/utils";
import type { ProjectWithRelations, ScreenItem, ScreenshotPlanData, ScreenshotMockupData } from "@/types";

// ─── Screen type config ───────────────────────────────────────────────────────

const SCREEN_TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  hero:         { label: "Hero",         color: "bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400 border-violet-200 dark:border-violet-800",  icon: Star },
  feature:      { label: "Feature",      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800",              icon: Target },
  social_proof: { label: "Social Proof", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800", icon: Users },
  cta:          { label: "CTA",          color: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800", icon: ArrowRight },
};

// ─── Screen card ──────────────────────────────────────────────────────────────

function ScreenCard({ screen, total }: { screen: ScreenItem; total: number }) {
  const cfg = SCREEN_TYPE_CONFIG[screen.screenType] ?? { label: screen.screenType, color: "bg-muted text-muted-foreground border-border", icon: ImageIcon };
  const Icon = cfg.icon;

  return (
    <div className="flex gap-4 rounded-2xl border bg-card p-4 hover:shadow-sm transition-shadow">
      {/* Step bubble */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold text-sm shadow-sm">
          {screen.order}
        </div>
        {screen.order < total && (
          <div className="w-0.5 h-4 bg-border rounded-full" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm leading-tight">{screen.headline}</h3>
          <span className={cn("shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold", cfg.color)}>
            <Icon className="h-2.5 w-2.5" />
            {cfg.label}
          </span>
        </div>
        {screen.subtext && (
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{screen.subtext}</p>
        )}
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="rounded-lg bg-muted/60 px-2.5 py-1">
            <span className="font-medium text-muted-foreground">Feature: </span>
            <span>{screen.feature}</span>
          </div>
          <div className="rounded-lg bg-muted/60 px-2.5 py-1">
            <span className="font-medium text-muted-foreground">Goal: </span>
            <span>{screen.goal}</span>
          </div>
          <div className="rounded-lg bg-muted/60 px-2.5 py-1">
            <span className="font-medium text-muted-foreground">Style: </span>
            <span>{screen.backgroundHint}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mockup grid ──────────────────────────────────────────────────────────────

function MockupGrid({ mockups }: { mockups: ScreenshotMockupData[] }) {
  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {mockups.map((m) => (
        <div key={m.id} className="group relative rounded-2xl overflow-hidden border bg-muted shadow-sm hover:shadow-md transition-shadow">
          <img
            src={m.imageUrl}
            alt={m.headline ?? `Screen ${m.screenIndex + 1}`}
            className="w-full object-cover"
          />
          {/* Screen number */}
          <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white text-[10px] font-bold">
            {m.screenIndex + 1}
          </div>
          {/* Download overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
            <div className="w-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <a
                href={m.imageUrl}
                download={`screen-${m.screenIndex + 1}.png`}
                className="flex items-center justify-center gap-1 w-full rounded-xl bg-white/90 py-1.5 text-xs font-semibold text-black"
              >
                <Download className="h-3 w-3" /> Download
              </a>
            </div>
          </div>
          {m.headline && (
            <div className="p-2 bg-card border-t">
              <p className="text-xs font-semibold truncate">{m.headline}</p>
              {m.screenType && (
                <p className="text-[10px] text-muted-foreground capitalize">{m.screenType.replace("_", " ")}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({ plan, projectId, existingMockups }: { plan: ScreenshotPlanData; projectId: string; existingMockups: ScreenshotMockupData[] }) {
  const [generating, setGenerating] = useState(false);
  const planMockups = existingMockups.filter((m) => m.screenshotPlanId === plan.id);
  const isIOS = plan.platform === "IOS";

  async function generateMockups() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/screenshots/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenshotPlanId: plan.id, batch: true }),
      });
      if (!res.ok) {
        const json = await res.json();
        toast({ title: "Generation failed", description: json.error, variant: "destructive" });
        return;
      }
      const json = await res.json();
      toast({ title: `Generated ${json.count} mockup${json.count !== 1 ? "s" : ""}!` });
      window.location.reload();
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-card overflow-hidden hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", isIOS ? "bg-slate-800" : "bg-emerald-600")}>
            {isIOS ? <Smartphone className="h-4 w-4 text-white" /> : <Monitor className="h-4 w-4 text-white" />}
          </div>
          <div>
            <p className="text-sm font-semibold">{plan.name}</p>
            <p className="text-xs text-muted-foreground">
              {platformLabel(plan.platform)} · {plan.locale.toUpperCase()} · {plan.screens.length} screens
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={plan.status} />
          {plan.screens.length > 0 && (
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={generateMockups} disabled={generating}>
              {generating
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <ImageIcon className="h-3.5 w-3.5 text-violet-500" />}
              {generating ? "Rendering…" : "Generate Mockups"}
            </Button>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Generated mockups */}
        {planMockups.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <ImageIcon className="h-3.5 w-3.5" />
              Generated Mockups · {planMockups.length}
            </p>
            <MockupGrid mockups={planMockups} />
          </div>
        )}

        {/* Screen sequence */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
            <Target className="h-3.5 w-3.5" />
            Screen Sequence · {plan.screens.length} screens
          </p>
          <div className="space-y-0">
            {plan.screens.map((screen, i) => (
              <ScreenCard key={i} screen={screen} total={plan.screens.length} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

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

  const plans   = project.screenshotPlans   ?? [];
  const mockups = project.screenshotMockups ?? [];

  return (
    <div className="p-6 space-y-6">

      {/* Generator */}
      {plans.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/10 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
              <ImageIcon className="h-7 w-7 text-white" />
            </div>
          </div>
          <h2 className="text-lg font-bold mb-1">Generate Screenshot Plan</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            AI creates a conversion-optimised screenshot sequence with headlines, goals and backgrounds — then renders the mockups for you.
          </p>
          <div className="max-w-sm mx-auto space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 text-left">
                <Label className="text-xs font-semibold">Platform</Label>
                <Select value={platform} onValueChange={(v) => setPlatform(v as "IOS" | "ANDROID")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {project.platform.map((p) => (
                      <SelectItem key={p} value={p}>{platformLabel(p)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 text-left">
                <Label className="text-xs font-semibold">Plan name</Label>
                <Input placeholder="e.g. iOS v1" value={planName} onChange={(e) => setPlanName(e.target.value)} />
              </div>
            </div>
            {loading ? (
              <AILoadingState message="Planning your screenshots…" />
            ) : (
              <Button onClick={generate} size="lg" className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 border-0">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Plan
              </Button>
            )}
          </div>

          {/* What you get */}
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-sm mx-auto text-xs">
            {[
              { icon: "🎯", label: "Conversion-optimised sequence" },
              { icon: "🖼️", label: "AI-rendered PNG mockups" },
              { icon: "📲", label: "Upload-ready for App Store" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1 rounded-xl bg-white/60 dark:bg-white/5 border border-violet-200/50 dark:border-violet-800/50 p-3">
                <span className="text-lg">{icon}</span>
                <span className="text-muted-foreground text-center leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Compact generator when plans exist */
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-violet-500/10 p-1.5">
                <Sparkles className="h-4 w-4 text-violet-500" />
              </div>
              <p className="text-sm font-semibold">Generate New Plan</p>
            </div>
          </div>
          <div className="p-5">
            <div className="flex gap-3 items-end flex-wrap">
              <div className="space-y-1.5 min-w-[140px]">
                <Label className="text-xs font-semibold">Platform</Label>
                <Select value={platform} onValueChange={(v) => setPlatform(v as "IOS" | "ANDROID")}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {project.platform.map((p) => (
                      <SelectItem key={p} value={p}>{platformLabel(p)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 flex-1 min-w-[160px]">
                <Label className="text-xs font-semibold">Plan name</Label>
                <Input className="h-9" placeholder="e.g. iOS Performance v2" value={planName} onChange={(e) => setPlanName(e.target.value)} />
              </div>
              {loading ? (
                <AILoadingState message="Planning…" />
              ) : (
                <Button onClick={generate} className="h-9 gap-2 shrink-0">
                  <Sparkles className="h-3.5 w-3.5" /> Generate
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plans */}
      {plans.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">
            {plans.length} plan{plans.length !== 1 ? "s" : ""}
          </p>
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan as ScreenshotPlanData} projectId={project.id} existingMockups={mockups} />
          ))}
        </div>
      )}

      {plans.length === 0 && !loading && (
        <EmptyState
          icon={ImageIcon}
          title="No screenshot plans yet"
          description="Generate a plan above to get a structured sequence of conversion-optimised screenshots."
        />
      )}
    </div>
  );
}
