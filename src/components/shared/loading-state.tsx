import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 py-3">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}

export function AILoadingState({ message = "AI is thinking..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border bg-muted/30 p-12 text-center">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-primary" />
      </div>
      <div>
        <p className="font-medium text-sm">{message}</p>
        <p className="text-xs text-muted-foreground mt-1">This usually takes 5-15 seconds</p>
      </div>
    </div>
  );
}
