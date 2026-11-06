import { useCallback } from "react";
import { useApiResource } from "@/lib/use-api-resource";
import { fetchStations, fetchWeeklyWeather } from "./api";

export function useWeeklyWeather(city: string, district?: string) {
  const request = useCallback(() => fetchWeeklyWeather(city, district), [city, district]);
  return useApiResource(request);
}

export function useStations() {
  const request = useCallback(() => fetchStations(), []);
  return useApiResource(request);
}
