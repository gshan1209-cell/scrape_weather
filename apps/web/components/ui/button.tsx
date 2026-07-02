import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const variantClass: Record<Variant, string> = {
  primary: "bg-stone-900 text-white hover:bg-stone-800 active:bg-stone-950",
  secondary: "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 hover:border-stone-300",
  ghost: "bg-transparent text-stone-600 hover:bg-stone-100",
};

export function Button({ className, variant = "primary", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed",
        variantClass[variant],
        className,
      )}
      {...props}
    />
  );
}
