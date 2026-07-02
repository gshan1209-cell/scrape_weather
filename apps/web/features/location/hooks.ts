import { useCallback, useEffect, useState } from "react";
import { fetchLocations } from "./api";
import { LocationListResponse } from "./types";

export function useLocations() {
  const [data, setData] = useState<LocationListResponse>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  const load = useCallback(() => {
    setLoading(true);
    setError(undefined);
    fetchLocations()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(), [load]);

  return { data, loading, error, reload: load };
}
