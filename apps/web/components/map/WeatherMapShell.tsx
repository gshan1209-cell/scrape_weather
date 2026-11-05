"use client";

import { WeeklyAdvisoryResponse } from "@/features/advisory/types";
import { getWeatherMapConfig } from "@/features/weather-map/config";
import type { StationsResponse } from "@/features/weather/types";
import { LeafletWeatherMap } from "./LeafletWeatherMap";
import { WindyMapClient } from "./WindyMapClient";
import type { DataState } from "@/lib/weather-state";

type Props = {
  city: string;
  district?: string;
  crop?: string;
  advisory?: WeeklyAdvisoryResponse;
  adviceState: DataState;
  stations?: StationsResponse;
  stationState: DataState;
  onLocationSelect?: (city: string, district?: string) => void;
};

export function WeatherMapShell({ city, district, crop, advisory, adviceState, stations, stationState, onLocationSelect }: Props) {
  const config = getWeatherMapConfig();

  if (config.provider === "windy" && config.windyApiKey) {
    return <WindyMapClient config={config} city={city} district={district} crop={crop} advisory={advisory} adviceState={adviceState} stations={stations} stationState={stationState} onLocationSelect={onLocationSelect} />;
  }

  return <LeafletWeatherMap config={config} city={city} district={district} crop={crop} advisory={advisory} adviceState={adviceState} stations={stations} stationState={stationState} onLocationSelect={onLocationSelect} />;
}
