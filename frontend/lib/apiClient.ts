// frontend/lib/apiClient.ts
import { authClient } from "./authClient";

// 这里用你现在在手机上访问后端的地址
// 比如 http://192.168.0.10:3000 或者 https://your-domain.com
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.0.10:3000";

type ApiInit = RequestInit & {
  // 防止类型报错，React Native 的 fetch 也兼容这些字段
};

export async function apiFetch(path: string, init: ApiInit = {}) {
  // 关键：从 Better Auth 的 Expo 客户端里拿 cookie 字符串
  // 文档示例就是这么用的：const cookies = authClient.getCookie()
  const cookies = authClient.getCookie();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as any),
  };

  if (cookies) {
    // 手动把 session cookie 塞进请求头
    headers["Cookie"] = cookies;
  }

  const res = await fetch(API_BASE_URL + path, {
    ...init,
    headers,
    // ❗ 文档里明确说了：不要再用 credentials: "include"
    // 不然会干扰我们手动设置的 Cookie 头
    credentials: "omit",
  });

  return res;
}
