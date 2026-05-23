import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";

// PATCH : change le rôle d'un utilisateur (user <-> admin)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  try {
    const { role } = await req.json();
    if (role !== "user" && role !== "admin") {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
    }
    // Un admin ne peut pas se rétrograder lui-même (évite de se verrouiller dehors).
    if (id === session.user.id && role !== "admin") {
      return NextResponse.json({ error: "Impossible de retirer ton propre accès admin." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, role: true },
    });
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
