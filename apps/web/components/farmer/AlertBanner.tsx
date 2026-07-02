import { AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const classes: Record<string, string> = {
  danger: "border-red-200 bg-red-50 text-red-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
};

export function AlertBanner({ level, title, message }: { level: string; title: string; message: string }) {
  const Icon = level === "info" ? Info : AlertCircle;
  return (
    <div className={cn("flex gap-3 rounded-md border p-4", classes[level] ?? classes.info)}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <div className="font-semibold">{title}</div>
        <div className="mt-1 text-sm leading-6">{message}</div>
      </div>
    </div>
  );
}
