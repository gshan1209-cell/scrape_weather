import { CheckCircle2 } from "lucide-react";

export function WorkSuggestionCard({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-md border border-stone-200 bg-white p-3 text-sm text-stone-700 shadow-sm">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-field" />
      <span>{text}</span>
    </div>
  );
}
