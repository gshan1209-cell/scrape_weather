import { AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const classes: Record<string, string> = {
  danger: "border-red-200/80 bg-red-50 text-red-900",
  warning: "border-amber-200/80 bg-amber-50 text-amber-900",
  info: "border-sky-200/80 bg-sky-50 text-sky-900",
};

const iconColors: Record<string, string> = {
  danger: "text-red-500",
  warning: "text-amber-500",
  info: "text-sky-500",
};

export function AlertBanner({ level, title, message }: { level: string; title: string; message: string }) {
  const Icon = level === "info" ? Info : AlertCircle;
  return (
    <div className={cn("flex gap-3 rounded-xl border p-4", classes[level] ?? classes.info)}>
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconColors[level] ?? iconColors.info)} />
      <div>
        <div className="font-semibold">{title}</div>
        <div className="mt-1 text-sm leading-relaxed opacity-80">{message}</div>
      </div>
    </div>
  );
}
