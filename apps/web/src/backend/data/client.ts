
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'فشل الطلب');
  return json.data as T;
}

export const dataClient = {
  get: <T,>(path: string) => request<T>(`/api/data/${path}`),

  post: <T,>(path: string, body: unknown) =>
    request<T>(`/api/data/${path}`, { method: 'POST', body: JSON.stringify(body) }),

  patch: <T,>(path: string, body: unknown) =>
    request<T>(`/api/data/${path}`, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T,>(path: string) =>
    request<T>(`/api/data/${path}`, { method: 'DELETE' }),
};
