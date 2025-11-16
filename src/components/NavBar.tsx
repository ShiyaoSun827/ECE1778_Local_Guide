// src/components/NavBar.tsx
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import NavBarClient from "@/components/NavBarClient";

export default async function NavBar() {
  // 在服务端用 Better Auth 拿当前 Session
  const session = await auth.api.getSession({
    headers: new Headers(await headers()),
  });

  // 把 session 传给客户端组件
  return <NavBarClient session={session} />;
}
