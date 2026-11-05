import { CloudSun, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { WeeklyAdvisoryResponse } from "@/features/advisory/types";
import type { DataState } from "@/lib/weather-state";

export function FarmerAdviceCard({ advisory, state }: { advisory?: WeeklyAdvisoryResponse; loading: boolean; state: DataState }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-field-50">
            <CloudSun className="h-4 w-4 text-field" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">農事提醒</p>
        </div>
        <Badge tone={state.kind === "ready" ? advisory?.riskLevel : state.tone}>{state.kind === "ready" && advisory ? riskLabel(advisory.riskLevel) : state.title}</Badge>
      </div>

      {state.kind === "loading" ? (
        <div className="mt-5 flex items-center gap-2 text-sm text-stone-400">
          <span className="h-2 w-2 animate-pulse-soft rounded-full bg-field" />
          正在產生建議...
        </div>
      ) : state.showData && advisory ? (
        <>
          <p className="mt-4 text-lg font-bold leading-relaxed text-stone-900">{advisory.summary}</p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-stone-400">
            <TrendingUp className="h-3.5 w-3.5" />
            {advisory.suggestions.length} 項作業建議
          </div>
        </>
      ) : (
        <div className="mt-5 text-sm text-stone-500">{state.title}：{state.message}</div>
      )}
    </Card>
  );
}

function riskLabel(level: string) {
  if (level === "danger") return "高風險";
  if (level === "warning") return "注意";
  if (level === "normal") return "正常";
  return level;
}
