import { useCallback, useEffect, useState } from "react";
import { fetchWeeklyWeather } from "./api";
import { WeeklyWeatherResponse } from "./types";

export function useWeeklyWeather(city: string, district?: string) {
  const [data, setData] = useState<WeeklyWeatherResponse>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  const load = useCallback(() => {
    setLoading(true);
    setError(undefined);
    fetchWeeklyWeather(city, district)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [city, district]);

  useEffect(() => load(), [load]);

  return { data, loading, error, reload: load };
}
