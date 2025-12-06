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
    const favorites = await prisma.favoritePlace.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    });

    const places = favorites.map((fav) => {
      const place = fav.placeData as any;
      return {
        ...place,
        id: place?.id ?? fav.placeId,
        isFavorite: true,
        createdAt: fav.createdAt.toISOString(),
        updatedAt: fav.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(places);
  } catch (err) {
    console.error("[GET /api/favorites] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const place = body?.place;

    if (!place?.id) {
      return NextResponse.json({ error: "Missing place id" }, { status: 400 });
    }

    await prisma.favoritePlace.upsert({
      where: {
        userId_placeId: {
          userId: session.user.id,
          placeId: place.id,
        },
      },
      update: {
        placeData: place,
      },
      create: {
        userId: session.user.id,
        placeId: place.id,
        placeData: place,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/favorites] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
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
    await prisma.favoritePlace.delete({
      where: {
        userId_placeId: {
          userId: session.user.id,
          placeId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/favorites] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
