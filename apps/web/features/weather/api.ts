import { weatherGet } from "@/lib/weather-api";
import { StationsResponse, WeeklyWeatherResponse } from "./types";

export function fetchWeeklyWeather(city: string, district?: string) {
  const params = new URLSearchParams({ city });
  if (district) params.set("district", district);
  return weatherGet<WeeklyWeatherResponse>(`/weather/weekly?${params.toString()}`);
}

export function fetchStations() {
  return weatherGet<StationsResponse>("/weather/stations");
}
