// src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const data = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: (u as any).role ?? "USER",
    emailVerified: (u as any).emailVerified ?? null,
  }));

  return NextResponse.json(data);
}
