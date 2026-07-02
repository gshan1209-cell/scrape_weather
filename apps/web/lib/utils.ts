import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function tempToColor(temp: number): string {
  if (temp >= 35) return "#b91c1c";
  if (temp >= 32) return "#dc2626";
  if (temp >= 29) return "#ea580c";
  if (temp >= 26) return "#f59e0b";
  if (temp >= 23) return "#84cc16";
  if (temp >= 20) return "#22c55e";
  if (temp >= 16) return "#06b6d4";
  return "#3b82f6";
}

export function tempToGradient(temp: number): string {
  const c = tempToColor(temp);
  return `linear-gradient(135deg, ${c}dd 0%, ${c} 40%, ${c}cc 100%)`;
}
