import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id, userId: session.user.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!conversation) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Erreur conversation GET:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id, userId: session.user.id },
    });

    if (!conversation) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

    await prisma.conversation.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur conversation DELETE:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
