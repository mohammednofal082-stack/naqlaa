import { useCallback, useEffect, useState } from "react";
import { apiGet, isRemoteApiEnabled } from "../services/api-client";

export function useRemoteData<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"api" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isRemoteApiEnabled()) {
        setData(null);
        setSource(null);
        setError("API_URL_MISSING");
        return;
      }
      const remote = await apiGet<T>(path);
      setData(remote);
      setSource("api");
    } catch (e) {
      setData(null);
      setSource(null);
      setError(e instanceof Error ? e.message : "REQUEST_FAILED");
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, source, refetch: load };
}
