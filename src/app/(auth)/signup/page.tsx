"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Zap, Loader2, Rocket, Clock, TrendingUp, CheckCircle2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { toast } from "@/hooks/use-toast";

const STEPS = [
  { num: "1", title: "Create your account", desc: "Takes under 2 minutes" },
  { num: "2", title: "Add your first app", desc: "Just paste a description" },
  { num: "3", title: "AI generates everything", desc: "Store copy, keywords, experiments…" },
  { num: "4", title: "Launch smarter", desc: "Push directly to the App Store" },
];

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(data: SignupInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: json.error ?? "Signup failed", variant: "destructive" });
        return;
      }
      await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      router.push("/onboarding");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">

      {/* ── Left: Onboarding steps ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 90% 10%, white 0%, transparent 50%)" }} />

        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg">LaunchOS</span>
        </Link>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold leading-snug mb-3">
              From zero to launch-ready in one workspace
            </h2>
            <p className="text-violet-200 leading-relaxed">
              LaunchOS automates your entire App Store workflow — analysis, copy, keywords, screenshots, experiments and more. Here&apos;s what happens when you sign up:
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 font-bold text-sm">
                  {s.num}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{s.title}</p>
                  <p className="text-xs text-violet-200">{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="absolute left-[calc(3rem+18px)] mt-16 h-4 w-0.5 bg-white/20" />
                )}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/10 p-4 border border-white/20 text-center">
              <div className="flex justify-center mb-1"><Clock className="h-4 w-4 text-violet-200" /></div>
              <p className="text-xl font-extrabold">30s</p>
              <p className="text-xs text-violet-200">to generate store copy</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 border border-white/20 text-center">
              <div className="flex justify-center mb-1"><TrendingUp className="h-4 w-4 text-violet-200" /></div>
              <p className="text-xl font-extrabold">+31%</p>
              <p className="text-xs text-violet-200">avg. CVR uplift</p>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-violet-300">Free plan available · No credit card required · GDPR compliant</p>
      </div>

      {/* ── Right: Signup form ── */}
      <div className="flex flex-1 items-center justify-center bg-muted/20 p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center gap-2 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">LaunchOS</span>
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold">Create your free account</h1>
            <p className="text-sm text-muted-foreground mt-1">No credit card needed · Setup in 2 minutes</p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold">Full name</Label>
                <Input id="name" placeholder="Alex Demo" {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="workspaceName" className="text-xs font-semibold">Workspace name</Label>
                <Input id="workspaceName" placeholder="Acme Apps" {...register("workspaceName")} />
                {errors.workspaceName && <p className="text-xs text-destructive">{errors.workspaceName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
                <Input id="password" type="password" placeholder="min. 8 characters" {...register("password")} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 border-0 h-11 text-base font-semibold" disabled={loading}>
                {loading
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <Rocket className="mr-2 h-4 w-4" />}
                {loading ? "Creating your account…" : "Create free account"}
              </Button>
            </form>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground justify-center">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Free plan · No credit card · Cancel anytime
            </div>
          </div>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold">Sign in</Link>
          </p>
        </div>
      </div>

    </div>
  );
}
