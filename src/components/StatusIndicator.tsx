import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  label: string;
  value: number;
  unit: string;
  status: "good" | "warning" | "danger";
  className?: string;
}

export function StatusIndicator({ label, value, unit, status, className }: StatusIndicatorProps) {
  return (
    <div className={cn("p-4 rounded-lg bg-dashboard-card", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <div className={cn(
          "h-2 w-2 rounded-full animate-pulse",
          status === "good" && "bg-dashboard-co2",
          status === "warning" && "bg-dashboard-pm25",
          status === "danger" && "bg-dashboard-co"
        )} />
      </div>
      <div className="text-2xl font-bold">
        {value.toFixed(1)}
        <span className="text-sm text-gray-400 ml-1">{unit}</span>
      </div>
    </div>
  );
}