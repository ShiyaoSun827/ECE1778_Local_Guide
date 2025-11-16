"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// ✅ 注意这里的路径：从 app/api/auth/actions.ts 引
import { signInWithEmail } from "@/app/api/auth/actions";
import NavBarClient from "@/components/NavBarClient";
import Link from "next/link";

export default function SignInPage() {
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSignIn(formData: FormData) {
    try {
      const result = await signInWithEmail(formData);
      // result 结构：{ success, message, redirectTo? }
      setMessage(result.message ?? "");
      console.log("[Local Guide] Sign-in result:", result);

      if (result.success) {
        const to = result.redirectTo || "/";
        router.push(to);
      } else {
        console.error("Sign-in failed:", result.message);
      }
    } catch (error: any) {
      console.error("Sign-in error:", error);
      setMessage(
        "Login failed, Reason: " + String(error?.message ?? "Unknown error")
      );
    }
  }

  return (
    <>
      <NavBarClient />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6">
          <h1 className="text-3xl font-bold text-center">
            🔐 Sign In to Local Guide
          </h1>
          <p className="text-center text-sm text-gray-600">
            Log in to access your saved places, favorites, and notes.
          </p>

          <form action={handleSignIn} className="flex flex-col space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full border p-2 rounded mt-1"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                className="w-full border p-2 rounded mt-1"
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
            >
              Sign In
            </button>
          </form>

          {message && (
            <p className="text-center text-sm text-red-600 whitespace-pre-line">
              {message}
            </p>
          )}

          <p className="text-center text-sm text-gray-600">
            Not registered yet?
            <Link href="/signup" className="text-blue-600 hover:underline ml-1">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
