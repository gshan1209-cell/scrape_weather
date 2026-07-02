import { useCallback, useEffect, useState } from "react";
import { fetchWeeklyAdvisory } from "./api";
import { WeeklyAdvisoryResponse } from "./types";

export function useWeeklyAdvisory(city: string, district?: string, crop?: string) {
  const [data, setData] = useState<WeeklyAdvisoryResponse>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  const load = useCallback(() => {
    setLoading(true);
    setError(undefined);
    fetchWeeklyAdvisory(city, district, crop)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [city, district, crop]);

  useEffect(() => load(), [load]);

  return { data, loading, error, reload: load };
}
