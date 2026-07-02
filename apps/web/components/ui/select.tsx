import { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

export function Select({ label, className, ...props }: Props) {
  return (
    <label className="grid gap-1 text-sm font-medium text-stone-700">
      {label}
      <select className={cn("h-10 rounded-md border border-stone-300 bg-white px-3 text-sm", className)} {...props} />
    </label>
  );
}
