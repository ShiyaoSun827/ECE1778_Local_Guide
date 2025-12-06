 // src/app/api/users/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // [建议] 使用 lib/prisma 中的单例，避免开发环境下连接耗尽

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = session.user;

  try {
    // 1. 统计 Places: 用户发布的地点总数
    const placesCount = await prisma.place.count({
      where: { userId: user.id },
    });

    // 2. 统计 Likes: 用户收藏的地点总数 (查询 Favorite 表)
    const favoritesCount = await prisma.favorite.count({
      where: { userId: user.id },
    });

    // 3. 统计 Cities: 简单的去重逻辑 (根据 address 字段)
    const distinctCities = await prisma.place.findMany({
      where: { userId: user.id },
      select: { address: true },
      distinct: ['address'],
    });
    // 过滤掉空地址
    const citiesCount = distinctCities.filter(p => p.address && p.address.trim() !== "").length;

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
          // [新增] 返回统计数据 stats
          stats: {
            places: placesCount,
            cities: citiesCount,
            likes: favoritesCount,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/users/me] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}