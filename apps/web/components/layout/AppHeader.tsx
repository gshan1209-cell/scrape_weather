import { Sprout } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 font-semibold text-stone-900">
          <Sprout className="h-5 w-5 text-field" />
          Weather Farmer
        </div>
        <span className="text-xs font-medium text-stone-500">CWA MVP</span>
      </div>
    </header>
  );
}
