import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserQuota } from "@/lib/quota";
import { FREE_DOC_LIMIT } from "@/lib/plans";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const quota = await getUserQuota(session.user.id);

  // Abonné Studio = paiement "studio" approuvé dans les 31 derniers jours
  // (dérivé de la table Payment → pas de colonne supplémentaire).
  const since = new Date(Date.now() - 31 * 24 * 3600_000);
  const studio = await prisma.payment.findFirst({
    where: { userId: session.user.id, packId: "studio", status: "approved", createdAt: { gte: since } },
    select: { id: true },
  });

  return NextResponse.json(
    { ...quota, freeLimit: FREE_DOC_LIMIT, isStudio: !!studio },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
