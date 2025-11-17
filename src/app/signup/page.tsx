"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
// ✅ 注意这里的路径
import { signUpWithEmail } from "@/app/api/auth/action";
import NavBarClient from "@/components/NavBarClient";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formMessage, setFormMessage] = useState("");

  const router = useRouter();

  async function handleSignUp(formData: FormData) {
    setEmailError("");
    setPasswordError("");
    setFormMessage("");

    if (
      !email.includes("@") ||
      (!email.includes(".com") && !email.includes(".ca"))
    ) {
      setEmailError(
        "❌ Please enter a valid email (must contain @, and .com or .ca)"
      );
      return;
    }

    if (password.length < 8) {
      setPasswordError("❌ Password must be at least 8 characters long");
      return;
    }

    const result = await signUpWithEmail(formData);
    // { success, message }
    setFormMessage(result.message ?? "");

    if (result.success) {
      const finalMessage =
        "✅ Signup successful! Please check your email to verify your Local Guide account before signing in.";
      setFormMessage(finalMessage);

      // 注册完一般不立刻跳，等用户点完邮件再回来登录；
      // 你要自动跳也可以，例如两秒后跳到 /signin：
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    }
  }

  return (
    <>
      <NavBarClient />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6">
          <h1 className="text-3xl font-bold text-center">
            📝 Create your Local Guide account
          </h1>
          <p className="text-center text-sm text-gray-600">
            Save your favorite places, notes, and memories across devices.
          </p>

          <form action={handleSignUp} className="flex flex-col space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-2 rounded mt-1"
                placeholder="you@example.com"
                required
              />
              {emailError && (
                <p className="text-sm text-red-600 mt-1">{emailError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password (at least 8 characters)
              </label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border p-2 rounded mt-1"
                placeholder="********"
                required
              />
              {passwordError && (
                <p className="text-sm text-red-600 mt-1">{passwordError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Display Name
              </label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-2 rounded mt-1"
                placeholder="How should we call you?"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
            >
              Sign Up
            </button>
          </form>

          {formMessage && (
            <p className="text-center text-sm text-green-600 whitespace-pre-line">
              {formMessage}
            </p>
          )}

          <p className="text-center text-sm text-gray-600">
            Already have an account?
            <Link href="/signin" className="text-blue-600 hover:underline ml-1">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
