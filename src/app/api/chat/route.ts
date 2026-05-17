import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { SYSTEM_PROMPT } from "@/lib/llm/prompts";
import { rateLimit, getIp } from "@/lib/rate-limit";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  if (!(await rateLimit(getIp(req), 20, 60_000))) {
    return NextResponse.json({ error: "Trop de requêtes. Attends une minute." }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await req.json();
    const messages: unknown = body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages invalides" }, { status: 400 });
    }

    const validMessages: ChatMessage[] = messages.map((m) => {
      if (typeof m?.role !== "string" || typeof m?.content !== "string") {
        throw new Error("Format de message invalide");
      }
      if (m.role !== "user" && m.role !== "assistant") {
        throw new Error("Rôle de message invalide");
      }
      if (m.content.length > 50_000) {
        throw new Error("Contenu de message trop long");
      }
      return { role: m.role, content: m.content };
    });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        content: [{ text: "Je suis en mode démo (Clé API Anthropic manquante). Configure la variable `ANTHROPIC_API_KEY` dans le `.env` pour que je puisse utiliser l'IA." }]
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL || "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: validMessages
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Anthropic Error:", data.error);
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
