import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { research, hasResearchKeys } from "@/lib/research";

export const maxDuration = 30;

export async function POST(req: Request) {
  if (!(await rateLimit(getIp(req), 15, 60_000))) {
    return NextResponse.json({ error: "Trop de requêtes." }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const { query } = await req.json();
    if (typeof query !== "string" || !query.trim()) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
    }
    if (!hasResearchKeys()) {
      return NextResponse.json({ results: [], configured: false });
    }
    const results = await research(query.trim().slice(0, 200));
    return NextResponse.json(
      { results, configured: true },
      { headers: { "Cache-Control": "private, max-age=300" } }
    );
  } catch (error) {
    console.error("Erreur recherche:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
