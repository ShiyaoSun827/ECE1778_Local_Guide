// src/app/api/users/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const user = session.user;

  // [修改意图] 实时计算统计数据
  const placesCount = await prisma.place.count({
    where: { userId: user.id },
  });

  const favoritesCount = await prisma.place.count({
    where: { userId: user.id, isFavorite: true },
  });

  // 简单的城市计数 (根据地址去重，简化逻辑)
  const distinctCities = await prisma.place.groupBy({
    by: ['address'],
    where: { userId: user.id },
  });

  return NextResponse.json(
    {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: (user as any).role ?? "USER",
        emailVerified: user.emailVerified,
        bio: (user as any).bio,
        location: (user as any).location,
        // [新增] 返回统计数据
        stats: {
          places: placesCount,
          favorites: favoritesCount,
          cities: distinctCities.length, 
        }
      },
    },
    { status: 200 }
  );
}