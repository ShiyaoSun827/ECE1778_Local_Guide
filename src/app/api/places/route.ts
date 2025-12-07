// src/app/api/places/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { uploadToSpaces } from "@/lib/storage";
const prisma = new PrismaClient();

// 获取所有帖子 (Trending Feed)
export async function GET(req: NextRequest) {
  // 获取 URL 参数，比如 ?type=all 或 ?type=mine
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); 

  const session = await auth.api.getSession({ headers: req.headers });
  
  let whereClause = {};
  
  // 如果是 fetching "My Places"
  if (type === "mine" && session) {
    whereClause = { userId: session.user.id };
  } 
  // 否则默认获取所有人的 (Trending)

  const places = await prisma.place.findMany({
    where: whereClause,
    include: {
      user: { select: { name: true, image: true } }, // 包含发布者信息
    },
    orderBy: { createdAt: "desc" }, // 最新的在前面
  });

  return NextResponse.json(places);
}

// 创建新帖子 (Add Place)
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. 解析 FormData 而不是 JSON
    const formData = await req.formData();
    const rawCategory = formData.get("category") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const address = formData.get("address") as string;
    const latitude = parseFloat(formData.get("latitude") as string);
    const longitude = parseFloat(formData.get("longitude") as string);
    const categoryId = (rawCategory && rawCategory !== "custom") ? rawCategory : null;
    
    const imageFile = formData.get("image") as File | null;
    let finalImageUri = null;

    // 2. 如果有图片文件，上传到 DigitalOcean
    if (imageFile && imageFile.size > 0) {
      finalImageUri = await uploadToSpaces(imageFile, "custom-places");
    }

    // 3. 保存到数据库
    const place = await prisma.place.create({
      data: {
        userId: session.user.id,
        title: name,           // 对应 PlaceFormData 的 name
        placeName: name,       // 保持一致
        description: description || "",
        address: address || "",
        latitude,
        longitude,
        imageUri: finalImageUri, // 保存 DO 返回的 URL
        categoryId: categoryId , // 默认分类
        
      },
    });

    return NextResponse.json(place);
  } catch (error) {
    console.error("Error creating place:", error);
    return NextResponse.json({ error: "Failed to create place" }, { status: 500 });
  }
}