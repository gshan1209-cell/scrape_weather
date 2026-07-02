import { apiGet } from "@/lib/api-client";
import { LocationListResponse } from "./types";

export function fetchLocations() {
  return apiGet<LocationListResponse>("/locations");
}
