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
    select: {
      id: true,
      title: true,
      description: true,
      address: true,
      latitude: true,
      longitude: true,
      imageUri: true,
      isFavorite: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
    },
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
    return NextResponse.json(
      { error: "Unauthorized - please sign in to add places." },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const body = await request.json();
  const {
    name,
    title,
    description,
    latitude,
    longitude,
    imageUri,
    address,
    categoryId,
  } = body ?? {};

  const placeTitle = (title ?? name ?? "").toString().trim();

  if (!placeTitle || typeof latitude !== "number" || typeof longitude !== "number") {
    return NextResponse.json(
      { error: "title (or name), latitude and longitude are required" },
      { status: 400 }
    );
  }

  const newPlace = await prisma.place.create({
    data: {
      title: placeTitle,
      description: description ?? "",
      address: address ?? null,
      latitude,
      longitude,
      imageUri: imageUri ?? null,
      userId,
      categoryId: categoryId ?? null,
    },
  });

  return NextResponse.json(newPlace, { status: 201 });
}
