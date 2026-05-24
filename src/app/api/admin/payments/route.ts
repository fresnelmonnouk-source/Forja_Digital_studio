import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";
import { PACKS } from "@/lib/plans";

// GET : liste paginée des transactions FedaPay + agrégats de revenus.
// Tolérant : si la table Payment n'existe pas encore, renvoie des totaux à zéro.
export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  try {
    const url = new URL(req.url);
    const take = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 30), 1), 100);
    const skip = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);
    const status = (url.searchParams.get("status") || "").trim(); // filtre optionnel

    const where = status ? { status } : {};

    const now = new Date();
    const d30 = new Date(now.getTime() - 30 * 24 * 3600_000);

    const [payments, total, approvedAll, approved30d, byPackRaw] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take,
        skip,
        select: {
          id: true, packId: true, amount: true, credits: true, status: true,
          createdAt: true, fedapayId: true,
          user: { select: { email: true, name: true } },
        },
      }),
      prisma.payment.count({ where }),
      prisma.payment.aggregate({ where: { status: "approved" }, _sum: { amount: true }, _count: true }),
      prisma.payment.aggregate({ where: { status: "approved", createdAt: { gte: d30 } }, _sum: { amount: true }, _count: true }),
      prisma.payment.groupBy({ by: ["packId"], where: { status: "approved" }, _sum: { amount: true }, _count: true }),
    ]);

    const byPack = PACKS.map((p) => {
      const row = byPackRaw.find((r) => r.packId === p.id);
      return { packId: p.id, label: p.label, count: row?._count ?? 0, revenue: row?._sum.amount ?? 0 };
    });

    return NextResponse.json(
      {
        payments,
        total,
        revenue: {
          allTime: approvedAll._sum.amount ?? 0,
          allTimeCount: approvedAll._count ?? 0,
          last30d: approved30d._sum.amount ?? 0,
          last30dCount: approved30d._count ?? 0,
        },
        byPack,
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Erreur admin payments GET:", error);
    // Dégradation gracieuse si la table n'existe pas encore
    return NextResponse.json(
      { payments: [], total: 0, revenue: { allTime: 0, allTimeCount: 0, last30d: 0, last30dCount: 0 }, byPack: [] },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  }
}
