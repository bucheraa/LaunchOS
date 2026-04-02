"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AILoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Sparkles, FileText, Copy, Check, Search, TrendingUp, ArrowUpDown,
  Send, Loader2, Smartphone, Monitor, Globe, CheckCircle2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn, platformLabel } from "@/lib/utils";
import type { ProjectWithRelations, ListingVariantData, KeywordSetData } from "@/types";

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copy} className="text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-muted">
      {copied
        ? <Check className="h-3.5 w-3.5 text-emerald-500" />
        : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

// ─── Character count bar ──────────────────────────────────────────────────────

function CharBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const color =
    pct >= 100 ? "bg-red-500" :
    pct >= 85  ? "bg-amber-400" :
    "bg-emerald-500";
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className={cn("text-[10px] font-medium tabular-nums", pct >= 100 ? "text-red-500" : "text-muted-foreground")}>
        {value}/{max}
      </span>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, value, multiline = false, maxChars }: { label: string; value: string; multiline?: boolean; maxChars?: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <CopyButton text={value} />
      </div>
      {multiline ? (
        <div className="rounded-xl bg-muted/40 p-3 text-sm whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto scrollbar-thin border border-border/50">
          {value}
        </div>
      ) : (
        <p className="text-sm font-semibold">{value}</p>
      )}
      {maxChars && <CharBar value={value.length} max={maxChars} />}
    </div>
  );
}

// ─── Variant Card ─────────────────────────────────────────────────────────────

