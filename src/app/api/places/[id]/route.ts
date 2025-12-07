import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


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
    if (typeof body.visitCount === 'number') updateData.visitCount = body.visitCount;


    const result = await prisma.$transaction(async (tx) => {

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