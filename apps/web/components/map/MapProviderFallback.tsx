import { AlertBanner } from "@/components/farmer/AlertBanner";
import { WeeklyAdvisoryResponse } from "@/features/advisory/types";
import type { WeatherMapConfig } from "@/features/weather-map/types";
import { LeafletWeatherMap } from "./LeafletWeatherMap";
import type { DataState } from "@/lib/weather-state";
import type { StationsResponse } from "@/features/weather/types";

type Props = {
  reason: string;
  config: WeatherMapConfig;
  city: string;
  district?: string;
  crop?: string;
  advisory?: WeeklyAdvisoryResponse;
  adviceState: DataState;
  stations?: StationsResponse;
  stationState: DataState;
  onLocationSelect?: (city: string, district?: string) => void;
};

export function MapProviderFallback({ reason, config, city, district, crop, advisory, adviceState, stations, stationState, onLocationSelect }: Props) {
  return (
    <div className="space-y-3">
      <AlertBanner level="warning" title="天氣地圖已切換備援" message={reason} />
      <LeafletWeatherMap config={{ ...config, provider: "mock" }} city={city} district={district} crop={crop} advisory={advisory} adviceState={adviceState} stations={stations} stationState={stationState} onLocationSelect={onLocationSelect} />
    </div>
  );
}
