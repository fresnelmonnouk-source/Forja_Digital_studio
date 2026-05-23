import { auth } from "@/auth";

/**
 * Renvoie la session si l'utilisateur est authentifié ET admin, sinon null.
 * À utiliser en tête de chaque route API admin (défense en profondeur,
 * en plus de la protection middleware).
 */
export async function getAdminSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}
