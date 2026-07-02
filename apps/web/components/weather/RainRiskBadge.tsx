import { Badge } from "@/components/ui/badge";

export function RainRiskBadge({ value }: { value?: number | null }) {
  const tone = value == null ? "info" : value >= 60 ? "warning" : "normal";
  return <Badge tone={tone}>Rain {value ?? "--"}%</Badge>;
}
