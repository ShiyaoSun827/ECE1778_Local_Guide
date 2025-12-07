// src/app/api/places/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { uploadToSpaces } from "@/lib/storage";
const prisma = new PrismaClient();


export async function GET(req: NextRequest) {
  
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); 

  const session = await auth.api.getSession({ headers: req.headers });
  
  let whereClause = {};
  
 
  if (type === "mine" && session) {
    whereClause = { userId: session.user.id };
  } 


  const places = await prisma.place.findMany({
    where: whereClause,
    include: {
      user: { select: { name: true, image: true } }, 
    },
    orderBy: { createdAt: "desc" }, 
  });

  return NextResponse.json(places);
}


export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    
 
    const rawCategory = formData.get("category") as string;
    
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const address = formData.get("address") as string;
    const latitude = parseFloat(formData.get("latitude") as string);
    const longitude = parseFloat(formData.get("longitude") as string);
    
    const imageFile = formData.get("image") as File | null;
    let finalImageUri = null;

   
    if (imageFile && imageFile.size > 0) {
      finalImageUri = await uploadToSpaces(imageFile, "custom-places");
    }


    let dbCategoryId = null;

    if (rawCategory && rawCategory !== "custom") {
     
      const category = await prisma.category.findUnique({
        where: { slug: rawCategory },
      });
      
      if (category) {
        dbCategoryId = category.id;
      } else {
        
        console.warn(`Category slug '${rawCategory}' not found in DB. Saving with null category.`);
      }
    }

    
    const place = await prisma.place.create({
      data: {
        userId: session.user.id,
        title: name,
        placeName: name,
        description: description || "",
        address: address || "",
        latitude,
        longitude,
        imageUri: finalImageUri,
        
        
        categoryId: dbCategoryId, 
      },
    });

    return NextResponse.json(place);
  } catch (error) {
    console.error("Error creating place:", error);
    
    return NextResponse.json(
      { error: "Failed to create place", details: String(error) }, 
      { status: 500 }
    );
  }
}