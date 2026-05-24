import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Cron quotidien (Vercel Cron) : purge les crédits expirés.
// La vérification paresseuse (getUserQuota / consumeDoc) empêche déjà de
// DÉPENSER des crédits expirés ; ce job nettoie la base pour que les soldes
// et les statistiques admin restent exacts.
//
// Sécurité : Vercel Cron envoie "Authorization: Bearer <CRON_SECRET>" quand la
// variable CRON_SECRET est définie. On exige cette correspondance en prod ;
// si CRON_SECRET n'est pas défini (dev local), on laisse passer.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
  }

  try {
    const now = new Date();
    const res = await prisma.user.updateMany({
      where: { credits: { gt: 0 }, creditsExpireAt: { lt: now } },
      data: { credits: 0, creditsExpireAt: null },
    });
    if (res.count > 0) console.log(`[CRON] Crédits expirés purgés pour ${res.count} compte(s).`);
    return NextResponse.json({ expired: res.count });
  } catch (error) {
    // colonne creditsExpireAt absente (migration non passée) → no-op
    console.error("[CRON] expire-credits:", error);
    return NextResponse.json({ expired: 0, note: "creditsExpireAt indisponible" });
  }
}
