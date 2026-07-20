"use client";

import { useCallback, useEffect, useState } from "react";

interface ApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  provider: string | null;
  refetch: () => Promise<void>;
}

export function useDataApi<T>(endpoint: string): ApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/data/${endpoint}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل جلب البيانات");
      setData(json.data as T);
      setProvider(json.provider ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ غير معروف");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, provider, refetch: fetchData };
}
