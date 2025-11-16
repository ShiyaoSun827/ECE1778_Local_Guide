// src/app/api/favorites/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {

  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  try {

    const places = await prisma.place.findMany({
      where: {
        userId,      
        isFavorite: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

   
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
