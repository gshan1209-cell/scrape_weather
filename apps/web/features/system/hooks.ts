import { useCallback, useEffect, useState } from "react";
import { fetchHealth } from "./api";
import type { HealthResponse } from "./types";

export function useSystemHealth() {
  const [data, setData] = useState<HealthResponse>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  const load = useCallback(() => {
    setLoading(true);
    setError(undefined);
    fetchHealth()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(), [load]);

  return { data, loading, error, reload: load };
}
