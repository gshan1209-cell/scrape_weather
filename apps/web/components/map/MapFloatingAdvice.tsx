import { Badge } from "@/components/ui/badge";
import { WeeklyAdvisoryResponse } from "@/features/advisory/types";

export function MapFloatingAdvice({ advisory, crop }: { advisory?: WeeklyAdvisoryResponse; crop?: string }) {
  return (
    <div className="absolute bottom-24 right-3 max-w-[220px] rounded-xl bg-white/95 p-3.5 text-stone-900 shadow-elevated backdrop-blur md:bottom-20">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold">田間訊號</div>
        <Badge tone={advisory?.riskLevel ?? "info"}>{riskLabel(advisory?.riskLevel)}</Badge>
      </div>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-stone-600">
        {advisory?.summary ?? `正在載入${crop ? crop : "作物"}的一週風險提醒。`}
      </p>
    </div>
  );
}

function riskLabel(level?: string) {
  if (!level) return "載入中";
  if (level === "danger") return "高風險";
  if (level === "warning") return "注意";
  if (level === "normal") return "正常";
  if (level === "info") return "資訊";
  return level;
}
