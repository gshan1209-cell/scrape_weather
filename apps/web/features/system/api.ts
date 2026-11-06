import { weatherGet } from "@/lib/weather-api";
import type { HealthResponse } from "./types";

export function fetchHealth() {
  return weatherGet<HealthResponse>("/health");
}
