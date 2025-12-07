// src/app/api/favorites/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth"; 
import { prisma } from "@/lib/prisma";


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


export async function POST(req: NextRequest) {
  console.log("[/api/favorites] cookies:", req.headers.get("cookie"));
  const session = await auth.api.getSession({ headers: req.headers });
  console.log("[/api/favorites] session:", session);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const { id, name, description, address, latitude, longitude, imageUri, category, source } = body;

    const favorite = await prisma.favorite.upsert({
      where: {
        userId_placeId: {
          userId: session.user.id,
          placeId: id, 
        },
      },
      update: {}, 
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
  
    console.error("[DELETE /api/favorites] error:", err);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}