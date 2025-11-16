// src/components/NavBarClient.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
// 注意：auth actions 在 /app/api/auth/actions.ts 下面
import { logout } from "@/app/api/auth/actions";

type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
  emailVerified?: boolean | null;
};

type Session = {
  user?: SessionUser;
} | null;

export default function NavBarClient({ session }: { session: Session }) {
  const router = useRouter();
  // 允许后面登出时把本地 session 清掉
  const [currentSession, setCurrentSession] = useState<Session>(session);

  const user = currentSession?.user;
  const isVerified = user?.emailVerified ?? false;
  const isAdmin =
    user?.role === "admin" || user?.role === "superadmin";

  const handleSignOut = async () => {
    try {
      const result = await logout();
      if (!result.success) {
        alert(result.message || "Logout failed, please try again.");
        return;
      }
      setCurrentSession(null);
      const to = result.redirectTo || "/signin";
      router.push(to);
    } catch (e) {
      console.error("Logout error:", e);
      alert("Logout failed due to an unexpected error.");
    }
  };

  return (
    <nav className="w-full border-b bg-white shadow px-4 py-3 space-y-2">
      {/* App Title */}
      <div className="text-xl font-bold text-blue-700">
        🗺️ Local Guide
      </div>

      {/* 如果用户已登录但邮箱没验证，给一个提示 */}
      {user && !isVerified && (
        <div className="text-xs text-yellow-800 bg-yellow-100 border border-yellow-300 rounded px-2 py-1">
          Your email is not verified yet. Some features may be limited.  
          Please check your inbox and click the verification link.
        </div>
      )}

      {/* Main Navigation Links */}
      <div className="flex flex-wrap gap-3 text-sm sm:text-base">
        <Link href="/" className="text-blue-600 hover:underline">
          Home
        </Link>

        {/* 未来如果你有 Admin Dashboard，可以打开下面这一行 */}
        {isAdmin && (
          <Link
            href="/admin"
            className="text-blue-600 hover:underline"
          >
            🛠️ Admin Dashboard
          </Link>
        )}

        {/* 这里可以加一些 Local Guide 的调试页，比如 /debug、/places 等 */}
        {/* <Link href="/debug" className="text-blue-600 hover:underline">
          Debug
        </Link> */}

        {/* 未登录时显示 Sign Up 链接 */}
        {!user && (
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        )}
      </div>

      {/* User Info / Actions */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {user ? (
          <>
            <span className="text-gray-700">
              Welcome, {user.name || user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="text-red-600 hover:underline"
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link href="/signin" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
