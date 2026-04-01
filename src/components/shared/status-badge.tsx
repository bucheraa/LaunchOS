import { cn, statusColor, priorityColor } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = status.replace(/_/g, " ");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusColor(status),
        className
      )}
    >
      {label.charAt(0) + label.slice(1).toLowerCase()}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        priorityColor(priority),
        className
      )}
    >
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  );
}
