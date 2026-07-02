import { Badge } from "@/components/ui/badge";
import { WeeklyAdvisoryResponse } from "@/features/advisory/types";

export function MapFloatingAdvice({ advisory, crop }: { advisory?: WeeklyAdvisoryResponse; crop?: string }) {
  return (
    <div className="absolute bottom-24 right-3 max-w-xs rounded-md bg-white/95 p-4 text-stone-900 shadow-sm backdrop-blur md:bottom-20">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">Field signal</div>
        <Badge tone={advisory?.riskLevel ?? "info"}>{advisory?.riskLevel ?? "loading"}</Badge>
      </div>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-700">
        {advisory?.summary ?? `Loading weekly risk guidance${crop ? ` for ${crop}` : ""}.`}
      </p>
    </div>
  );
}
