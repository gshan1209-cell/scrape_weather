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
};

export function WeatherMapShell({ city, district, crop, advisory }: Props) {
  const config = getWeatherMapConfig();

  if (config.provider === "windy" && config.windyApiKey) {
    return <WindyMapClient config={config} city={city} district={district} crop={crop} advisory={advisory} />;
  }

  return <LeafletWeatherMap config={config} city={city} district={district} crop={crop} advisory={advisory} />;
}
