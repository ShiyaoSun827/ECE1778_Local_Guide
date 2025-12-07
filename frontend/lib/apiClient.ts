// frontend/lib/apiClient.ts
import { authClient } from "./authClient";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://local-guide-backend.fly.dev";

type ApiInit = RequestInit & {
  // 可以添加自定义扩展
};

export async function apiFetch(path: string, init: ApiInit = {}) {
  const cookies = authClient.getCookie();

  // 🔍 关键修复：检查 body 是否为 FormData
  const isFormData = init.body instanceof FormData;

  // 如果是 FormData，千万不要手动设置 Content-Type，让 fetch 自动生成 boundary
  const defaultHeaders = isFormData 
    ? {} 
    : { "Content-Type": "application/json" };

  const headers: Record<string, string> = {
    ...defaultHeaders,
    ...(init.headers as any),
  };

  if (cookies) {
    headers["Cookie"] = cookies;
  }

  try {
    const res = await fetch(API_BASE_URL + path, {
      ...init,
      headers,
      credentials: "omit",
    });
    return res;
  } catch (error) {
    // 增加一点调试信息，方便看具体的网络错误
    console.error(`[apiFetch] Network Request Failed for ${path}:`, error);
    throw error;
  }
}