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
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateInitials } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/projects", label: "Projects", icon: Folders },
  { href: "/settings", label: "Settings", icon: Settings },
];

const PLAN_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  FREE:    { label: "Free",    color: "text-slate-500",  bg: "bg-slate-100 dark:bg-slate-800" },
  STARTER: { label: "Starter", color: "text-violet-600", bg: "bg-violet-100 dark:bg-violet-900/40" },
  GROWTH:  { label: "Growth",  color: "text-emerald-600",bg: "bg-emerald-100 dark:bg-emerald-900/40" },
};

interface SidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  workspaceName: string;
  plan?: string;
}

export function Sidebar({ user, workspaceName, plan = "FREE" }: SidebarProps) {
  const pathname = usePathname();
  const planInfo = PLAN_LABELS[plan] ?? PLAN_LABELS.FREE;

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-14 items-center px-5 border-b">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 shadow-sm">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight">LaunchOS</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 mb-2">
          Menu
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
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                isActive
                  ? "bg-primary text-primary-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0 transition-transform", isActive ? "" : "group-hover:scale-110")} />
              {item.label}
            </Link>
          );
        })}

        {/* New Project CTA */}
        <div className="pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 mb-2">
            Quick Actions
          </p>
          <Link
            href="/projects/new"
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
          >
            <div className="flex h-4 w-4 items-center justify-center rounded border border-dashed border-muted-foreground/50 group-hover:border-primary transition-colors">
              <Plus className="h-2.5 w-2.5" />
            </div>
            New Project
          </Link>
        </div>
      </nav>

      {/* Plan upgrade CTA for FREE users */}
      {plan === "FREE" && (
        <div className="mx-3 mb-3 rounded-xl bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-pink-500/10 border border-violet-200/50 dark:border-violet-800/50 p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">Upgrade to Starter</p>
          </div>
          <p className="text-[11px] text-muted-foreground mb-2.5">
            Unlock keyword research, screenshot mockups &amp; competitor analysis.
          </p>
          <Link
            href="/settings"
            className="flex items-center justify-center gap-1 w-full rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
          >
            View plans <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* User */}
      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent transition-colors cursor-pointer">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="text-xs bg-gradient-to-br from-violet-400 to-purple-600 text-white font-medium">
              {generateInitials(user.name ?? user.email ?? "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{user.name ?? "User"}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium", planInfo.bg, planInfo.color)}>
                {planInfo.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
