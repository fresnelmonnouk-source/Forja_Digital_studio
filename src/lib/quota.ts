import prisma from "@/lib/prisma";
import { FREE_DOC_LIMIT, creditExpiryDate } from "@/lib/plans";

export interface Quota {
  freeUsed: number;
  freeRemaining: number;
  credits: number; // crédits EFFECTIFS (0 si expirés)
  creditsExpireAt: string | null; // ISO, null si aucun crédit actif
  canGenerate: boolean;
}

/**
 * Crédits effectivement utilisables : 0 si le solde est nul OU si la date
 * d'expiration est passée. Fonction pure → testable sans base.
 */
export function effectiveCredits(rawCredits: number, expireAt: Date | null, now: Date = new Date()): number {
  if (rawCredits <= 0) return 0;
  if (expireAt && expireAt.getTime() <= now.getTime()) return 0; // expirés
  return rawCredits;
}

export async function getUserQuota(userId: string): Promise<Quota> {
  let freeDocsUsed = 0;
  let rawCredits = 0;
  let expireAt: Date | null = null;

  // Lecture défensive : si la colonne creditsExpireAt n'existe pas encore en
  // base (migration non passée), on retombe sur l'ancien schéma sans planter.
  try {
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { freeDocsUsed: true, credits: true, creditsExpireAt: true },
    });
    freeDocsUsed = u?.freeDocsUsed ?? 0;
    rawCredits = u?.credits ?? 0;
    expireAt = u?.creditsExpireAt ?? null;
  } catch {
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { freeDocsUsed: true, credits: true },
    });
    freeDocsUsed = u?.freeDocsUsed ?? 0;
    rawCredits = u?.credits ?? 0;
  }

  const credits = effectiveCredits(rawCredits, expireAt);
  const freeRemaining = Math.max(0, FREE_DOC_LIMIT - freeDocsUsed);
  return {
    freeUsed: freeDocsUsed,
    freeRemaining,
    credits,
    creditsExpireAt: credits > 0 && expireAt ? expireAt.toISOString() : null,
    canGenerate: freeRemaining > 0 || credits > 0,
  };
}

/**
 * Consomme 1 document : d'abord un gratuit (tant que < FREE_DOC_LIMIT),
 * sinon 1 crédit payant NON EXPIRÉ. Atomique (updateMany conditionnel → pas
 * de course ni de solde négatif, et un crédit expiré n'est jamais décompté).
 */
export async function consumeDoc(userId: string): Promise<boolean> {
  const free = await prisma.user.updateMany({
    where: { id: userId, freeDocsUsed: { lt: FREE_DOC_LIMIT } },
    data: { freeDocsUsed: { increment: 1 } },
  });
  if (free.count > 0) return true;

  const now = new Date();
  let paid;
  try {
    paid = await prisma.user.updateMany({
      where: {
        id: userId,
        credits: { gt: 0 },
        OR: [{ creditsExpireAt: null }, { creditsExpireAt: { gt: now } }],
      },
      data: { credits: { decrement: 1 } },
    });
  } catch {
    // colonne creditsExpireAt absente → on retombe sur l'ancien comportement
    paid = await prisma.user.updateMany({
      where: { id: userId, credits: { gt: 0 } },
      data: { credits: { decrement: 1 } },
    });
  }
  return paid.count > 0;
}

/**
 * Ajoute des crédits et (re)définit leur fenêtre de validité à 31 jours.
 * Centralise l'ajout pour le webhook de paiement ET l'ajustement admin.
 * Défensif : si la colonne creditsExpireAt manque, on crédite quand même
 * (la partie monétaire ne doit jamais échouer pour un souci de schéma).
 */
export async function grantCredits(userId: string, amount: number): Promise<void> {
  if (amount <= 0) return;
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: amount }, creditsExpireAt: creditExpiryDate() },
    });
  } catch {
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: amount } },
    });
  }
}
