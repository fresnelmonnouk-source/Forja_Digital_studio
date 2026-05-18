import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { SYSTEM_PROMPT } from "@/lib/llm/prompts";
import { callLLM, LLMMessage } from "@/lib/llm/client";
import { rateLimit, getIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  if (!(await rateLimit(getIp(req), 20, 60_000))) {
    return NextResponse.json({ error: "Trop de requêtes. Attends une minute." }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await req.json();
    const messages: unknown = body.messages;
    const preferredProvider: string | undefined =
      typeof body.provider === "string" ? body.provider : undefined;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages invalides" }, { status: 400 });
    }

    const validMessages: LLMMessage[] = messages
      .map((m) => {
        if (typeof m?.role !== "string" || typeof m?.content !== "string") {
          throw new Error("Format de message invalide");
        }
        if (m.role !== "user" && m.role !== "assistant") {
          throw new Error("Rôle de message invalide");
        }
        if (m.content.length > 50_000) {
          throw new Error("Contenu de message trop long");
        }
        return { role: m.role as "user" | "assistant", content: m.content };
      })
      .filter((_, i, arr) => {
        // Anthropic requires the first message to be from "user"
        // Drop leading assistant messages
        const firstUserIdx = arr.findIndex((m) => m.role === "user");
        return i >= firstUserIdx;
      });

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
