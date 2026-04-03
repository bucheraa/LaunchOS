"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Smartphone, Monitor, FlaskConical, TrendingUp, Clock,
  Search, FileText, Brain, Trophy, AlertTriangle, CheckCircle2,
  Plus, SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo, categoryLabel } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProjectSummary = {
  id: string;
  name: string;
  category: string;
  platform: string[];
  description?: string | null;
  updatedAt: Date;
  status: string;
  analysis?: { analysisStatus: string } | null;
  recommendations?: { id: string; title: string; priority: string; status: string }[];
  _count?: {
    listingVariants?: number;
    experiments?: number;
    recommendations?: number;
    keywordSets?: number;
  };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  PRODUCTIVITY:  "from-blue-500 to-cyan-500",
  GAMES:         "from-pink-500 to-rose-500",
  HEALTH:        "from-green-500 to-emerald-500",
  FINANCE:       "from-yellow-500 to-amber-500",
  SOCIAL:        "from-violet-500 to-purple-500",
  EDUCATION:     "from-indigo-500 to-blue-500",
  ENTERTAINMENT: "from-orange-500 to-red-500",
  UTILITIES:     "from-slate-500 to-zinc-500",
};

function getGradient(cat: string) {
  return CATEGORY_COLORS[cat] ?? "from-violet-500 to-purple-600";
}

function getAsoScore(p: ProjectSummary) {
  const variants = p._count?.listingVariants ?? 0;
  const exps     = p._count?.experiments     ?? 0;
  const openRecs = p._count?.recommendations ?? 0;
  return Math.max(10, Math.min(100, 30 + variants * 10 + exps * 15 - openRecs * 5));
}

function getHealthStatus(score: number): "launch-ready" | "in-progress" | "needs-work" {
  if (score >= 70) return "launch-ready";
  if (score >= 40) return "in-progress";
  return "needs-work";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AsoRing({ score }: { score: number }) {
  const radius = 20;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const stroke = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  const textCl = score >= 70 ? "text-emerald-600 dark:text-emerald-400" : score >= 40 ? "text-amber-600 dark:text-amber-400" : "text-red-500";
  return (
    <div className="relative flex h-[52px] w-[52px] items-center justify-center shrink-0">
      <svg className="absolute inset-0 -rotate-90" width="52" height="52" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
        <circle cx="26" cy="26" r={radius} fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div className="flex flex-col items-center leading-none">
        <span className={cn("text-sm font-black tabular-nums", textCl)}>{score}</span>
        <span className="text-[9px] text-muted-foreground font-medium">ASO</span>
      </div>
    </div>
  );
}

function HealthBadge({ score }: { score: number }) {
  if (score >= 70) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
      <Trophy className="h-2.5 w-2.5" /> Launch Ready
    </span>
  );
  if (score >= 40) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
      <TrendingUp className="h-2.5 w-2.5" /> In Progress
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:text-red-400">
      <AlertTriangle className="h-2.5 w-2.5" /> Needs Work
    </span>
  );
}

type Filter = "all" | "needs-work" | "in-progress" | "launch-ready";

// ─── Main component ───────────────────────────────────────────────────────────

