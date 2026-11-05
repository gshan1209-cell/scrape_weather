import { Badge } from "@/components/ui/badge";
import { WeeklyAdvisoryResponse } from "@/features/advisory/types";
import type { DataState } from "@/lib/weather-state";

export function MapFloatingAdvice({ advisory, crop, state }: { advisory?: WeeklyAdvisoryResponse; crop?: string; state: DataState }) {
  const officialAdvice = state.kind === "ready" && advisory;
  return (
    <div className="absolute bottom-24 right-3 max-w-[220px] rounded-xl bg-white/95 p-3.5 text-stone-900 shadow-elevated backdrop-blur md:bottom-20">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold">田間訊號</div>
        <Badge tone={officialAdvice ? advisory.riskLevel : state.tone}>{officialAdvice ? riskLabel(advisory.riskLevel) : state.title}</Badge>
      </div>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-stone-600">
        {state.showData && advisory ? `${state.kind === "mock" ? "模擬提醒：" : ""}${advisory.summary}` : state.kind === "loading" ? `正在載入${crop || "作物"}的一週風險提醒。` : state.message}
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
