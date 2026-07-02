"use client";

import { WeeklyAdvisoryResponse } from "@/features/advisory/types";
import { getWeatherMapConfig } from "@/features/weather-map/config";
import { LeafletWeatherMap } from "./LeafletWeatherMap";
import { WindyMapClient } from "./WindyMapClient";

type Props = {
  city: string;
  district?: string;
  crop?: string;
  advisory?: WeeklyAdvisoryResponse;
  onLocationSelect?: (city: string, district?: string) => void;
};

export function WeatherMapShell({ city, district, crop, advisory, onLocationSelect }: Props) {
  const config = getWeatherMapConfig();

  if (config.provider === "windy" && config.windyApiKey) {
    return <WindyMapClient config={config} city={city} district={district} crop={crop} advisory={advisory} onLocationSelect={onLocationSelect} />;
  }

  return <LeafletWeatherMap config={config} city={city} district={district} crop={crop} advisory={advisory} onLocationSelect={onLocationSelect} />;
}
