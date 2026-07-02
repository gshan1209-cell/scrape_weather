import { apiGet } from "@/lib/api-client";
import type { HealthResponse } from "./types";

export function fetchHealth() {
  return apiGet<HealthResponse>("/health");
}
