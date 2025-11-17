"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
// ✅ 注意这里的路径
import { logout } from "@/app/api/auth/action";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleLogout = () => {
    startTransition(async () => {
      const result = await logout();
      setMessage(result.message ?? "");

      if (result.success) {
        const to = result.redirectTo || "/signin";
        router.push(to);
      }
    });
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      <button
        onClick={handleLogout}
        disabled={isPending}
        className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white text-sm"
      >
        {isPending ? "Logging out..." : "Logout"}
      </button>
      {message && <p className="text-xs text-gray-500">{message}</p>}
    </div>
  );
}
