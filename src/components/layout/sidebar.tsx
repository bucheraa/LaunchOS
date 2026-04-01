"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Folders,
  Settings,
  Zap,
  ChevronDown,
  Plus,
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

interface SidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  workspaceName: string;
}

export function Sidebar({ user, workspaceName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">LaunchOS</span>
        </Link>
      </div>

      {/* Workspace selector */}
      <div className="border-b px-3 py-2">
        <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-primary text-xs font-bold">
            {workspaceName.charAt(0).toUpperCase()}
          </div>
          <span className="flex-1 truncate text-left font-medium">{workspaceName}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Quick action */}
      <div className="border-t p-3">
        <Link
          href="/projects/new"
          className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors w-full"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      {/* User */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
          <Avatar className="h-7 w-7">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="text-xs">
              {generateInitials(user.name ?? user.email ?? "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user.name ?? "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
