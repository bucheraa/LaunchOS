"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Loader2,
  Plus,
  X,
  Folders,
  BarChart3,
  FileText,
} from "lucide-react";
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

interface Props {
  initialStep?: number;
}

const STEPS = [
  { id: 0, title: "Welcome to LaunchOS", description: "Your AI launch workspace for mobile apps" },
  { id: 1, title: "Tell us about your app", description: "We'll use this to generate everything" },
  { id: 2, title: "Running AI analysis", description: "Extracting insights from your app" },
  { id: 3, title: "You're all set!", description: "Your launch workspace is ready" },
];

const CATEGORIES = [
  { value: "PRODUCTIVITY", label: "Productivity" },
  { value: "SOCIAL", label: "Social" },
  { value: "HEALTH_FITNESS", label: "Health & Fitness" },
  { value: "FINANCE", label: "Finance" },
  { value: "EDUCATION", label: "Education" },
  { value: "ENTERTAINMENT", label: "Entertainment" },
  { value: "LIFESTYLE", label: "Lifestyle" },
  { value: "GAMES", label: "Games" },
  { value: "UTILITIES", label: "Utilities" },
  { value: "BUSINESS", label: "Business" },
  { value: "OTHER", label: "Other" },
];

export function OnboardingWizard({ initialStep = 0 }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [loading, setLoading] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState("");
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<CreateProjectInput>({
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
  const mainFeatures = watch("mainFeatures");

  async function saveStep(newStep: number) {
    await fetch("/api/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: newStep }),
    });
    setStep(newStep);
  }

  async function onProjectSubmit(data: CreateProjectInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: json.error, variant: "destructive" });
        return;
      }
      setCreatedProjectId(json.id);
      await saveStep(2);
      runAnalysis(json.id);
    } finally {
      setLoading(false);
    }
  }

  async function runAnalysis(projectId: string) {
    // Simulate progress while AI works
    const interval = setInterval(() => {
      setAnalysisProgress((p) => Math.min(p + 8, 90));
    }, 800);

    try {
      await fetch(`/api/projects/${projectId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      clearInterval(interval);
      setAnalysisProgress(100);
      setTimeout(() => saveStep(3), 600);
    } catch {
      clearInterval(interval);
      // Still advance — user can re-run analysis later
      setAnalysisProgress(100);
      setTimeout(() => saveStep(3), 600);
    }
  }

  async function finish() {
    await fetch("/api/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: 4, done: true }),
    });
    router.push(createdProjectId ? `/projects/${createdProjectId}` : "/dashboard");
    router.refresh();
  }

  function togglePlatform(p: "IOS" | "ANDROID") {
    const cur = platforms ?? [];
    setValue("platform", cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]);
  }

  function addFeature() {
    if (!newFeature.trim()) return;
    const cur = mainFeatures ?? [];
    if (cur.length >= 8) return;
    setValue("mainFeatures", [...cur, newFeature.trim()]);
    setNewFeature("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">{STEPS[step]?.title}</h1>
          <p className="text-sm text-muted-foreground">{STEPS[step]?.description}</p>
        </div>

        {/* Step indicators */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                s.id === step
                  ? "w-6 bg-primary"
                  : s.id < step
                  ? "w-2 bg-primary/50"
                  : "w-2 bg-muted"
              )}
            />
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="rounded-xl border bg-card p-8 space-y-6 text-center">
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Sparkles, label: "AI Analysis", desc: "Audience, value props & messaging" },
                { icon: FileText, label: "Store Copy", desc: "iOS & Android listings, EN + DE" },
                { icon: BarChart3, label: "A/B Experiments", desc: "Test ideas with metrics" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="rounded-lg border bg-muted/30 p-4 space-y-2">
                  <div className="flex justify-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <p className="text-xs font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground leading-tight">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Let's create your first project. It takes about 2 minutes.
            </p>
            <Button className="w-full" size="lg" onClick={() => saveStep(1)}>
              Get started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 1: Project form */}
        {step === 1 && (
          <form
            onSubmit={handleSubmit(onProjectSubmit)}
            className="rounded-xl border bg-card p-6 space-y-5"
          >
            {/* App name */}
            <div className="space-y-1.5">
              <Label>App name *</Label>
              <Input placeholder="e.g. FitTrack Pro" {...register("name")} />
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
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select onValueChange={(v) => setValue("category", v as any)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Pricing *</Label>
                <Select defaultValue="FREEMIUM" onValueChange={(v) => setValue("pricingModel", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">Free</SelectItem>
                    <SelectItem value="FREEMIUM">Freemium</SelectItem>
                    <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
                    <SelectItem value="ONE_TIME">One-Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>
                App description *{" "}
                <span className="font-normal text-muted-foreground">(min. 50 chars)</span>
              </Label>
              <Textarea
                placeholder="What does your app do? What makes it unique? Who is it for?"
                rows={4}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Features */}
            <div className="space-y-1.5">
              <Label>Key features *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add feature…"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                />
                <Button type="button" variant="outline" size="icon" onClick={addFeature}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {(mainFeatures?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {mainFeatures?.map((f, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                    >
                      {f}
                      <button
                        type="button"
                        onClick={() => setValue("mainFeatures", mainFeatures.filter((_, j) => j !== i))}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {errors.mainFeatures && (
                <p className="text-xs text-destructive">{errors.mainFeatures.message}</p>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => saveStep(0)}>
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</>
                ) : (
                  <>Analyze with AI <Sparkles className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: Analysis running */}
        {step === 2 && (
          <div className="rounded-xl border bg-card p-8 space-y-6 text-center">
            <div className="flex justify-center">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary transition-all duration-300"
                  style={{ transform: `rotate(${(analysisProgress / 100) * 360}deg)` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold">{analysisProgress}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-semibold">Analyzing your app…</p>
              <p className="text-sm text-muted-foreground">
                {analysisProgress < 30
                  ? "Reading app description…"
                  : analysisProgress < 60
                  ? "Identifying audience segments…"
                  : analysisProgress < 85
                  ? "Generating value propositions…"
                  : "Finalizing insights…"}
              </p>
            </div>

            <div className="space-y-2 text-left">
              {[
                { label: "Product summary", done: analysisProgress >= 25 },
                { label: "Audience segments", done: analysisProgress >= 55 },
                { label: "Value propositions", done: analysisProgress >= 75 },
                { label: "Messaging angles", done: analysisProgress >= 90 },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted shrink-0" />
                  )}
                  <span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <div className="rounded-xl border bg-card p-8 space-y-6 text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Your workspace is ready!</h2>
              <p className="text-sm text-muted-foreground">
                We've analyzed your app and generated audience segments, value props, and messaging
                angles. Time to create your store listings.
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-4 text-left space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                What's ready for you
              </p>
              {[
                "Audience segments & personas",
                "Value propositions",
                "Messaging angles",
                "Recommendations to-do list",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Button className="w-full" size="lg" onClick={finish}>
                Open my project <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => { router.push("/dashboard"); }}
              >
                Go to dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
