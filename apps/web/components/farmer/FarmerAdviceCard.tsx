import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { WeeklyAdvisoryResponse } from "@/features/advisory/types";

export function FarmerAdviceCard({ advisory, loading }: { advisory?: WeeklyAdvisoryResponse; loading: boolean }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-stone-500">Farmer advisory</div>
        {advisory && <Badge tone={advisory.riskLevel}>{advisory.riskLevel}</Badge>}
      </div>
      {loading ? (
        <div className="mt-4 text-sm text-stone-500">Building advice...</div>
      ) : advisory ? (
        <p className="mt-4 text-lg font-medium leading-7 text-stone-900">{advisory.summary}</p>
      ) : (
        <div className="mt-4 text-sm text-stone-500">No advisory loaded.</div>
      )}
    </Card>
  );
}
