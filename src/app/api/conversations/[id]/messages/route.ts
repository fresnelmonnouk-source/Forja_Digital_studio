import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

interface MessageInput {
  role: string;
  content: string;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages invalides" }, { status: 400 });
    }

    const validMessages: MessageInput[] = messages
      .filter((m) => typeof m?.role === "string" && typeof m?.content === "string")
      .map((m) => ({ role: m.role, content: m.content }));

    if (validMessages.length === 0) {
      return NextResponse.json({ error: "Aucun message valide fourni" }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id, userId: session.user.id },
    });

    if (!conversation) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

    await prisma.message.createMany({
      data: validMessages.map((m) => ({
        role: m.role,
        content: m.content,
        conversationId: params.id,
      })),
    });

    await prisma.conversation.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur messages POST:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
