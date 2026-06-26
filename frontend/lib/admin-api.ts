const API_BASE = "/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

export function setToken(token: string) {
  localStorage.setItem("admin_token", token);
}

export function clearToken() {
  localStorage.removeItem("admin_token");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/admin/login";
    throw new Error("未授权，请重新登录");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`请求失败: ${res.status} ${text}`);
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export interface LoginResponse {
  code: number;
  data: { accessToken: string; username: string; nickname: string };
}

export interface DashboardStats {
  counts: {
    posts: number; drafts: number; categories: number; tags: number;
    comments: number; messages: number; visitors: number;
  };
  post_trend: { date: string; count: number }[];
  visitor_trend: { date: string; count: number }[];
  category_distribution: { name: string; value: number }[];
  browser_distribution: { name: string; value: number }[];
}

export interface Project {
  id: number; name: string; slug: string; description: string;
  long_description: string; cover_image: string;
  tech_stack: string[]; link_github: string; link_gitee: string;
  link_live: string; link_docs: string; status: string;
  status_label: string; is_featured: boolean; sort: number;
  created_at: string;
}

export interface Post {
  id: number; title: string; slug: string; description: string;
  cover: string; category: string; tags: string[]; status: string;
  is_pinned: boolean; views: number; likes: number;
  word_count: number; reading_time: number;
  published_at: string | null; created_at: string; updated_at: string;
}

export interface PostDetail extends Post { content: string; }

export interface SiteConfig {
  id: number; key: string; value: string; description: string;
}
