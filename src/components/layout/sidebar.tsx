"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Folders,
  Settings,
  Zap,
  Plus,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateInitials } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  description?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard",  icon: LayoutDashboard, exact: true, description: "Overview & insights" },
  { href: "/projects",  label: "Projects",   icon: Folders,                       description: "Your apps & ASO health" },
  { href: "/settings",  label: "Settings",   icon: Settings,                      description: "Workspace & integrations" },
];

const PLAN_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  FREE:    { label: "Free",    color: "text-slate-500",   bg: "bg-slate-100 dark:bg-slate-800" },
  STARTER: { label: "Starter", color: "text-violet-600",  bg: "bg-violet-100 dark:bg-violet-900/40" },
  GROWTH:  { label: "Growth",  color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
};

interface SidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  workspaceName: string;
  plan?: string;
}

export function Sidebar({ user, workspaceName, plan = "FREE" }: SidebarProps) {
  const pathname  = usePathname();
  const planInfo  = PLAN_LABELS[plan] ?? PLAN_LABELS.FREE;

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">

      {/* ── Logo & tagline ── */}
      <div className="flex h-16 items-center px-5 border-b shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-sm group-hover:shadow-violet-500/30 group-hover:shadow-md transition-shadow shrink-0">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-sm tracking-tight">LaunchOS</span>
            <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">App Store Growth Platform</span>
          </div>
        </Link>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-3 mb-2.5">
          Navigation
        </p>

        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                isActive
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium shadow-sm shadow-violet-500/20"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "group-hover:scale-110 transition-transform")} />
              <div className="flex-1 min-w-0">
                <p className="truncate leading-none">{item.label}</p>
                {!isActive && item.description && (
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">{item.description}</p>
                )}
              </div>
              {isActive && <ChevronRight className="h-3.5 w-3.5 text-white/70 shrink-0" />}
            </Link>
          );
        })}

        {/* ── New Project CTA ── */}
        <div className="pt-4 pb-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-3 mb-2.5">
            Actions
          </p>
          <Link
            href="/projects/new"
            className="group flex items-center gap-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-200/50 dark:border-violet-800/50 px-3 py-2.5 text-sm text-violet-700 dark:text-violet-300 hover:from-violet-500/20 hover:to-purple-500/20 hover:border-violet-300 dark:hover:border-violet-700 transition-all font-medium"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-purple-600 shrink-0">
              <Plus className="h-3 w-3 text-white" />
            </div>
            New Project
            <ArrowUpRight className="h-3.5 w-3.5 ml-auto opacity-60 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </nav>

      {/* ── Upgrade CTA (FREE only) ── */}
      {plan === "FREE" && (
        <div className="mx-3 mb-3 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 p-3.5 text-white shadow-sm shadow-violet-500/20">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-violet-200" />
            <p className="text-xs font-bold">Upgrade to Starter</p>
          </div>
          <p className="text-[11px] text-violet-200 mb-2.5 leading-snug">
            Unlock keyword research, screenshot mockups, competitor analysis & more.
          </p>
          <Link
            href="/settings"
            className="flex items-center justify-center gap-1 w-full rounded-lg bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-semibold transition-colors"
          >
            View plans <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* ── User ── */}
      <div className="border-t p-3 shrink-0">
        <Link href="/settings" className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent transition-colors cursor-pointer group">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="text-xs bg-gradient-to-br from-violet-400 to-purple-600 text-white font-semibold">
              {generateInitials(user.name ?? user.email ?? "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{user.name ?? "User"}</p>
            <p className="text-[11px] text-muted-foreground truncate">{workspaceName}</p>
          </div>
          <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold shrink-0", planInfo.bg, planInfo.color)}>
            {planInfo.label.toUpperCase()}
          </span>
        </Link>
      </div>
    </aside>
  );
}
