// src/app/api/favorites/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/favorites
 * 返回当前登录用户的所有收藏 place
 */
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    // 没登录：游客，直接 401
    return NextResponse.json(
      { error: "Unauthorized - please sign in first." },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  // 这里的 Prisma 写法要对应你自己的模型
  // 假设有 Favorite 表：{ id, userId, placeId }，Place 表：{ id, name, ... }
  const favorites = await prisma.place.findMany({
    where: {
      favorites: {
        some: { userId },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(favorites);
}

/**
 * PATCH /api/favorites
 * body: { placeId: string, favorite: boolean }
 * favorite = true  -> 添加收藏
 * favorite = false -> 取消收藏
 */
export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized - please sign in first." },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const { placeId, favorite } = await request.json();

  if (!placeId) {
    return NextResponse.json(
      { error: "placeId is required" },
      { status: 400 }
    );
  }

  if (favorite) {
    // 添加收藏：如果不存在就创建
    await prisma.favorite.upsert({
      where: {
        userId_placeId: { userId, placeId },
      },
      create: {
        userId,
        placeId,
      },
      update: {},
    });
  } else {
    // 取消收藏
    await prisma.favorite.deleteMany({
      where: { userId, placeId },
    });
  }

  return NextResponse.json({ success: true });
}
