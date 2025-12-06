// src/app/api/favorites/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // 确保路径对应你的实际 auth 库位置
import { prisma } from "@/lib/prisma"; // 确保路径对应你的 prisma 实例

// GET: 获取当前用户的收藏列表
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    // 将数据库格式转换为前端使用的 Place 格式
    const formattedFavorites = favorites.map((fav) => ({
      id: fav.placeId,
      name: fav.name || "Unknown Place",
      description: fav.description,
      address: fav.address,
      latitude: fav.latitude,
      longitude: fav.longitude,
      imageUri: fav.imageUri,
      category: fav.category,
      source: fav.source,
      isFavorite: true,
      createdAt: fav.createdAt.toISOString(),
      updatedAt: fav.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedFavorites);
  } catch (err) {
    console.error("[GET /api/favorites] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: 添加收藏
export async function POST(req: NextRequest) {
  console.log("[/api/favorites] cookies:", req.headers.get("cookie"));
  const session = await auth.api.getSession({ headers: req.headers });
  console.log("[/api/favorites] session:", session);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    // 前端传来的数据可能包含 id 或 placeId，这里统一处理
    const { id, name, description, address, latitude, longitude, imageUri, category, source } = body;

    const favorite = await prisma.favorite.upsert({
      where: {
        userId_placeId: {
          userId: session.user.id,
          placeId: id, // 使用地点的原始 ID 作为 placeId
        },
      },
      update: {}, // 如果已存在，不做任何修改
      create: {
        userId: session.user.id,
        placeId: id,
        name,
        description,
        address,
        latitude,
        longitude,
        imageUri,
        category,
        source: source || "google",
      },
    });

    return NextResponse.json(favorite);
  } catch (err) {
    console.error("[POST /api/favorites] error:", err);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 }
    );
  }
}

// DELETE: 取消收藏
export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get("placeId");

  if (!placeId) {
    return NextResponse.json({ error: "Missing placeId" }, { status: 400 });
  }

  try {
    await prisma.favorite.delete({
      where: {
        userId_placeId: {
          userId: session.user.id,
          placeId: placeId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    // 如果记录不存在 (P2025)，通常可以视为成功删除
    console.error("[DELETE /api/favorites] error:", err);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}