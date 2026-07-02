import { apiGet } from "@/lib/api-client";
import { WeeklyAdvisoryResponse } from "./types";

export function fetchWeeklyAdvisory(city: string, district?: string, crop?: string) {
  const params = new URLSearchParams({ city });
  if (district) params.set("district", district);
  if (crop) params.set("crop", crop);
  return apiGet<WeeklyAdvisoryResponse>(`/advisory/weekly?${params.toString()}`);
}
