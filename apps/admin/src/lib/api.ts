const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function getApiUrl(): string {
  return API_URL;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("cms_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 401) {
    const refreshToken = localStorage.getItem("cms_refresh");
    if (refreshToken) {
      const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (refreshRes.ok) {
        const data = (await refreshRes.json()) as { accessToken: string; refreshToken: string };
        localStorage.setItem("cms_token", data.accessToken);
        localStorage.setItem("cms_refresh", data.refreshToken);
        headers["Authorization"] = `Bearer ${data.accessToken}`;
        const retryRes = await fetch(`${API_URL}${path}`, { ...options, headers });
        if (!retryRes.ok) {
          throw new Error(`API error: ${retryRes.status} ${retryRes.statusText}`);
        }
        return retryRes.json() as Promise<T>;
      }
      localStorage.removeItem("cms_token");
      localStorage.removeItem("cms_refresh");
      localStorage.removeItem("cms_user");
      window.location.href = "/login";
      throw new Error("Session expired");
    }
    localStorage.removeItem("cms_token");
    localStorage.removeItem("cms_refresh");
    localStorage.removeItem("cms_user");
    window.location.href = "/login";
    throw new Error("Not authenticated");
  }
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export type CollectionMeta = {
  slug: string;
  label: string;
  labels: { singular?: string; plural?: string };
  fields: Array<{ name: string; type: string; label: string; required: boolean }>;
};

export async function fetchCollections(): Promise<CollectionMeta[]> {
  return apiFetch<CollectionMeta[]>("/api/collections");
}
