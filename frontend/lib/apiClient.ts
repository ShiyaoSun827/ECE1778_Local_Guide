// frontend/lib/apiClient.ts
import { authClient } from "./authClient";


const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.0.10:3000";

type ApiInit = RequestInit & {

};

export async function apiFetch(path: string, init: ApiInit = {}) {

  const cookies = authClient.getCookie();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as any),
  };

  if (cookies) {

    headers["Cookie"] = cookies;
  }

  const res = await fetch(API_BASE_URL + path, {
    ...init,
    headers,

    credentials: "omit",
  });

  return res;
}
