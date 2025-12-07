// frontend/lib/apiClient.ts
import { authClient } from "./authClient";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://local-guide-backend.fly.dev";

type ApiInit = RequestInit & {

};

export async function apiFetch(path: string, init: ApiInit = {}) {
  const cookies = authClient.getCookie();


  const isFormData = init.body instanceof FormData;

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
    
    console.error(`[apiFetch] Network Request Failed for ${path}:`, error);
    throw error;
  }
}