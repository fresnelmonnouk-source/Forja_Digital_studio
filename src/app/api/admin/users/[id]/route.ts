import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";
import { creditExpiryDate } from "@/lib/plans";

// PATCH : modifie un utilisateur.
// Actions supportées (mutuellement non exclusives) :
//   - role: "user" | "admin"        → change le rôle
//   - addCredits: number (≠ 0)       → ajoute/retire des crédits (offre / SAV)
//   - resetFreeDocs: true            → remet le quota gratuit à zéro
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  try {
    const body = await req.json();
    const { role, addCredits, resetFreeDocs } = body ?? {};

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    const data: { role?: string; credits?: number; freeDocsUsed?: number; creditsExpireAt?: Date } = {};

    if (role !== undefined) {
      if (role !== "user" && role !== "admin") {
        return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
      }
      // Un admin ne peut pas se rétrograder lui-même (évite de se verrouiller dehors).
      if (id === session.user.id && role !== "admin") {
        return NextResponse.json({ error: "Impossible de retirer ton propre accès admin." }, { status: 400 });
      }
      data.role = role;
    }

    if (addCredits !== undefined) {
      const delta = Number(addCredits);
      if (!Number.isInteger(delta) || delta === 0) {
        return NextResponse.json({ error: "Montant de crédits invalide." }, { status: 400 });
      }
      data.credits = Math.max(0, user.credits + delta); // jamais négatif
      // Ajout de crédits → (re)cale la fenêtre de validité à 31 jours.
      if (delta > 0) data.creditsExpireAt = creditExpiryDate();
    }

    if (resetFreeDocs === true) {
      data.freeDocsUsed = 0;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Aucune modification fournie." }, { status: 400 });
    }

    let updated;
    try {
      updated = await prisma.user.update({
        where: { id },
        data,
        select: { id: true, role: true, credits: true, freeDocsUsed: true },
      });
    } catch {
      // colonne creditsExpireAt absente → on rejoue sans ce champ
      const { creditsExpireAt: _drop, ...rest } = data;
      void _drop;
      updated = await prisma.user.update({
        where: { id },
        data: rest,
        select: { id: true, role: true, credits: true, freeDocsUsed: true },
      });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur admin user PATCH:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE : supprime un utilisateur (et ses conversations en cascade)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  try {
    if (id === session.user.id) {
      return NextResponse.json({ error: "Impossible de supprimer ton propre compte ici." }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur admin user DELETE:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
