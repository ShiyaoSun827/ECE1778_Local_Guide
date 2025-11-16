// src/app/api/favorites/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function getSession(req: NextRequest) {
  return auth.api.getSession({ headers: req.headers });
}

// GET /api/favorites
export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      place: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const data = favorites.map((f) => ({
    id: f.place.id,
    title: f.place.title,
    description: f.place.description,
    address: f.place.address,
    latitude: f.place.latitude,
    longitude: f.place.longitude,
    imageUri: f.place.imageUri,
    createdAt: f.place.createdAt,
    isFavorite: true,
  }));

  return NextResponse.json(data);
}

// PATCH /api/favorites
// body: { placeId: string, favorite: boolean }
export async function PATCH(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { placeId, favorite } = body as {
    placeId?: string;
    favorite?: boolean;
  };

  if (!placeId || typeof favorite !== "boolean") {
    return NextResponse.json({ error: "placeId and favorite are required" }, { status: 400 });
  }

  const place = await prisma.place.findUnique({ where: { id: placeId } });
  if (!place) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }

  if (favorite) {
    // 
    await prisma.favorite.upsert({
      where: {
        userId_placeId: {
          userId,
          placeId,
        },
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

  return NextResponse.json({ ok: true });
}
