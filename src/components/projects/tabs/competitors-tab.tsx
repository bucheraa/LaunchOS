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
import { Sparkles, Users, Star, Trash2, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { platformLabel, cn } from "@/lib/utils";
import type { ProjectWithRelations, CompetitorAppData } from "@/types";

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
              ? "fill-yellow-400 text-yellow-400"
              : i === full && partial >= 0.5
              ? "fill-yellow-200 text-yellow-400"
              : "text-muted-foreground/30"
          )}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{rating.toFixed(1)}</span>
    </span>
  );
}

function CompetitorCard({
  competitor,
  projectId,
  onDelete,
}: {
  competitor: CompetitorAppData;
  projectId: string;
  onDelete: (id: string) => void;
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

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {competitor.iconUrl ? (
            <img
              src={competitor.iconUrl}
              alt={competitor.name}
              className="h-12 w-12 rounded-xl object-cover shrink-0"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-xl font-bold text-muted-foreground">
              {competitor.name[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-sm truncate">{competitor.name}</h3>
                {competitor.developer && (
                  <p className="text-xs text-muted-foreground">{competitor.developer}</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
              {competitor.rating != null && <RatingStars rating={competitor.rating} />}
              {competitor.ratingCount != null && (
                <span className="text-muted-foreground">
                  {competitor.ratingCount.toLocaleString()} ratings
                </span>
              )}
              {competitor.price != null && (
                <span className="text-muted-foreground">
                  {competitor.price === 0 ? "Free" : `$${competitor.price.toFixed(2)}`}
                </span>
              )}
              {competitor.category && (
                <span className="rounded-full bg-muted px-2 py-0.5">{competitor.category}</span>
              )}
            </div>

            {competitor.description && (
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {competitor.description}
              </p>
            )}

            {competitor.keywords.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {competitor.keywords.slice(0, 8).map((kw, i) => (
                  <span key={i} className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">
                    {kw}
                  </span>
                ))}
                {competitor.keywords.length > 8 && (
                  <span className="text-xs text-muted-foreground">
                    +{competitor.keywords.length - 8} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectCompetitorsTab({ project }: { project: ProjectWithRelations }) {
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState<"IOS" | "ANDROID">(
    project.platform.includes("IOS") ? "IOS" : "ANDROID"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [competitors, setCompetitors] = useState<CompetitorAppData[]>(
    project.competitors ?? []
  );

  async function search() {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/competitors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          searchTerm: searchTerm.trim() || undefined,
        }),
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
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Competitor Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
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
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Search term (optional)</Label>
              <Input
                placeholder="e.g. fitness tracker, meditation app…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Searches the App Store / Google Play using your app category and description. No API key required.
          </p>

          {loading ? (
            <AILoadingState message="Searching app stores for competitors…" />
          ) : (
            <Button onClick={search} disabled={loading}>
              <Sparkles className="mr-2 h-4 w-4" />
              Find Competitors
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Platform filter */}
      {competitors.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Filter:</span>
          {project.platform.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p as "IOS" | "ANDROID")}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                platform === p ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"
              )}
            >
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
          description="Search for competitors above. We'll extract keywords and insights from their listings."
        />
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-medium">
            {filtered.length} competitor{filtered.length !== 1 ? "s" : ""} · {platformLabel(platform)}
          </p>
          {filtered.map((c) => (
            <CompetitorCard
              key={c.id}
              competitor={c}
              projectId={project.id}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
