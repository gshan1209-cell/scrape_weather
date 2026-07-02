import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const toneClass: Record<string, string> = {
  normal: "bg-emerald-100 text-emerald-800",
  info: "bg-sky-100 text-sky-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
};

export function Badge({ className, children, tone = "info", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: string }) {
  return (
    <span className={cn("inline-flex rounded px-2 py-1 text-xs font-semibold", toneClass[tone] ?? toneClass.info, className)} {...props}>
      {children}
    </span>
  );
}
