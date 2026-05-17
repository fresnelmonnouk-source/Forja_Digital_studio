import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { rateLimit, getIp } from "@/lib/rate-limit";

interface MessageInput {
  role: string;
  content: string;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const url = new URL(req.url);
    const take = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 100);
    const skip = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);

    const conversations = await prisma.conversation.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take,
      skip,
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 3,
        },
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Erreur conversations GET:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!rateLimit(getIp(req), 30, 60_000)) {
    return NextResponse.json({ error: "Trop de requêtes." }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const convCount = await prisma.conversation.count({ where: { userId: session.user.id } });
    if (convCount >= 200) {
      return NextResponse.json({ error: "Limite de 200 conversations atteinte." }, { status: 429 });
    }

    const { title, initialMessages } = await req.json();

    const sanitizedTitle =
      typeof title === "string" ? title.trim().substring(0, 100) : "Nouvelle conversation";

    const validMessages: MessageInput[] = Array.isArray(initialMessages)
      ? initialMessages
          .filter((m) => typeof m?.role === "string" && typeof m?.content === "string")
          .map((m) => ({ role: m.role, content: m.content }))
      : [];

    const conversation = await prisma.conversation.create({
      data: {
        title: sanitizedTitle || "Nouvelle conversation",
        userId: session.user.id,
        messages: {
          create: validMessages,
        },
      },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Erreur conversations POST:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
