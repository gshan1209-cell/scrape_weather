import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { WeeklyAdvisoryResponse } from "@/features/advisory/types";

export function FarmerAdviceCard({ advisory, loading }: { advisory?: WeeklyAdvisoryResponse; loading: boolean }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-stone-500">農事提醒</div>
        {advisory && <Badge tone={advisory.riskLevel}>{riskLabel(advisory.riskLevel)}</Badge>}
      </div>
      {loading ? (
        <div className="mt-4 text-sm text-stone-500">正在產生建議...</div>
      ) : advisory ? (
        <p className="mt-4 text-lg font-medium leading-7 text-stone-900">{advisory.summary}</p>
      ) : (
        <div className="mt-4 text-sm text-stone-500">尚無農事提醒。</div>
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
