import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { SYSTEM_PROMPT } from "@/lib/llm/prompts";
import { callLLM, LLMMessage } from "@/lib/llm/client";
import { rateLimit } from "@/lib/rate-limit";
import {
  checkAndIncrementDailyChat,
  buildQuotaExceededMessage,
  PER_HOUR_LIMIT,
  CONVERSATION_CAP,
} from "@/lib/chat-quota";

export async function POST(req: Request) {
  // ── COUCHE 0 : auth (on a besoin de l'userId pour les limites suivantes)
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const userId = session.user.id;

  // ── COUCHE 1 : rate-limit utilisateur (anti-burst) — 30 messages/heure
  const burstOk = await rateLimit(`chat-user:${userId}`, PER_HOUR_LIMIT, 60 * 60_000);
  if (!burstOk) {
    return NextResponse.json(
      {
        error: "RATE_LIMITED",
        message: `Tu envoies beaucoup de messages d'un coup (max ${PER_HOUR_LIMIT}/heure). Reprends ton souffle et réessaie dans quelques minutes.`,
      },
      { status: 429 }
    );
  }

  // ── COUCHE 2 : quota quotidien (50 non-payeur / 300 payeur)
  // isCustomer = l'utilisateur a au moins un Payment approuvé (à vie).
  // Une fois acheté un pack, il garde le quota plus large même après expiration des crédits.
  const customerPayment = await prisma.payment.findFirst({
    where: { userId, status: "approved" },
    select: { id: true },
  });
  const isCustomer = !!customerPayment;
  const quota = await checkAndIncrementDailyChat(userId, isCustomer);
  if (!quota.allowed) {
    return NextResponse.json(
      {
        error: "QUOTA_EXCEEDED",
        message: buildQuotaExceededMessage(isCustomer, quota.limit),
        quota: { count: quota.count, limit: quota.limit, isCustomer },
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const messages: unknown = body.messages;
    const preferredProvider: string | undefined =
      typeof body.provider === "string" ? body.provider : undefined;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages invalides" }, { status: 400 });
    }

    // ── COUCHE 3 : cap par conversation — limite la longueur d'historique transmis.
    // Force l'utilisateur à clôturer / exporter au-delà de 80 messages, sinon
    // les conversations infinies coûtent cher en LLM et la qualité se dégrade.
    if (messages.length > CONVERSATION_CAP) {
      return NextResponse.json(
        {
          error: "CONVERSATION_TOO_LONG",
          message: `Cette conversation a atteint sa limite (${CONVERSATION_CAP} messages). Exporte ton produit en PDF ou démarre une nouvelle session pour continuer à forger.`,
        },
        { status: 429 }
      );
    }

    const validMessages: LLMMessage[] = messages
      .map((m) => {
        if (typeof m?.role !== "string" || typeof m?.content !== "string") {
          throw new Error("Format de message invalide");
        }
        if (m.role !== "user" && m.role !== "assistant") {
          throw new Error("Rôle de message invalide");
        }
        if (m.content.length > 200_000) {
          throw new Error("Contenu de message trop long");
        }
        return { role: m.role as "user" | "assistant", content: m.content };
      })
      .filter((_, i, arr) => {
        // Anthropic requires the first message to be from "user"
        // Drop leading assistant messages
        const firstUserIdx = arr.findIndex((m) => m.role === "user");
        return i >= firstUserIdx;
      })
      .slice(-20); // Keep only last 20 messages to manage context window

    if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY && !process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({
        content: [{ text: "Je suis en mode démo (aucune clé API configurée). Ajoute `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` ou `DEEPSEEK_API_KEY` dans le `.env`." }],
      });
    }

    const data = await callLLM(validMessages, SYSTEM_PROMPT, preferredProvider);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
