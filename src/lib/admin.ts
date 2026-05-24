import { auth } from "@/auth";
import prisma from "@/lib/prisma";

/**
 * Renvoie la session si l'utilisateur est authentifié ET admin, sinon null.
 * À utiliser en tête de chaque route API admin (défense en profondeur,
 * en plus de la protection middleware).
 *
 * Le rôle est RE-VÉRIFIÉ en base (et pas seulement lu dans le JWT) : un admin
 * rétrogradé conserverait sinon son accès jusqu'à expiration de son token.
 */
export async function getAdminSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "admin") return null;
  return session;
}
