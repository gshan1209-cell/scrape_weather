import { useCallback } from "react";
import { useApiResource } from "@/lib/use-api-resource";
import { fetchWeeklyAdvisory } from "./api";

export function useWeeklyAdvisory(city: string, district?: string, crop?: string) {
  const request = useCallback(() => fetchWeeklyAdvisory(city, district, crop), [city, district, crop]);
  return useApiResource(request);
}
