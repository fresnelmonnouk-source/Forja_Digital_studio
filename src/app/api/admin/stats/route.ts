import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";
import { availableProviders } from "@/lib/llm/client";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  try {
    const now = new Date();
    const d7 = new Date(now.getTime() - 7 * 24 * 3600_000);
    const d30 = new Date(now.getTime() - 30 * 24 * 3600_000);

    const [
      totalUsers,
      verifiedUsers,
      admins,
      newUsers7d,
      newUsers30d,
      totalConversations,
      totalMessages,
      activeUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { emailVerified: { not: null } } }),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.user.count({ where: { createdAt: { gte: d7 } } }),
      prisma.user.count({ where: { createdAt: { gte: d30 } } }),
      prisma.conversation.count(),
      prisma.message.count(),
      prisma.user.count({ where: { conversations: { some: {} } } }),
    ]);

    // Revenus (table Payment) — tolérant si la table n'existe pas encore.
    let revenue = { allTime: 0, last30d: 0, paidCount: 0, payingUsers: 0 };
    try {
      const [allTime, last30, payers] = await Promise.all([
        prisma.payment.aggregate({ where: { status: "approved" }, _sum: { amount: true }, _count: true }),
        prisma.payment.aggregate({ where: { status: "approved", createdAt: { gte: d30 } }, _sum: { amount: true } }),
        prisma.payment.findMany({ where: { status: "approved" }, distinct: ["userId"], select: { userId: true } }),
      ]);
      revenue = {
        allTime: allTime._sum.amount ?? 0,
        last30d: last30._sum.amount ?? 0,
        paidCount: allTime._count ?? 0,
        payingUsers: payers.length,
      };
    } catch {
      // table Payment absente → revenus à zéro
    }

    // Timeline des inscriptions sur 14 jours
    const recent = await prisma.user.findMany({
      where: { createdAt: { gte: new Date(now.getTime() - 14 * 24 * 3600_000) } },
      select: { createdAt: true },
    });
    const timeline: { day: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const day = new Date(now.getTime() - i * 24 * 3600_000);
      const key = day.toISOString().slice(0, 10);
      const count = recent.filter((u) => u.createdAt.toISOString().slice(0, 10) === key).length;
      timeline.push({ day: key, count });
    }

    // Suivi technique : providers LLM configurés + présence des variables d'env (sans valeurs)
    const providers = availableProviders();
    const envHealth = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      FEDAPAY: !!process.env.FEDAPAY_SECRET_KEY,
      DEEPSEEK: !!process.env.DEEPSEEK_API_KEY,
      UPSTASH_REDIS: !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN,
      SENTRY: !!process.env.SENTRY_DSN || !!process.env.NEXT_PUBLIC_SENTRY_DSN,
    };

    return NextResponse.json(
      {
        users: { total: totalUsers, verified: verifiedUsers, admins, active: activeUsers, new7d: newUsers7d, new30d: newUsers30d },
        content: { conversations: totalConversations, messages: totalMessages },
        revenue,
        timeline,
        tech: { providers, envHealth },
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Erreur admin stats:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
