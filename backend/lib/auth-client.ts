// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  // 对应我们第 4 步挂出来的 API
  baseURL: `${baseURL}/api/auth`,
  paths: {
    signUpEmail: "/sign-up/email",
    signInEmail: "/sign-in/email",
  },
  plugins: [adminClient()],
});

// 你可以在前端直接用这些方法
export const { signUp, signIn, signOut, useSession, verifyEmail } =
  authClient;
