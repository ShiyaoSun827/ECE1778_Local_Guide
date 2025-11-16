// src/app/api/items/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function getSession(req: NextRequest) {
  return auth.api.getSession({ headers: req.headers });
}

function canEditPlace(
  session: any,
  placeOwnerId: string
) {
  const userId = session.user.id;
  const role = session.user.role as string | undefined;

  if (userId === placeOwnerId) return true;
  if (role === "ADMIN") return true;
  return false;
}

// GET /api/items/:id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const place = await prisma.place.findUnique({
    where: { id: params.id },
    include: {
      favorites: {
        where: { userId },
      },
    },
  });

  if (!place) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }


  if (place.ownerId !== userId && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = {
    id: place.id,
    title: place.title,
    description: place.description,
    address: place.address,
    latitude: place.latitude,
    longitude: place.longitude,
    imageUri: place.imageUri,
    createdAt: place.createdAt,
    isFavorite: place.favorites.length > 0,
  };

  return NextResponse.json(data);
}

// PATCH /api/items/:id
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const place = await prisma.place.findUnique({
    where: { id: params.id },
  });

  if (!place) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!canEditPlace(session, place.ownerId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { title, description, address, latitude, longitude, imageUri } = body;

  const updated = await prisma.place.update({
    where: { id: params.id },
    data: {
      title: title ?? place.title,
      description: description ?? place.description,
      address: address ?? place.address,
      latitude: typeof latitude === "number" ? latitude : place.latitude,
      longitude: typeof longitude === "number" ? longitude : place.longitude,
      imageUri: imageUri ?? place.imageUri,
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/items/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const place = await prisma.place.findUnique({
    where: { id: params.id },
  });

  if (!place) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!canEditPlace(session, place.ownerId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.favorite.deleteMany({ where: { placeId: params.id } });
  await prisma.place.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
