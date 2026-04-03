import { requireAuth, getWorkspace } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Folders, Plus, Smartphone, Monitor, FlaskConical, TrendingUp,
  Clock, Search, FileText, Brain, Trophy, AlertTriangle, ChevronRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { timeAgo, categoryLabel } from "@/lib/utils";
import { isDemoMode } from "@/lib/demo/mode";
import { getDemoProjects } from "@/lib/demo/store";
import { cn } from "@/lib/utils";

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

function getGradient(category: string) {
  return CATEGORY_COLORS[category] ?? "from-violet-500 to-purple-600";
}

function getAsoScore(project: { _count?: { listingVariants?: number; experiments?: number; recommendations?: number } }) {
  const variants = project._count?.listingVariants ?? 0;
  const exps     = project._count?.experiments     ?? 0;
  const openRecs = project._count?.recommendations ?? 0;
  return Math.max(10, Math.min(100, 30 + variants * 10 + exps * 15 - openRecs * 5));
}

// Inline SVG ring for ASO score
function AsoRing({ score }: { score: number }) {
  const radius = 20;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const stroke = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  const textColor = score >= 70 ? "text-emerald-600 dark:text-emerald-400" : score >= 40 ? "text-amber-600 dark:text-amber-400" : "text-red-500";

  return (
    <div className="relative flex h-[52px] w-[52px] items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="52" height="52" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
        <circle
          cx="26" cy="26" r={radius} fill="none"
          stroke={stroke} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="flex flex-col items-center leading-none">
        <span className={cn("text-sm font-black tabular-nums", textColor)}>{score}</span>
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

export default async function ProjectsPage() {
  const session = await requireAuth();
  const workspace = await getWorkspace(session.user.id!);
  if (!workspace) return null;

  const projects = isDemoMode
    ? getDemoProjects().map((project) => ({
        ...project,
        recommendations: (project.recommendations ?? [])
          .filter((r) => r.status === "OPEN")
          .slice(0, 1),
        _count: {
          listingVariants:  project._count?.listingVariants ?? 0,
          experiments:      project._count?.experiments ?? 0,
          recommendations:  project.recommendations?.filter((r) => r.status === "OPEN").length ?? 0,
          keywordSets:      project._count?.keywordSets ?? 0,
          audienceSegments: project._count?.audienceSegments ?? 0,
        },
      }))
    : await db.project.findMany({
        where: { workspaceId: workspace.id },
        include: {
          analysis: { select: { analysisStatus: true } },
          _count: {
            select: {
              listingVariants: true,
              experiments: true,
              recommendations: { where: { status: "OPEN" } },
              keywordSets: true,
            },
          },
          recommendations: {
            where: { status: "OPEN" },
            orderBy: { priority: "desc" },
            take: 1,
          },
        },
        orderBy: { updatedAt: "desc" },
      });

  return (
    <div>
      <Header
        title="Projects"
        subtitle={`${projects.length} project${projects.length !== 1 ? "s" : ""} · ASO health at a glance`}
        actions={
          <Button size="sm" className="h-8 bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 border-0" asChild>
            <Link href="/projects/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Project
            </Link>
          </Button>
        }
      />

      <div className="p-6">
        {projects.length === 0 ? (
          <EmptyState
            icon={Folders}
            title="No projects yet"
            description="Create your first project and let AI generate your entire launch kit in under 2 minutes."
            action={
              <Button asChild>
                <Link href="/projects/new">
                  <Plus className="mr-1.5 h-4 w-4" /> Create Project
                </Link>
              </Button>
            }
            className="mt-4"
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const gradient  = getGradient(project.category);
              const score     = getAsoScore(project);
              const urgentRec = project.recommendations?.[0];

              // Launch readiness steps
              const steps = [
                { label: "AI Analysis",  icon: Brain,     done: project.analysis?.analysisStatus === "COMPLETED" },
                { label: "Keywords",     icon: Search,    done: (project._count?.keywordSets ?? 0) > 0 },
                { label: "Store Copy",   icon: FileText,  done: (project._count?.listingVariants ?? 0) > 0 },
                { label: "Experiments",  icon: FlaskConical, done: (project._count?.experiments ?? 0) > 0 },
              ];
              const stepsDone = steps.filter((s) => s.done).length;

              return (
                <Link key={project.id} href={`/projects/${project.id}`} className="group">
                  <div className="rounded-2xl border bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-200 overflow-hidden h-full flex flex-col">

                    {/* Top color banner */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />

                    <div className="p-5 flex flex-col flex-1 gap-4">

                      {/* Header: avatar + name + ASO ring */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white font-bold text-lg shadow-sm`}>
                            {project.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">{project.name}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              {project.platform.includes("IOS") && <Smartphone className="h-3 w-3" />}
                              {project.platform.includes("ANDROID") && <Monitor className="h-3 w-3" />}
                              {categoryLabel(project.category)}
                            </p>
                            <div className="mt-1.5">
                              <HealthBadge score={score} />
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <AsoRing score={score} />
                        </div>
                      </div>

                      {/* Launch Readiness */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Launch Readiness</p>
                          <p className="text-[10px] font-semibold text-muted-foreground">{stepsDone}/4 complete</p>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {steps.map((step) => (
                            <div key={step.label} className="flex flex-col items-center gap-1">
                              <div className={cn(
                                "w-full h-1.5 rounded-full",
                                step.done ? "bg-emerald-500" : "bg-muted"
                              )} />
                              <span className={cn(
                                "text-[9px] font-medium",
                                step.done ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                              )}>
                                {step.done ? "✓" : "–"} {step.label.split(" ")[0]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Urgent recommendation callout */}
                      {urgentRec ? (
                        <div className="rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 px-3 py-2 flex items-start gap-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-orange-700 dark:text-orange-300 line-clamp-2 leading-snug font-medium">{urgentRec.title}</p>
                        </div>
                      ) : stepsDone === 4 ? (
                        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 px-3 py-2 flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">All launch steps complete!</p>
                        </div>
                      ) : (
                        <div className="rounded-lg bg-muted/40 border px-3 py-2 flex items-center gap-2">
                          <p className="text-[11px] text-muted-foreground">
                            Next: <span className="font-medium text-foreground">{steps.find((s) => !s.done)?.label}</span>
                          </p>
                        </div>
                      )}

                      {/* Stats footer */}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t">
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1" title="Store listings">
                            <TrendingUp className="h-3 w-3" />
                            {project._count?.listingVariants ?? 0}
                          </span>
                          <span className="flex items-center gap-1" title="Experiments">
                            <FlaskConical className="h-3 w-3" />
                            {project._count?.experiments ?? 0}
                          </span>
                          {(project._count?.recommendations ?? 0) > 0 && (
                            <span className="flex items-center gap-1 text-orange-500 font-semibold">
                              <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
                              {project._count?.recommendations} action{(project._count?.recommendations ?? 0) !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeAgo(project.updatedAt)}
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
                  <p className="text-xs text-muted-foreground mt-1 max-w-[160px]">Add an app and AI generates the full launch kit</p>
                </div>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {["AI Analysis", "Keywords", "Store Copy", "Experiments"].map((f) => (
                    <span key={f} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{f}</span>
                  ))}
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
