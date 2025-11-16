// src/app/api/favorites/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  // 1. 从 Better Auth 拿当前 session
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  try {
    // 2. 从 Place 表中查询“当前用户的收藏”
    // 条件：这个 userId 的 place，并且 isFavorite = true
    const places = await prisma.place.findMany({
      where: {
        userId,       // 只查当前用户自己的地标
        isFavorite: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 3. 映射成前端 favorites/index.tsx 期望的结构
    const result = places.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      address: p.address,
      latitude: p.latitude,
      longitude: p.longitude,
      imageUri: p.imageUri,
      isFavorite: p.isFavorite,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/favorites] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
