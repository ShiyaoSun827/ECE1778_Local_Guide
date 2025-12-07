import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });


  const { id } = await params;

  try {
    const body = await req.json();
    

    const updateData: any = {};
    if (typeof body.isFavorite === 'boolean') updateData.isFavorite = body.isFavorite;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.imageUri !== undefined) updateData.imageUri = body.imageUri;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;

    if (Object.keys(updateData).length === 0) {
      const place = await prisma.place.findUnique({
        where: { id, userId: session.user.id },
      });
      if (!place) {
        return NextResponse.json({ error: "Place not found" }, { status: 404 });
      }
      return NextResponse.json(place);
    }

    const result = await prisma.$transaction(async (tx: any) => {

      const updatedPlace = await tx.place.update({
        where: { 
          id: id,
          userId: session.user.id 
        },
        data: updateData,
      });

      if (typeof updateData.isFavorite === 'boolean') {
        if (updateData.isFavorite) {

          await tx.favorite.upsert({
            where: {
              userId_placeId: {
                userId: session.user.id,
                placeId: updatedPlace.id,
              },
            },
            create: {
              userId: session.user.id,
              placeId: updatedPlace.id,
     
              name: updatedPlace.title, 
              description: updatedPlace.description,
              address: updatedPlace.address,
              latitude: updatedPlace.latitude,
              longitude: updatedPlace.longitude,
              imageUri: updatedPlace.imageUri,
              category: updatedPlace.categoryId, 
              source: "custom", 
            },
            update: {
         
              name: updatedPlace.title,
              imageUri: updatedPlace.imageUri,
            }, 
          });
        } else {
  
          await tx.favorite.deleteMany({
            where: {
              userId: session.user.id,
              placeId: updatedPlace.id,
            },
          });
        }
      }

      return updatedPlace;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating place:", error);
    return NextResponse.json({ error: "Failed to update place" }, { status: 500 });
  }
}