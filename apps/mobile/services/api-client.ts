const DEFAULT_API = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") || "";

export function getApiBaseUrl() {
  return DEFAULT_API;
}

export function isRemoteApiEnabled() {
  return Boolean(DEFAULT_API);
}

type ApiEnvelope<T> = {
  data: T;
  provider?: string;
  error?: string;
  code?: string;
};

export async function apiGet<T>(path: string): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error("API_URL_MISSING");
  }
  const res = await fetch(`${base}/api/data/${path.replace(/^\//, "")}`);
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok) {
    throw new Error(json.error || json.code || "REQUEST_FAILED");
  }
  return json.data;
}
