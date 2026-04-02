"use client";

import { useState } from "react";
import { Rocket, CheckCircle2, Loader2, Sparkles, Search, FileText, Lightbulb, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  status: "idle" | "running" | "done" | "error";
}

const INITIAL_STEPS: Step[] = [
  { id: "analysis",        label: "AI product analysis",        description: "Audience personas, value props, messaging angles",    icon: Sparkles,  status: "idle" },
  { id: "keywords",        label: "Keyword research",           description: "High-volume, low-competition keywords",               icon: Search,    status: "idle" },
  { id: "store-copy",      label: "Store copy generation",      description: "Optimised title, subtitle & description",            icon: FileText,  status: "idle" },
  { id: "recommendations", label: "AI recommendations",         description: "Prioritised growth actions",                         icon: Lightbulb, status: "idle" },
];

interface LaunchKitButtonProps {
  projectId: string;
  platform: string[];
  hasAnalysis: boolean;
  hasKeywords: boolean;
  hasVariants: boolean;
  hasRecommendations: boolean;
}

export function LaunchKitButton({
  projectId,
  platform,
  hasAnalysis,
  hasKeywords,
  hasVariants,
  hasRecommendations,
}: LaunchKitButtonProps) {
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<Step[]>(
    INITIAL_STEPS.map((s) => ({
      ...s,
      status:
        (s.id === "analysis"        && hasAnalysis)        ? "done" :
        (s.id === "keywords"        && hasKeywords)        ? "done" :
        (s.id === "store-copy"      && hasVariants)        ? "done" :
        (s.id === "recommendations" && hasRecommendations) ? "done" :
        "idle",
    }))
  );
  const [showSteps, setShowSteps] = useState(false);

  const allDone = steps.every((s) => s.status === "done");
  const anyIdle = steps.some((s) => s.status === "idle");
  const firstPlatform = platform.includes("IOS") ? "IOS" : "ANDROID";

  function setStepStatus(id: string, status: Step["status"]) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  }

  async function runKit() {
    setRunning(true);
    setShowSteps(true);

    try {
      // 1. Analysis
      if (steps.find((s) => s.id === "analysis")?.status !== "done") {
        setStepStatus("analysis", "running");
        const res = await fetch(`/api/projects/${projectId}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (res.ok) {
          setStepStatus("analysis", "done");
        } else {
          setStepStatus("analysis", "error");
          toast({ title: "Analysis failed", variant: "destructive" });
        }
      }

      // 2. Keywords
      if (steps.find((s) => s.id === "keywords")?.status !== "done") {
        setStepStatus("keywords", "running");
        const res = await fetch(`/api/projects/${projectId}/keywords`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platform: firstPlatform }),
        });
        if (res.ok) {
          setStepStatus("keywords", "done");
        } else {
          setStepStatus("keywords", "error");
        }
      }

      // 3. Store copy
      if (steps.find((s) => s.id === "store-copy")?.status !== "done") {
        setStepStatus("store-copy", "running");
        const res = await fetch(`/api/projects/${projectId}/store-copy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platform: firstPlatform, locale: "en", variantName: "Launch Kit v1" }),
        });
        if (res.ok) {
          setStepStatus("store-copy", "done");
        } else {
          setStepStatus("store-copy", "error");
        }
      }

      // 4. Recommendations
      if (steps.find((s) => s.id === "recommendations")?.status !== "done") {
        setStepStatus("recommendations", "running");
        const res = await fetch(`/api/projects/${projectId}/recommendations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (res.ok) {
          setStepStatus("recommendations", "done");
        } else {
          setStepStatus("recommendations", "error");
        }
      }

      toast({ title: "🚀 Launch Kit ready!", description: "Your full ASO kit has been generated." });
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setRunning(false);
    }
  }

  if (allDone) return null;

  return (
    <div className="rounded-2xl border-2 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-500/5 to-purple-500/5 overflow-hidden">
      {/* Banner */}
      <div className="px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold">One-Click Launch Kit</p>
            <p className="text-xs text-muted-foreground">
              Generate analysis, keywords, store copy &amp; recommendations automatically
            </p>
          </div>
        </div>
        <Button
          onClick={runKit}
          disabled={running}
          className="shrink-0 bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 border-0 gap-2"
        >
          {running
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Sparkles className="h-4 w-4" />}
          {running ? "Generating…" : "Generate All"}
        </Button>
      </div>

      {/* Steps (shown while running or after) */}
      {showSteps && (
        <div className="border-t divide-y">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-center gap-3 px-5 py-3">
                {/* Status icon */}
                <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all",
                  step.status === "done"    ? "bg-emerald-500"            :
                  step.status === "running" ? "bg-violet-500"             :
                  step.status === "error"   ? "bg-red-500"                :
                  "bg-muted"
                )}>
                  {step.status === "done"    && <CheckCircle2 className="h-4 w-4 text-white" />}
                  {step.status === "running" && <Loader2 className="h-4 w-4 text-white animate-spin" />}
                  {step.status === "error"   && <AlertTriangle className="h-4 w-4 text-white" />}
                  {step.status === "idle"    && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p className={cn("text-xs font-semibold",
                    step.status === "done"    ? "text-emerald-600 dark:text-emerald-400" :
                    step.status === "running" ? "text-violet-600 dark:text-violet-400"   :
                    step.status === "error"   ? "text-red-500"                           :
                    "text-muted-foreground"
                  )}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{step.description}</p>
                </div>
                {/* Status badge */}
                <span className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5 shrink-0",
                  step.status === "done"    ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" :
                  step.status === "running" ? "bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 animate-pulse" :
                  step.status === "error"   ? "bg-red-100 dark:bg-red-900/20 text-red-600" :
                  "bg-muted text-muted-foreground"
                )}>
                  {step.status === "done"    ? "Done"    :
                   step.status === "running" ? "Running" :
                   step.status === "error"   ? "Error"   :
                   "Waiting"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
