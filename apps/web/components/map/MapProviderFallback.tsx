import { AlertBanner } from "@/components/farmer/AlertBanner";
import { WeeklyAdvisoryResponse } from "@/features/advisory/types";
import type { WeatherMapConfig } from "@/features/weather-map/types";
import { LeafletWeatherMap } from "./LeafletWeatherMap";

type Props = {
  reason: string;
  config: WeatherMapConfig;
  city: string;
  district?: string;
  crop?: string;
  advisory?: WeeklyAdvisoryResponse;
  onLocationSelect?: (city: string, district?: string) => void;
};

export function MapProviderFallback({ reason, config, city, district, crop, advisory, onLocationSelect }: Props) {
  return (
    <div className="space-y-3">
      <AlertBanner level="warning" title="天氣地圖已切換備援" message={reason} />
      <LeafletWeatherMap config={{ ...config, provider: "mock" }} city={city} district={district} crop={crop} advisory={advisory} onLocationSelect={onLocationSelect} />
    </div>
  );
}
