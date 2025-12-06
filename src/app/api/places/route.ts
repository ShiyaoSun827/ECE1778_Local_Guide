// src/app/api/places/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

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

  const body = await req.json();
  const { title, placeName, description, address, latitude, longitude, imageUri, categoryId } = body;

  const place = await prisma.place.create({
    data: {
      userId: session.user.id,
      title,          // 用户自定义标题
      placeName,      // Google 地点名
      description,
      address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      imageUri,
      categoryId
    },
  });

  return NextResponse.json(place);
}