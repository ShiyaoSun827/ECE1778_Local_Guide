// src/app/api/items/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/items
 * 所有人（包括游客）都可以看列表
 */
export async function GET() {
  const items = await prisma.place.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

/**
 * POST /api/items
 * 只有登录用户可以新增地点
 * body: { name, description?, latitude, longitude, imageUri? }
 */
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    // 游客不允许新增
    return NextResponse.json(
      { error: "Unauthorized - please sign in to add places." },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const body = await request.json();
  const { name, description, latitude, longitude, imageUri } = body;

  if (!name || typeof latitude !== "number" || typeof longitude !== "number") {
    return NextResponse.json(
      { error: "name, latitude and longitude are required" },
      { status: 400 }
    );
  }

  const newPlace = await prisma.place.create({
    data: {
      name,
      description: description ?? "",
      latitude,
      longitude,
      imageUrl: imageUri ?? null,
      userId, // 如果你的 Place 里有 userId 字段，记录是谁创建的
    },
  });

  return NextResponse.json(newPlace, { status: 201 });
}
