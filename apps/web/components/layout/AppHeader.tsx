import { Sprout } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200/60 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-field-50">
            <Sprout className="h-4 w-4 text-field" />
          </div>
          <span className="text-base font-bold tracking-tight text-stone-900">農事天氣</span>
        </div>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-medium text-stone-500">
          CWA 開放資料 MVP
        </span>
      </div>
    </header>
  );
}
