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
    const formData = await req.formData();
    
    // 获取前端传来的原始分类标识 (可能是 slug，如 "food")
    const rawCategory = formData.get("category") as string;
    
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const address = formData.get("address") as string;
    const latitude = parseFloat(formData.get("latitude") as string);
    const longitude = parseFloat(formData.get("longitude") as string);
    
    const imageFile = formData.get("image") as File | null;
    let finalImageUri = null;

    // 1. 上传图片到 DigitalOcean
    if (imageFile && imageFile.size > 0) {
      finalImageUri = await uploadToSpaces(imageFile, "custom-places");
    }

    // 2. 处理分类 ID [关键修复]
    // 数据库需要的是 Category 表的 uuid/cuid，而不是前端的 "food" 这种 slug
    let dbCategoryId = null;

    if (rawCategory && rawCategory !== "custom") {
      // 尝试通过 slug (别名) 查找对应的真实 Category ID
      const category = await prisma.category.findUnique({
        where: { slug: rawCategory },
      });
      
      if (category) {
        dbCategoryId = category.id;
      } else {
        // 如果按 slug 找不到，可能前端传的就是 ID？尝试按 ID 找一下（可选）
        // 或者直接忽略，避免外键报错
        console.warn(`Category slug '${rawCategory}' not found in DB. Saving with null category.`);
      }
    }

    // 3. 保存到数据库
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
        
        // 使用我们查找出来的真实 ID，或者是 null
        categoryId: dbCategoryId, 
      },
    });

    return NextResponse.json(place);
  } catch (error) {
    console.error("Error creating place:", error);
    // 返回具体的错误信息有助于调试，生产环境可以隐藏
    return NextResponse.json(
      { error: "Failed to create place", details: String(error) }, 
      { status: 500 }
    );
  }
}