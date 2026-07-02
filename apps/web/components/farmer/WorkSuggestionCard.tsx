export function WorkSuggestionCard({ text, index }: { text: string; index: number }) {
  return (
    <div className="flex gap-3 rounded-xl border border-stone-200/80 bg-white p-3.5 text-sm text-stone-700 shadow-card transition-shadow duration-200 hover:shadow-elevated">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-field-50 text-xs font-bold text-field">
        {index}
      </span>
      <span className="leading-relaxed">{text}</span>
    </div>
  );
}
