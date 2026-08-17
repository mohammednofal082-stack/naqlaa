import * as SecureStore from "expo-secure-store";

const DEFAULT_API = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") || "";
const SESSION_KEY = "naqlah_mobile_session";

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

export type MobileSession = {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  roles?: string[];
  avatar?: string;
  organizationId?: string;
  accessToken?: string;
};

export async function saveSession(session: MobileSession | null) {
  if (!session) {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function loadSession(): Promise<MobileSession | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MobileSession;
  } catch {
    return null;
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const session = await loadSession();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return headers;
}

async function parseEnvelope<T>(res: Response): Promise<T> {
  const json = (await res.json()) as ApiEnvelope<T> & { user?: MobileSession; redirect?: string };
  if (!res.ok) {
    if (res.status === 401) {
      await SecureStore.deleteItemAsync(SESSION_KEY);
    }
    throw new Error(json.error || json.code || "REQUEST_FAILED");
  }
  return (json.data ?? (json as unknown as T)) as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) throw new Error("API_URL_MISSING");
  const res = await fetch(`${base}/api/data/${path.replace(/^\//, "")}`, {
    headers: await authHeaders(),
  });
  return parseEnvelope<T>(res);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) throw new Error("API_URL_MISSING");
  const res = await fetch(`${base}/api/data/${path.replace(/^\//, "")}`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(body ?? {}),
  });
  return parseEnvelope<T>(res);
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) throw new Error("API_URL_MISSING");
  const res = await fetch(`${base}/api/data/${path.replace(/^\//, "")}`, {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify(body ?? {}),
  });
  return parseEnvelope<T>(res);
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) throw new Error("API_URL_MISSING");
  const res = await fetch(`${base}/api/data/${path.replace(/^\//, "")}`, {
    method: "PUT",
    headers: await authHeaders(),
    body: JSON.stringify(body ?? {}),
  });
  return parseEnvelope<T>(res);
}

export async function apiLogin(input: {
  email: string;
  password: string;
  role?: string;
}): Promise<{ user: MobileSession; redirect?: string }> {
  const base = getApiBaseUrl();
  if (!base) throw new Error("API_URL_MISSING");
  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "LOGIN_FAILED");
  const user = {
    ...(json.user as MobileSession),
    userId: json.user.userId || json.user.id,
    accessToken: json.token || json.user.accessToken,
  } as MobileSession;
  await saveSession(user);
  return { user, redirect: json.redirect };
}

export async function apiRegister(input: {
  fullName: string;
  emailLocal: string;
  password: string;
  role: "student" | "graduate";
  university: string;
  universityName?: string;
  major?: string;
}): Promise<{ pending?: boolean; message?: string }> {
  const base = getApiBaseUrl();
  if (!base) throw new Error("API_URL_MISSING");
  const res = await fetch(`${base}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "REGISTER_FAILED");
  return json as { pending?: boolean; message?: string };
}

export async function apiLogout() {
  const base = getApiBaseUrl();
  if (base) {
    try {
      await fetch(`${base}/api/auth/logout`, { method: "POST", headers: await authHeaders() });
    } catch {
      // ignore network errors on logout
    }
  }
  await saveSession(null);
}
