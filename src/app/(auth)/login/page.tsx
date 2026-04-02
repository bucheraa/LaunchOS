"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Zap, Loader2, Sparkles, FileText, FlaskConical, TrendingUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { toast } from "@/hooks/use-toast";

const BENEFITS = [
  { icon: Sparkles,    text: "AI store copy in 30 seconds" },
  { icon: TrendingUp,  text: "Keyword research & ASO scoring" },
  { icon: FlaskConical,text: "A/B experiment planner" },
  { icon: FileText,    text: "Screenshot plans + mockups" },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "demo@launchos.dev", password: "demo1234" },
  });

  async function onSubmit(data: LoginInput) {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl,
      });
      if (result?.error) {
        toast({ title: "Invalid credentials", description: "Check your email and password.", variant: "destructive" });
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">

      {/* ── Left: Value prop ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 10% 80%, white 0%, transparent 50%)" }} />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg">LaunchOS</span>
        </Link>

        {/* Main message */}
        <div className="relative space-y-6">
          <h2 className="text-3xl font-extrabold leading-snug">
            Your entire App Store launch workflow — automated by AI
          </h2>
          <p className="text-violet-200 leading-relaxed">
            Thousands of mobile teams use LaunchOS to ship better listings, run smarter A/B tests, and grow organic installs — in a fraction of the time.
          </p>
          <div className="space-y-3">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative rounded-2xl bg-white/10 p-5 border border-white/20">
          <div className="flex gap-0.5 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-amber-300 text-sm">★</span>
            ))}
          </div>
          <p className="text-sm text-violet-100 leading-relaxed mb-3">
            &ldquo;LaunchOS cut our store copy writing time from 2 days to 2 hours. The AI understands ASO better than most consultants.&rdquo;
          </p>
          <p className="text-xs font-semibold">Marcus K. — Head of Growth, Fintech Startup</p>
        </div>
      </div>

      {/* ── Right: Login form ── */}
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
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your workspace</p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 border-0" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </form>

            {/* Demo hint */}
            <div className="rounded-xl bg-muted/60 border border-border/50 p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Demo credentials
              </p>
              <p className="text-xs text-muted-foreground font-mono">demo@launchos.dev / demo1234</p>
            </div>
          </div>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline font-semibold">
              Sign up free
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
