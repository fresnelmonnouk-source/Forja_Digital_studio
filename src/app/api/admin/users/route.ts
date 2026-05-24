import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const take = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 25), 1), 100);
    const skip = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);

    const where = q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" as const } },
            { name: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take,
        skip,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          credits: true,
          freeDocsUsed: true,
          emailVerified: true,
          createdAt: true,
          _count: { select: { conversations: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json(
      { users, total, take, skip },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Erreur admin users GET:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
