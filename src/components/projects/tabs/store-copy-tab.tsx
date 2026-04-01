"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { AILoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Sparkles, FileText, Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn, platformLabel } from "@/lib/utils";
import type { ProjectWithRelations, ListingVariantData } from "@/types";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copy} className="text-muted-foreground hover:text-foreground transition-colors">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function VariantCard({ variant }: { variant: ListingVariantData }) {
  const isIOS = variant.platform === "IOS";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-sm">{variant.variantName}</CardTitle>
              {variant.isControl && (
                <span className="rounded-full bg-blue-100 dark:bg-blue-900/20 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                  Control
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{platformLabel(variant.platform)}</span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-xs text-muted-foreground uppercase">{variant.locale}</span>
              {variant.audienceSegment && (
                <>
                  <span className="text-muted-foreground text-xs">·</span>
                  <span className="text-xs text-muted-foreground">{variant.audienceSegment.name}</span>
                </>
              )}
            </div>
          </div>
          <StatusBadge status={variant.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isIOS ? (
          <>
            {variant.appName && (
              <Field label={`App Name (${variant.appName.length}/30 chars)`} value={variant.appName} />
            )}
            {variant.subtitle && (
              <Field label={`Subtitle (${variant.subtitle.length}/30 chars)`} value={variant.subtitle} />
            )}
            {variant.promotionalText && (
              <Field label="Promotional Text" value={variant.promotionalText} />
            )}
            {variant.description && (
              <Field label="Description" value={variant.description} multiline />
            )}
          </>
        ) : (
          <>
            {variant.appName && (
              <Field label={`Title (${variant.appName.length}/50 chars)`} value={variant.appName} />
            )}
            {variant.shortDescription && (
              <Field label={`Short Description (${variant.shortDescription.length}/80 chars)`} value={variant.shortDescription} />
            )}
            {variant.description && (
              <Field label="Full Description" value={variant.description} multiline />
            )}
          </>
        )}
        {variant.keywords.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Keywords</p>
            <div className="flex flex-wrap gap-1.5">
              {variant.keywords.map((k, i) => (
                <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-xs">{k}</span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Field({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <CopyButton text={value} />
      </div>
      {multiline ? (
        <div className="rounded-md bg-muted/50 p-3 text-sm whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto scrollbar-thin">
          {value}
        </div>
      ) : (
        <p className="text-sm font-medium">{value}</p>
      )}
    </div>
  );
}

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
        body: JSON.stringify({
          platform,
          locale,
          audienceSegmentId: audienceId || undefined,
          variantName,
        }),
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
  const filteredVariants = variants.filter(
    (v) => v.platform === platform && v.locale === locale
  );

  return (
    <div className="p-6 space-y-6">
      {/* Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Generate Store Copy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label>Platform</Label>
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
              <Label>Language</Label>
              <Select value={locale} onValueChange={setLocale}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {project.locale.map((l) => (
                    <SelectItem key={l} value={l}>{l === "en" ? "English" : "German"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Target Audience</Label>
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
              <Label>Variant name</Label>
              <Input
                placeholder="e.g. Performance v1"
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <AILoadingState message="Generating store copy..." />
          ) : (
            <Button onClick={generate} disabled={loading}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Filter bar */}
      {variants.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
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
          {project.locale.map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors uppercase",
                locale === l ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"
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
          title="No variants for this filter"
          description="Generate store copy above to create your first variant."
        />
      ) : (
        <div className="space-y-4">
          {filteredVariants.map((v) => (
            <VariantCard key={v.id} variant={v} />
          ))}
        </div>
      )}
    </div>
  );
}
