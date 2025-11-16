// frontend/lib/authClient.ts
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

// 统一从环境变量里读后端地址
// 在 frontend/.env 里配置：EXPO_PUBLIC_API_BASE_URL="http://192.168.0.10:3000"
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:3000";

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    expoClient({
      scheme: "localguide",   // 和 app.json / auth.ts 里的 scheme 对应
      storagePrefix: "localguide",
      storage: SecureStore,
    }),
  ],
});