function VariantCard({ variant, projectId }: { variant: ListingVariantData; projectId: string }) {
  const [pushing, setPushing] = useState(false);
  const [appId, setAppId] = useState("");
  const [showPushForm, setShowPushForm] = useState(false);
  const isIOS = variant.platform === "IOS";

  async function pushToStore() {
    if (!appId.trim()) {
      toast({ title: "Enter an App ID / package name", variant: "destructive" });
      return;
    }
    setPushing(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/store-copy/push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: variant.id, appId: appId.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast({ title: "Push failed", description: json.error, variant: "destructive" });
        return;
      }
      toast({ title: "Pushed to store successfully!" });
      setShowPushForm(false);
      window.location.reload();
    } finally {
      setPushing(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-card overflow-hidden hover:shadow-sm transition-shadow">
      {/* Header banner */}
      <div className={cn(
        "flex items-center justify-between px-5 py-3 border-b",
        variant.pushedToStore ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-muted/30"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", isIOS ? "bg-slate-800" : "bg-emerald-600")}>
            {isIOS ? <Smartphone className="h-4 w-4 text-white" /> : <Monitor className="h-4 w-4 text-white" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">{variant.variantName}</p>
              {variant.isControl && (
                <span className="rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 text-[10px] font-semibold">
                  Control
                </span>
              )}
              {variant.pushedToStore && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-semibold">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Live
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              {platformLabel(variant.platform)}
              <span>·</span>
              <Globe className="h-3 w-3" />
              {variant.locale.toUpperCase()}
              {variant.audienceSegment && (
                <>
                  <span>·</span>
                  {variant.audienceSegment.name}
                </>
              )}
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => setShowPushForm((v) => !v)}>
          <Send className="h-3 w-3" /> Push to Store
        </Button>
      </div>

      {/* Push form */}
      {showPushForm && (
        <div className="px-5 py-3 border-b bg-muted/20 flex gap-2 items-end flex-wrap">
          <div className="flex-1 space-y-1 min-w-[180px]">
            <Label className="text-xs">{isIOS ? "Apple App ID (numeric)" : "Android package name"}</Label>
            <Input
              placeholder={isIOS ? "123456789" : "com.example.app"}
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <Button size="sm" onClick={pushToStore} disabled={pushing}>
            {pushing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Push"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowPushForm(false)}>Cancel</Button>
        </div>
      )}

      {/* Content */}
      <div className="p-5 space-y-4">
        {isIOS ? (
          <>
            {variant.appName      && <Field label="App Name"          value={variant.appName}      maxChars={30} />}
            {variant.subtitle     && <Field label="Subtitle"          value={variant.subtitle}     maxChars={30} />}
            {variant.promotionalText && <Field label="Promotional Text" value={variant.promotionalText} />}
            {variant.description  && <Field label="Description"        value={variant.description}  multiline />}
          </>
        ) : (
          <>
            {variant.appName         && <Field label="Title"             value={variant.appName}         maxChars={50} />}
            {variant.shortDescription && <Field label="Short Description" value={variant.shortDescription} maxChars={80} />}
            {variant.description     && <Field label="Full Description"   value={variant.description}     multiline />}
          </>
        )}
        {variant.keywords.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Keywords</p>
            <div className="flex flex-wrap gap-1.5">
              {variant.keywords.map((k, i) => (
                <span key={i} className="rounded-full bg-violet-100 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800 px-2 py-0.5 text-xs">
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Keyword Research Panel ───────────────────────────────────────────────────

function KeywordResearchPanel({ project, platform }: { project: ProjectWithRelations; platform: "IOS" | "ANDROID" }) {
  const [loading, setLoading] = useState(false);
  const [keywordSet, setKeywordSet] = useState<KeywordSetData | null>(
    project.keywordSets?.find((ks) => ks.platform === platform) ?? null
  );

  async function research() {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/keywords`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      if (!res.ok) {
        const json = await res.json();
        toast({ title: "Keyword research failed", description: json.error, variant: "destructive" });
        return;
      }
      const json = await res.json();
      setKeywordSet(json.keywordSet);
      toast({ title: `Found ${json.keywordSet?.keywords?.length ?? 0} keywords` });
    } finally {
      setLoading(false);
    }
  }

  const keywords = keywordSet?.keywords ?? [];

  function difficultyBg(difficulty?: number | null) {
    if (difficulty == null) return "";
    if (difficulty < 30) return "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400";
    if (difficulty < 60) return "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400";
    return "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400";
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-4 px-5 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <div className="rounded-lg bg-blue-500/10 p-1.5">
              <Search className="h-4 w-4 text-blue-500" />
            </div>
            Keyword Research
          </CardTitle>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={research} disabled={loading}>
            {loading
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Sparkles className="h-3.5 w-3.5 text-violet-500" />}
            {loading ? "Researching…" : "Research Keywords"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          AI-suggested keywords enriched with real App Store autocomplete data. Volume &amp; difficulty scores require AppFollow API.
        </p>
      </CardHeader>
      {keywords.length > 0 && (
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-semibold text-muted-foreground">#</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground">Keyword</th>
                  <th className="text-right p-3 font-semibold text-muted-foreground">
                    <span className="flex items-center justify-end gap-1"><TrendingUp className="h-3 w-3" /> Volume</span>
                  </th>
                  <th className="text-right p-3 font-semibold text-muted-foreground">
                    <span className="flex items-center justify-end gap-1"><ArrowUpDown className="h-3 w-3" /> Difficulty</span>
                  </th>
                  <th className="text-right p-3 font-semibold text-muted-foreground">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {keywords.map((kw, idx) => (
                  <tr key={kw.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-muted-foreground">{idx + 1}</td>
                    <td className="p-3 font-semibold">{kw.keyword}</td>
                    <td className="p-3 text-right text-muted-foreground">
                      {kw.volume != null ? kw.volume.toLocaleString() : "—"}
                    </td>
                    <td className="p-3 text-right">
                      {kw.difficulty != null ? (
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", difficultyBg(kw.difficulty))}>
                          {kw.difficulty}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="p-3 text-right text-muted-foreground capitalize">
                      {kw.source.toLowerCase().replace("_", " ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export function ProjectStoreCopyTab({ project }: { project: ProjectWithRelations }) {
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState<"IOS" | "ANDROID">(
    project.platform.includes("IOS") ? "IOS" : "ANDROID"
  );
  const [locale, setLocale] = useState("en");
  const [audienceId, setAudienceId] = useState<string>("");
  const [variantName, setVariantName] = useState("");

  async function generate() {
    if (!variantName) {
      toast({ title: "Enter a variant name", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/store-copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, locale, audienceSegmentId: audienceId || undefined, variantName }),
      });
      if (!res.ok) {
        const json = await res.json();
        toast({ title: "Generation failed", description: json.error, variant: "destructive" });
        return;
      }
      toast({ title: "Store copy generated!" });
      setVariantName("");
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  const variants = project.listingVariants ?? [];
  const filteredVariants = variants.filter((v) => v.platform === platform && v.locale === locale);

  return (
    <div className="p-6 space-y-6">

      {/* Keyword Research */}
      <KeywordResearchPanel project={project} platform={platform} />

      {/* Generator */}
      <Card className="overflow-hidden">
        <CardHeader className="py-4 px-5 border-b bg-muted/30">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <div className="rounded-lg bg-violet-500/10 p-1.5">
              <Sparkles className="h-4 w-4 text-violet-500" />
            </div>
            Generate Store Copy
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Platform</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as "IOS" | "ANDROID")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {project.platform.map((p) => (
                    <SelectItem key={p} value={p}>{platformLabel(p)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Language</Label>
              <Select value={locale} onValueChange={setLocale}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {project.locale.map((l) => (
                    <SelectItem key={l} value={l}>{l === "en" ? "English" : l === "de" ? "German" : l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Target Audience</Label>
              <Select value={audienceId} onValueChange={setAudienceId}>
                <SelectTrigger><SelectValue placeholder="Any audience" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any audience</SelectItem>
                  {project.audienceSegments?.map((seg) => (
                    <SelectItem key={seg.id} value={seg.id}>{seg.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Variant name</Label>
              <Input
                placeholder="e.g. Performance v1"
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <AILoadingState message="Generating optimised store copy…" />
          ) : (
            <Button onClick={generate} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Platform / locale filter pills */}
      {variants.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground">Filter:</span>
          {project.platform.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p as "IOS" | "ANDROID")}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors flex items-center gap-1.5",
                platform === p ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
              )}
            >
              {p === "IOS" ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
              {platformLabel(p)}
            </button>
          ))}
          {project.locale.map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors uppercase",
                locale === l ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
              )}
            >
              {l}
            </button>
          ))}
        </div>
      )}

      {/* Variants */}
      {filteredVariants.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No variants yet"
          description="Generate store copy above to create your first listing variant."
        />
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            {filteredVariants.length} variant{filteredVariants.length !== 1 ? "s" : ""} · {platformLabel(platform)} · {locale.toUpperCase()}
          </p>
          {filteredVariants.map((v) => (
            <VariantCard key={v.id} variant={v} projectId={project.id} />
          ))}
        </div>
      )}
    </div>
  );
}
