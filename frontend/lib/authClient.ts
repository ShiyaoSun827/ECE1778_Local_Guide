// frontend/lib/authClient.ts
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

// Read backend URL from environment variables
// Configure in frontend/.env: EXPO_PUBLIC_API_BASE_URL="http://192.168.0.10:3000"
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:3000";

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    expoClient({
      scheme: "localguide",   // Must match the scheme in app.json / auth.ts
      storagePrefix: "localguide",
      storage: SecureStore,
    }),
  ],
});
