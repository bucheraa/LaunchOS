"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProjectSchema, type CreateProjectInput } from "@/lib/validations/project";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "PRODUCTIVITY", label: "Productivity" },
  { value: "SOCIAL", label: "Social" },
  { value: "HEALTH_FITNESS", label: "Health & Fitness" },
  { value: "FINANCE", label: "Finance" },
  { value: "EDUCATION", label: "Education" },
  { value: "ENTERTAINMENT", label: "Entertainment" },
  { value: "LIFESTYLE", label: "Lifestyle" },
  { value: "SHOPPING", label: "Shopping" },
  { value: "TRAVEL", label: "Travel" },
  { value: "FOOD_DRINK", label: "Food & Drink" },
  { value: "NEWS", label: "News" },
  { value: "PHOTO_VIDEO", label: "Photo & Video" },
  { value: "MUSIC", label: "Music" },
  { value: "GAMES", label: "Games" },
  { value: "UTILITIES", label: "Utilities" },
  { value: "DEVELOPER_TOOLS", label: "Developer Tools" },
  { value: "BUSINESS", label: "Business" },
  { value: "OTHER", label: "Other" },
];

const REGIONS = ["US", "UK", "DE", "AU", "CA", "FR", "ES", "IT", "JP", "BR"];

export function CreateProjectForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newFeature, setNewFeature] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      platform: ["IOS", "ANDROID"],
      pricingModel: "FREEMIUM",
      regions: ["US", "UK", "DE"],
      mainFeatures: [],
      locale: ["en", "de"],
    },
  });

  const platforms = watch("platform");
  const regions = watch("regions");
  const mainFeatures = watch("mainFeatures");
  const locale = watch("locale");

  function togglePlatform(p: "IOS" | "ANDROID") {
    const current = platforms ?? [];
    setValue(
      "platform",
      current.includes(p) ? current.filter((x) => x !== p) : [...current, p]
    );
  }

  function toggleRegion(r: string) {
    const current = regions ?? [];
    setValue(
      "regions",
      current.includes(r) ? current.filter((x) => x !== r) : [...current, r]
    );
  }

  function toggleLocale(l: string) {
    const current = locale ?? [];
    setValue(
      "locale",
      current.includes(l) ? current.filter((x) => x !== l) : [...current, l]
    );
  }

  function addFeature() {
    if (!newFeature.trim()) return;
    const current = mainFeatures ?? [];
    if (current.length >= 10) return;
    setValue("mainFeatures", [...current, newFeature.trim()]);
    setNewFeature("");
  }

  function removeFeature(index: number) {
    const current = mainFeatures ?? [];
    setValue("mainFeatures", current.filter((_, i) => i !== index));
  }

  async function onSubmit(data: CreateProjectInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: json.error ?? "Failed to create project", variant: "destructive" });
        return;
      }
      toast({ title: "Project created!", description: "Ready to generate launch materials." });
      router.push(`/projects/${json.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">App name *</Label>
        <Input id="name" placeholder="e.g. FitTrack Pro" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      {/* Platform */}
      <div className="space-y-1.5">
        <Label>Platform *</Label>
        <div className="flex gap-2">
          {(["IOS", "ANDROID"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => togglePlatform(p)}
              className={cn(
                "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                platforms?.includes(p)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input hover:bg-muted"
              )}
            >
              {p === "IOS" ? "iOS" : "Android"}
            </button>
          ))}
        </div>
        {errors.platform && <p className="text-xs text-destructive">{errors.platform.message}</p>}
      </div>

      {/* Category + Pricing */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Category *</Label>
          <Select onValueChange={(v) => setValue("category", v as CreateProjectInput["category"])}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Pricing model *</Label>
          <Select
            defaultValue="FREEMIUM"
            onValueChange={(v) => setValue("pricingModel", v as CreateProjectInput["pricingModel"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FREE">Free</SelectItem>
              <SelectItem value="FREEMIUM">Freemium</SelectItem>
              <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
              <SelectItem value="ONE_TIME">One-Time Purchase</SelectItem>
              <SelectItem value="PAYWALLED">Premium / Paywalled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">
          App description * <span className="text-muted-foreground font-normal">(min. 50 chars)</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Describe your app in detail — what it does, how it works, what makes it unique. The more detail you provide, the better the AI output."
          rows={5}
          {...register("description")}
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      {/* Target Audience */}
      <div className="space-y-1.5">
        <Label htmlFor="targetAudience">Target audience (optional)</Label>
        <Textarea
          id="targetAudience"
          placeholder="Describe your target audience — age, interests, goals, pain points"
          rows={2}
          {...register("targetAudience")}
        />
      </div>

      {/* Main Features */}
      <div className="space-y-1.5">
        <Label>Main features *</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a feature..."
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); addFeature(); }
            }}
          />
          <Button type="button" variant="outline" size="icon" onClick={addFeature}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {mainFeatures && mainFeatures.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {mainFeatures.map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
              >
                {f}
                <button type="button" onClick={() => removeFeature(i)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        {errors.mainFeatures && <p className="text-xs text-destructive">{errors.mainFeatures.message}</p>}
      </div>

      {/* Regions */}
      <div className="space-y-1.5">
        <Label>Target regions *</Label>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => toggleRegion(r)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                regions?.includes(r)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input hover:bg-muted"
              )}
            >
              {r}
            </button>
          ))}
        </div>
        {errors.regions && <p className="text-xs text-destructive">{errors.regions.message}</p>}
      </div>

      {/* Locales */}
      <div className="space-y-1.5">
        <Label>Store listing languages</Label>
        <div className="flex gap-2">
          {[{ v: "en", l: "English" }, { v: "de", l: "German" }].map(({ v, l }) => (
            <button
              key={v}
              type="button"
              onClick={() => toggleLocale(v)}
              className={cn(
                "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                locale?.includes(v)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input hover:bg-muted"
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Optional URLs */}
      <div className="space-y-3 border-t pt-4">
        <Label className="text-muted-foreground font-normal text-xs uppercase tracking-wider">Optional URLs</Label>
        <div className="space-y-3">
          <Input placeholder="Landing page URL" {...register("landingPageUrl")} />
          <Input placeholder="App Store URL (iOS)" {...register("appStoreUrl")} />
          <Input placeholder="Play Store URL (Android)" {...register("playStoreUrl")} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Project
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
