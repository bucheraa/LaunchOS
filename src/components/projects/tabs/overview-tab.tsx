import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate, timeAgo } from "@/lib/utils";
import type { ProjectWithRelations } from "@/types";
import {
  Lightbulb, FlaskConical, FileText, Users, CheckCircle2, Circle,
  Sparkles, Search, Target, TrendingUp, ArrowRight, BarChart3,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// ─── ASO Health Score ────────────────────────────────────────────────────────

function AsoScoreRing({ score }: { score: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  const color =
    score >= 70 ? "#22c55e" :
    score >= 40 ? "#f59e0b" :
    "#ef4444";

  const label =
    score >= 70 ? "Great"  :
    score >= 40 ? "Fair"   :
    "Needs work";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <svg width="108" height="108" className="-rotate-90">
          <circle cx="54" cy="54" r={radius} strokeWidth="8" className="stroke-muted fill-none" />
          <circle
            cx="54" cy="54" r={radius}
            strokeWidth="8"
            fill="none"
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold leading-none">{score}</span>
          <span className="text-[10px] text-muted-foreground font-medium">/100</span>
        </div>
      </div>
      <span className="text-xs font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

// ─── Setup Checklist ─────────────────────────────────────────────────────────

interface Step {
  id: string;
  label: string;
  description: string;
  done: boolean;
  icon: React.ElementType;
  href: string;
  tab?: string;
}

function SetupJourney({ project, steps }: { project: ProjectWithRelations; steps: Step[] }) {
  const doneCount = steps.filter((s) => s.done).length;
  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-violet-500/10 p-1.5">
            <Target className="h-4 w-4 text-violet-500" />
          </div>
          <div>
            <p className="text-sm font-semibold">Launch Readiness</p>
            <p className="text-xs text-muted-foreground">{doneCount} of {steps.length} steps complete</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{pct}%</span>
          <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
      {/* Steps */}
      <div className="divide-y">
        {steps.map((step, idx) => (
          <Link
            key={step.id}
            href={step.href}
            className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors group"
          >
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
              step.done
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-muted-foreground/30 text-muted-foreground group-hover:border-violet-400"
            }`}>
              {step.done
                ? <CheckCircle2 className="h-4 w-4" />
                : <span className="text-xs font-bold">{idx + 1}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${step.done ? "line-through text-muted-foreground" : ""}`}>
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
            {!step.done && (
              <div className="flex items-center gap-1 text-xs text-violet-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Start <ArrowRight className="h-3 w-3" />
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Persona Card ─────────────────────────────────────────────────────────────

const SEGMENT_COLORS = [
  "from-violet-400 to-purple-500",
  "from-blue-400 to-cyan-500",
  "from-emerald-400 to-teal-500",
  "from-orange-400 to-amber-500",
  "from-rose-400 to-pink-500",
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProjectOverviewTab({ project }: { project: ProjectWithRelations }) {
  const openRecs  = project.recommendations?.filter((r) => r.status === "OPEN") ?? [];
  const runningExps = project.experiments?.filter((e) => e.status === "RUNNING") ?? [];
  const hasAnalysis  = project.analysis?.analysisStatus === "COMPLETED";
  const hasVariants  = (project.listingVariants?.length ?? 0) > 0;
  const hasExps      = (project.experiments?.length ?? 0) > 0;
  const hasKeywords  = (project.keywordSets?.length ?? 0) > 0;
  const hasRecs      = (project.recommendations?.length ?? 0) > 0;
  const hasCompetitors = (project.competitors?.length ?? 0) > 0;

  // ASO score heuristic
  const scoreFactors = [
    hasAnalysis    ? 20 : 0,
    hasVariants    ? 20 : 0,
    hasKeywords    ? 20 : 0,
    hasExps        ? 20 : 0,
    hasCompetitors ? 10 : 0,
    hasRecs && openRecs.length === 0 ? 10 : (hasRecs ? 5 : 0),
  ];
  const asoScore = scoreFactors.reduce((a, b) => a + b, 0);

  const setupSteps: Step[] = [
    {
      id: "analysis",
      label: "Run AI analysis",
      description: "Discover audience segments, value props & messaging angles",
      done: hasAnalysis,
      icon: Sparkles,
      href: `/projects/${project.id}?tab=analysis`,
    },
    {
      id: "keywords",
      label: "Research keywords",
      description: "Find high-volume, low-competition keywords for your listing",
      done: hasKeywords,
      icon: Search,
      href: `/projects/${project.id}?tab=store-copy`,
    },
    {
      id: "store-copy",
      label: "Generate store copy",
      description: "Create optimised title, subtitle and description variants",
      done: hasVariants,
      icon: FileText,
      href: `/projects/${project.id}?tab=store-copy`,
    },
    {
      id: "competitors",
      label: "Add competitors",
      description: "Track competitors and extract keyword insights",
      done: hasCompetitors,
      icon: Users,
      href: `/projects/${project.id}?tab=competitors`,
    },
    {
      id: "experiments",
      label: "Plan A/B experiments",
      description: "Test variants to continuously improve conversion",
      done: hasExps,
      icon: FlaskConical,
      href: `/projects/${project.id}?tab=experiments`,
    },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* Top row: ASO score + stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* ASO score card */}
        <Card className="lg:col-span-1 flex flex-col items-center justify-center p-5 bg-gradient-to-br from-violet-500/5 to-purple-500/5 border-violet-200/50 dark:border-violet-800/50">
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">ASO Score</p>
          <AsoScoreRing score={asoScore} />
        </Card>

        {/* Stat cards */}
        {[
          { label: "Audience Segments", value: project.audienceSegments?.length ?? 0, icon: Users,        color: "text-blue-500",   bg: "bg-blue-500/10"   },
          { label: "Store Variants",    value: project.listingVariants?.length  ?? 0, icon: FileText,     color: "text-emerald-500",bg: "bg-emerald-500/10"},
          { label: "Running Tests",     value: runningExps.length,                    icon: FlaskConical, color: "text-violet-500", bg: "bg-violet-500/10" },
          { label: "Open Actions",      value: openRecs.length,                       icon: Lightbulb,    color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <CardContent className="p-0">
              <div className={`inline-flex rounded-lg p-2 mb-3 ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-5">

        {/* Setup Journey (left, wider) */}
        <div className="lg:col-span-3">
          <SetupJourney project={project} steps={setupSteps} />
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">

          {/* About */}
          <Card>
            <CardHeader className="py-4 px-5 border-b bg-muted/30">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                About this app
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                {project.description}
              </p>
              {project.mainFeatures.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Key Features</p>
                  <ul className="space-y-1.5">
                    {project.mainFeatures.map((f, i) => (
                      <li key={i} className="text-xs flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="pt-2 border-t text-[11px] text-muted-foreground flex gap-3">
                <span>Created {formatDate(project.createdAt)}</span>
                <span>·</span>
                <span>Updated {timeAgo(project.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Top Recommendations */}
          <Card>
            <CardHeader className="py-4 px-5 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-orange-500" />
                  Top Actions
                </CardTitle>
                {openRecs.length > 0 && (
                  <Link
                    href={`/projects/${project.id}?tab=recommendations`}
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    View all <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {openRecs.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 px-5 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  <p className="text-sm font-medium">All clear!</p>
                  <p className="text-xs text-muted-foreground">No open recommendations.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {openRecs.slice(0, 4).map((rec) => (
                    <div key={rec.id} className="flex items-start gap-3 px-5 py-3">
                      <PriorityBadge priority={rec.priority} className="mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold line-clamp-2 leading-snug">{rec.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                          {rec.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Audience Personas */}
      {(project.audienceSegments?.length ?? 0) > 0 && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-1">
            Audience Personas
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {project.audienceSegments?.map((seg, idx) => (
              <div key={seg.id} className="rounded-2xl border bg-card overflow-hidden">
                <div className={`h-1.5 w-full bg-gradient-to-r ${SEGMENT_COLORS[idx % SEGMENT_COLORS.length]}`} />
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${SEGMENT_COLORS[idx % SEGMENT_COLORS.length]} text-white font-bold text-sm`}>
                      {seg.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold">{seg.name}</p>
                        {seg.isPrimary && (
                          <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold">
                            Primary
                          </span>
                        )}
                      </div>
                      {seg.demographics && (
                        <p className="text-xs text-muted-foreground">{seg.demographics}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{seg.description}</p>
                  {seg.painPoints.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-500 mb-1.5">Pain Points</p>
                      <div className="flex flex-wrap gap-1">
                        {seg.painPoints.slice(0, 3).map((p, i) => (
                          <span key={i} className="rounded-full bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 px-2 py-0.5 text-[11px]">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {seg.goals.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 mb-1.5">Goals</p>
                      <div className="flex flex-wrap gap-1">
                        {seg.goals.slice(0, 3).map((g, i) => (
                          <span key={i} className="rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-[11px]">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
