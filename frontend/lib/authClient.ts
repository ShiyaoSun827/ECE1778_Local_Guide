// frontend/lib/authClient.ts
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

// Read backend URL from environment variables
// Configure in frontend/.env: EXPO_PUBLIC_API_BASE_URL="https://local-guide-backend.fly.dev"
// IMPORTANT: After changing .env, restart Expo with: npx expo start --clear

// Try multiple ways to get the environment variable
const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_BASE_URL || 
  (global as any).__EXPO_PUBLIC_API_BASE_URL__ ||
  "https://local-guide-backend.fly.dev"; // Fallback to production URL

// Better Auth expects the baseURL to point to the API auth endpoint
const AUTH_BASE_URL = `${API_BASE_URL}/api/auth`;

// Always log in development
console.log("[authClient] Configuration:");
console.log("  - EXPO_PUBLIC_API_BASE_URL env:", process.env.EXPO_PUBLIC_API_BASE_URL);
console.log("  - API_BASE_URL (using):", API_BASE_URL);
console.log("  - AUTH_BASE_URL (using):", AUTH_BASE_URL);

// Test connection on startup
if (__DEV__) {
  const testUrl = `${API_BASE_URL}/api/health`;
  console.log("[authClient] Testing connection to:", testUrl);
  
  fetch(testUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(res => {
      console.log("[authClient] Response status:", res.status, res.statusText);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json();
    })
    .then(data => {
      console.log("[authClient] Backend health check: ✅ SUCCESS", data);
    })
    .catch(err => {
      console.error("[authClient] Backend health check: ❌ FAILED");
      console.error("[authClient] Error type:", err.name);
      console.error("[authClient] Error message:", err.message);
      console.error("[authClient] Full error:", err);
      console.error("[authClient] This might indicate:");
      console.error("  1. Network connectivity issue");
      console.error("  2. DNS resolution problem");
      console.error("  3. SSL/TLS certificate issue");
      console.error("  4. Firewall or proxy blocking the connection");
      console.error("  5. iOS/Android network permissions not configured");
    });
}

export const authClient = createAuthClient({
  baseURL: AUTH_BASE_URL,
  plugins: [
    expoClient({
      scheme: "localguide",   // Must match the scheme in app.json / auth.ts
      storagePrefix: "localguide",
      storage: SecureStore,
    }),
  ],
});
