import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, pattern = "MMM d, yyyy") {
  return format(new Date(date), pattern);
}

export function timeAgo(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function platformLabel(platform: string) {
  const labels: Record<string, string> = {
    IOS: "iOS",
    ANDROID: "Android",
  };
  return labels[platform] ?? platform;
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    READY: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    LIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    ARCHIVED: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    PLANNED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    RUNNING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    PAUSED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    OPEN: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    DONE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    DISMISSED: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    CONNECTED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    DISCONNECTED: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    ERROR: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };
  return colors[status] ?? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
}

export function priorityColor(priority: string): string {
  const colors: Record<string, string> = {
    LOW: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    CRITICAL: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return colors[priority] ?? colors.MEDIUM;
}

export function effortLabel(effort: string) {
  return capitalize(effort);
}

export function categoryLabel(category: string) {
  const labels: Record<string, string> = {
    PRODUCTIVITY: "Productivity",
    SOCIAL: "Social",
    HEALTH_FITNESS: "Health & Fitness",
    FINANCE: "Finance",
    EDUCATION: "Education",
    ENTERTAINMENT: "Entertainment",
    LIFESTYLE: "Lifestyle",
    SHOPPING: "Shopping",
    TRAVEL: "Travel",
    FOOD_DRINK: "Food & Drink",
    NEWS: "News",
    PHOTO_VIDEO: "Photo & Video",
    MUSIC: "Music",
    GAMES: "Games",
    UTILITIES: "Utilities",
    DEVELOPER_TOOLS: "Developer Tools",
    BUSINESS: "Business",
    OTHER: "Other",
  };
  return labels[category] ?? category;
}

export function pricingLabel(pricing: string) {
  const labels: Record<string, string> = {
    FREE: "Free",
    FREEMIUM: "Freemium",
    SUBSCRIPTION: "Subscription",
    ONE_TIME: "One-Time Purchase",
    PAYWALLED: "Premium / Paywalled",
  };
  return labels[pricing] ?? pricing;
}

export function generateInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
