 // src/app/api/users/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = session.user;

  try {
 
    const placesCount = await prisma.place.count({
      where: { userId: user.id },
    });

    const favoritesCount = await prisma.favorite.count({
      where: { userId: user.id },
    });


    const distinctCities = await prisma.place.findMany({
      where: { userId: user.id },
      select: { address: true },
      distinct: ['address'],
    });
 
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