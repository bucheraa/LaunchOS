import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 text-center p-6">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-semibold">LaunchOS</span>
      </Link>

      <p className="text-8xl font-bold text-muted-foreground/20 select-none leading-none">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
