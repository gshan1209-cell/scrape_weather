"use client";

import { useCallback, useEffect, useState } from "react";

type Resource<T> = {request: () => Promise<T>; data?: T; loading: boolean; error?: Error};

export function useApiResource<T>(request: () => Promise<T>) {
  const [result, setResult] = useState<Resource<T>>({request, loading: true});
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => {
    setResult({request, loading: true});
    setRevision(value => value + 1);
  }, [request]);

  useEffect(() => {
    let active = true;
    setResult({request, loading: true});
    request().then(
      data => {if (active) setResult({request, data, loading: false});},
      error => {if (active) setResult({request, loading: false, error: error instanceof Error ? error : new Error("資料無法取得")});},
    );
    return () => {active = false;};
  }, [request, revision]);

  const current: Omit<Resource<T>, "request"> = result.request === request ? result : {loading: true};
  return {data: current.data, loading: current.loading, error: current.error, reload};
}
