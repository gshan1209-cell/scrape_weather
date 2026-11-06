import { weatherGet } from "@/lib/weather-api";
import { LocationListResponse } from "./types";

export function fetchLocations() {
  return weatherGet<LocationListResponse>("/locations");
}
