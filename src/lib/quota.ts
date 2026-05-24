import prisma from "@/lib/prisma";
import { FREE_DOC_LIMIT } from "@/lib/plans";

export interface Quota {
  freeUsed: number;
  freeRemaining: number;
  credits: number;
  canGenerate: boolean;
}

export async function getUserQuota(userId: string): Promise<Quota> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { freeDocsUsed: true, credits: true },
  });
  const freeUsed = u?.freeDocsUsed ?? 0;
  const credits = u?.credits ?? 0;
  const freeRemaining = Math.max(0, FREE_DOC_LIMIT - freeUsed);
  return { freeUsed, freeRemaining, credits, canGenerate: freeRemaining > 0 || credits > 0 };
}

/**
 * Consomme 1 document : d'abord un gratuit (tant que < FREE_DOC_LIMIT),
 * sinon 1 crédit payant. Atomique (updateMany conditionnel → pas de course
 * ni de solde négatif). Renvoie true si un document a pu être décompté.
 */
export async function consumeDoc(userId: string): Promise<boolean> {
  const free = await prisma.user.updateMany({
    where: { id: userId, freeDocsUsed: { lt: FREE_DOC_LIMIT } },
    data: { freeDocsUsed: { increment: 1 } },
  });
  if (free.count > 0) return true;

  const paid = await prisma.user.updateMany({
    where: { id: userId, credits: { gt: 0 } },
    data: { credits: { decrement: 1 } },
  });
  return paid.count > 0;
}
