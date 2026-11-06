import { apiGet } from "./api-client";
import { demoGet } from "./demo-data";

export function isDemoMode(): boolean {
  return !process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
}

export async function weatherGet<T>(path: string): Promise<T> {
  // Only absent configuration selects local demo. Invalid or failed APIs stay errors.
  if (isDemoMode()) return demoGet<T>(path);
  return apiGet<T>(path);
}
