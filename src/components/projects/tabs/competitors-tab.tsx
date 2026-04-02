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
import { Sparkles, Users, Star, Trash2, ExternalLink, Smartphone, Monitor, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { platformLabel, cn } from "@/lib/utils";
import type { ProjectWithRelations, CompetitorAppData } from "@/types";

// ─── Rating Stars ─────────────────────────────────────────────────────────────

function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const partial = rating - full;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i < full
              ? "fill-amber-400 text-amber-400"
              : i === full && partial >= 0.5
              ? "fill-amber-200 text-amber-400"
              : "text-muted-foreground/20"
          )}
        />
      ))}
      <span className="ml-1 text-xs font-semibold">{rating.toFixed(1)}</span>
    </span>
  );
}

// ─── Rating Bar ───────────────────────────────────────────────────────────────

function RatingBar({ rating, max = 5 }: { rating: number; max?: number }) {
  const pct = Math.round((rating / max) * 100);
  const color =
    rating >= 4.2 ? "bg-emerald-500" :
    rating >= 3.5 ? "bg-amber-400" :
    "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold tabular-nums w-6 text-right">{rating.toFixed(1)}</span>
    </div>
  );
}

// ─── Competitor Card ──────────────────────────────────────────────────────────

function CompetitorCard({
  competitor,
  projectId,
  onDelete,
  rank,
}: {
  competitor: CompetitorAppData;
  projectId: string;
  onDelete: (id: string) => void;
  rank: number;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/competitors?competitorId=${competitor.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onDelete(competitor.id);
        toast({ title: "Competitor removed" });
      }
    } finally {
      setDeleting(false);
    }
  }

  const storeUrl =
    competitor.platform === "IOS"
      ? `https://apps.apple.com/app/id${competitor.appId}`
      : `https://play.google.com/store/apps/details?id=${competitor.appId}`;

  const isIOS = competitor.platform === "IOS";

  return (
    <div className="rounded-2xl border bg-card overflow-hidden hover:shadow-sm transition-shadow">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Rank + icon */}
          <div className="relative shrink-0">
            <div className="absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-card border text-[10px] font-bold text-muted-foreground z-10">
              {rank}
            </div>
            {competitor.iconUrl ? (
              <img
                src={competitor.iconUrl}
                alt={competitor.name}
                className="h-14 w-14 rounded-2xl object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 text-2xl font-bold text-white shadow-sm">
                {competitor.name[0]}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm leading-snug">{competitor.name}</h3>
                {competitor.developer && (
                  <p className="text-xs text-muted-foreground">{competitor.developer}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <a href={storeUrl} target="_blank" rel="noopener noreferrer"
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-primary hover:bg-muted transition-colors">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button onClick={handleDelete} disabled={deleting}
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Badges row */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                isIOS ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" : "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
              )}>
                {isIOS ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                {platformLabel(competitor.platform)}
              </span>
              {competitor.price != null && (
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {competitor.price === 0 ? "Free" : `$${competitor.price.toFixed(2)}`}
                </span>
              )}
              {competitor.category && (
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] text-muted-foreground">{competitor.category}</span>
              )}
            </div>

            {/* Rating bar */}
            {competitor.rating != null && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                  <RatingStars rating={competitor.rating} />
                  {competitor.ratingCount != null && (
                    <span>{competitor.ratingCount.toLocaleString()} ratings</span>
                  )}
                </div>
                <RatingBar rating={competitor.rating} />
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {competitor.description && (
          <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {competitor.description}
          </p>
        )}

        {/* Keywords */}
        {competitor.keywords.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Keywords</p>
            <div className="flex flex-wrap gap-1.5">
              {competitor.keywords.slice(0, 10).map((kw, i) => (
                <span key={i} className="rounded-full bg-violet-100 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400 px-2 py-0.5 text-xs">
                  {kw}
                </span>
              ))}
              {competitor.keywords.length > 10 && (
                <span className="text-xs text-muted-foreground self-center">
                  +{competitor.keywords.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export function ProjectCompetitorsTab({ project }: { project: ProjectWithRelations }) {
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState<"IOS" | "ANDROID">(
    project.platform.includes("IOS") ? "IOS" : "ANDROID"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [competitors, setCompetitors] = useState<CompetitorAppData[]>(project.competitors ?? []);

  async function search() {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/competitors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, searchTerm: searchTerm.trim() || undefined }),
      });
      if (!res.ok) {
        const json = await res.json();
        toast({ title: "Search failed", description: json.error, variant: "destructive" });
        return;
      }
      const json = await res.json();
      setCompetitors(json.competitors ?? []);
      toast({ title: `Found ${json.competitors?.length ?? 0} competitors` });
    } finally {
      setLoading(false);
    }
  }

  function handleDelete(id: string) {
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
  }

  const filtered = competitors.filter((c) => c.platform === platform);

  return (
    <div className="p-6 space-y-6">

      {/* Search panel */}
      <Card className="overflow-hidden">
        <CardHeader className="py-4 px-5 border-b bg-muted/30">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <div className="rounded-lg bg-violet-500/10 p-1.5">
              <Search className="h-4 w-4 text-violet-500" />
            </div>
            Find Competitors
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
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
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold">Search term <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="e.g. fitness tracker, meditation, language learning…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && search()}
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Searches the App Store / Google Play using your app category &amp; description. Extracts keywords from competitor listings automatically.
          </p>
          {loading ? (
            <AILoadingState message="Searching app stores for competitors…" />
          ) : (
            <Button onClick={search} disabled={loading} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Find Competitors
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Platform filter */}
      {competitors.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground">Filter:</span>
          {project.platform.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p as "IOS" | "ANDROID")}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                platform === p ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
              )}
            >
              {p === "IOS" ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
              {platformLabel(p)}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No competitors found"
          description="Search for competitors above. We'll extract their keywords and store listing insights automatically."
        />
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground font-medium">
            {filtered.length} competitor{filtered.length !== 1 ? "s" : ""} · {platformLabel(platform)}
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            {filtered.map((c, idx) => (
              <CompetitorCard
                key={c.id}
                competitor={c}
                projectId={project.id}
                onDelete={handleDelete}
                rank={idx + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
