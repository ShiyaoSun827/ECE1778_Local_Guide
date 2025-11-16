// src/app/api/items/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Utility: Get session from request
async function getSession(req: NextRequest) {
  return auth.api.getSession({ headers: req.headers });
}

// GET /api/items  List
export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Only show places saved by the current user
  const places = await prisma.place.findMany({
    where: { ownerId: userId },
    include: {
      favorites: {
        where: { userId }, // Check if the user has favorited
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = places.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    address: p.address,
    latitude: p.latitude,
    longitude: p.longitude,
    imageUri: p.imageUri,
    createdAt: p.createdAt,
    isFavorite: p.favorites.length > 0,
  }));

  return NextResponse.json(data);
}

// POST /api/items  Create
export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    title,
    description,
    address,
    latitude,
    longitude,
    imageUri,
  } = body;

  if (!title || !address || typeof latitude !== "number" || typeof longitude !== "number") {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const place = await prisma.place.create({
    data: {
      title,
      description: description ?? "",
      address,
      latitude,
      longitude,
      imageUri: imageUri ?? null,
      ownerId: userId,
    },
  });

  return NextResponse.json(place, { status: 201 });
}
