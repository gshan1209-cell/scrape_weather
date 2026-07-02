import { useCallback, useEffect, useState } from "react";
import { fetchStations, fetchWeeklyWeather } from "./api";
import { StationsResponse, WeeklyWeatherResponse } from "./types";

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

export function useStations() {
  const [data, setData] = useState<StationsResponse>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  const load = useCallback(() => {
    setLoading(true);
    setError(undefined);
    fetchStations()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(), [load]);

  return { data, loading, error, reload: load };
}
