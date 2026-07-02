import { AlertBanner } from "@/components/farmer/AlertBanner";
import type { WeatherMapConfig } from "@/features/weather-map/types";
import { WindyInspiredMap } from "./WindyInspiredMap";

type Props = {
  reason: string;
  config: WeatherMapConfig;
  city: string;
  district?: string;
};

export function MapProviderFallback({ reason, config, city, district }: Props) {
  return (
    <div className="space-y-3">
      <AlertBanner level="warning" title="Weather map fallback" message={reason} />
      <WindyInspiredMap config={{ ...config, provider: "mock" }} city={city} district={district} />
    </div>
  );
}
