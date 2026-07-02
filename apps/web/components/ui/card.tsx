import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-stone-200/80 bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-elevated",
        className,
      )}
      {...props}
    />
  );
}