export function ProjectsGrid({ projects }: { projects: ProjectSummary[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const scored = projects.map((p) => ({ ...p, score: getAsoScore(p), health: getHealthStatus(getAsoScore(p)) }));

  const counts = {
    all:           scored.length,
    "needs-work":  scored.filter((p) => p.health === "needs-work").length,
    "in-progress": scored.filter((p) => p.health === "in-progress").length,
    "launch-ready":scored.filter((p) => p.health === "launch-ready").length,
  };

  const filtered = filter === "all" ? scored : scored.filter((p) => p.health === filter);

  const TABS: { id: Filter; label: string; dotCl: string }[] = [
    { id: "all",           label: "All Apps",     dotCl: "bg-muted-foreground" },
    { id: "needs-work",    label: "Needs Work",   dotCl: "bg-red-500" },
    { id: "in-progress",   label: "In Progress",  dotCl: "bg-amber-500" },
    { id: "launch-ready",  label: "Launch Ready", dotCl: "bg-emerald-500" },
  ];

  return (
    <div className="space-y-5">
      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all border",
              filter === tab.id
                ? "bg-foreground text-background border-foreground shadow-sm"
                : "bg-muted/40 text-muted-foreground border-transparent hover:border-border hover:text-foreground"
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", tab.dotCl)} />
            {tab.label}
            <span className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
              filter === tab.id ? "bg-background/20" : "bg-muted"
            )}>
              {counts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
            <Trophy className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">No apps in this category</p>
            <p className="text-xs text-muted-foreground mt-1">All your apps have a different health status.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => {
            const gradient  = getGradient(project.category);
            const urgentRec = project.recommendations?.[0];

            const steps = [
              { label: "Analysis",    done: project.analysis?.analysisStatus === "COMPLETED" },
              { label: "Keywords",    done: (project._count?.keywordSets ?? 0) > 0 },
              { label: "Store Copy",  done: (project._count?.listingVariants ?? 0) > 0 },
              { label: "Experiments", done: (project._count?.experiments ?? 0) > 0 },
            ];
            const stepsDone = steps.filter((s) => s.done).length;
            const nextStep  = steps.find((s) => !s.done);

            return (
              <Link key={project.id} href={`/projects/${project.id}`} className="group">
                <div className="rounded-2xl border bg-card hover:shadow-lg hover:shadow-black/5 hover:border-primary/30 transition-all duration-200 overflow-hidden h-full flex flex-col">

                  {/* Top color stripe */}
                  <div className={`h-1 w-full bg-gradient-to-r ${gradient}`} />

                  <div className="p-5 flex flex-col gap-4 flex-1">

                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white font-bold text-lg shadow-sm`}>
                          {project.name.charAt(0)}
                        </div>
                        <div className="min-w-0 pt-0.5">
                          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">{project.name}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            {project.platform.includes("IOS") && <Smartphone className="h-3 w-3 shrink-0" />}
                            {project.platform.includes("ANDROID") && <Monitor className="h-3 w-3 shrink-0" />}
                            {categoryLabel(project.category)}
                          </p>
                          <div className="mt-1.5">
                            <HealthBadge score={project.score} />
                          </div>
                        </div>
                      </div>
                      <AsoRing score={project.score} />
                    </div>

                    {/* Launch readiness */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Launch Readiness</p>
                        <p className="text-[10px] font-semibold text-muted-foreground">{stepsDone}/4</p>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {steps.map((step, i) => (
                          <div key={i} className="space-y-1">
                            <div className={cn("h-1 rounded-full", step.done ? "bg-emerald-500" : "bg-muted")} />
                            <p className={cn("text-[9px] font-medium text-center", step.done ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/70")}>
                              {step.done ? "✓" : "○"} {step.label.split(" ")[0]}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendation / next-step callout */}
                    {urgentRec ? (
                      <div className="rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 px-3 py-2 flex items-start gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-orange-700 dark:text-orange-300 line-clamp-2 leading-snug font-medium">{urgentRec.title}</p>
                      </div>
                    ) : stepsDone === 4 ? (
                      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 px-3 py-2 flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">All launch steps complete!</p>
                      </div>
                    ) : nextStep ? (
                      <div className="rounded-lg bg-muted/40 border border-dashed px-3 py-2 flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">
                          Next: <span className="font-semibold text-foreground">{nextStep.label}</span>
                        </span>
                      </div>
                    ) : null}

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t pt-3 mt-auto">
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1" title="Store listings">
                          <TrendingUp className="h-3 w-3" />{project._count?.listingVariants ?? 0}
                        </span>
                        <span className="flex items-center gap-1" title="Experiments">
                          <FlaskConical className="h-3 w-3" />{project._count?.experiments ?? 0}
                        </span>
                        {(project._count?.recommendations ?? 0) > 0 && (
                          <span className="flex items-center gap-1 text-orange-500 font-semibold">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
                            {project._count?.recommendations} action{(project._count?.recommendations ?? 0) !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />{timeAgo(project.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Add new project card */}
          <Link href="/projects/new" className="group">
            <div className="rounded-2xl border-2 border-dashed bg-muted/10 hover:border-primary hover:bg-primary/5 transition-all duration-200 h-full min-h-[280px] flex flex-col items-center justify-center gap-4 p-5 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 group-hover:from-violet-500/20 group-hover:to-purple-500/20 transition-colors border border-violet-200 dark:border-violet-800 group-hover:border-violet-400">
                <Plus className="h-6 w-6 text-violet-500 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">New Project</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[160px]">Add an app and AI generates your full launch kit automatically</p>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {["AI Analysis", "Keywords", "Store Copy", "A/B Tests"].map((f) => (
                  <span key={f} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{f}</span>
                ))}
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
