// src/app/api/users/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return NextResponse.json(
      { authenticated: false },
      { status: 200 }
    );
  }

  const user = session.user;

  return NextResponse.json(
    {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: (user as any).role ?? "USER",
        emailVerified: user.emailVerified,
      },
    },
    { status: 200 }
  );
}
