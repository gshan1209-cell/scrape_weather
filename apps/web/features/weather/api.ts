import { apiGet } from "@/lib/api-client";
import { WeeklyWeatherResponse } from "./types";

export function fetchWeeklyWeather(city: string, district?: string) {
  const params = new URLSearchParams({ city });
  if (district) params.set("district", district);
  return apiGet<WeeklyWeatherResponse>(`/weather/weekly?${params.toString()}`);
}
