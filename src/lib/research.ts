// Recherche de marché pour FORJA (méthode ORACLE) via recherche web (Tavily).
// Tavily renvoie des résultats web publics indexés (incluant souvent des fils de
// discussion, avis et forums). On n'utilise PAS l'API Reddit directement : sa
// "Responsible Builder Policy" interdit l'usage commercial / par IA sans accord écrit.
// Gracieux : sans clé Tavily → renvoie [] (l'appelant ignore proprement).

export interface ResearchResult {
  title: string;
  snippet: string;
  url: string;
  source: "web";
}

async function searchWeb(query: string, max = 6): Promise<ResearchResult[]> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        query,
        search_depth: "basic",
        max_results: max,
        include_answer: false,
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) {
      console.log(`[RESEARCH] Tavily ${res.status}`);
      return [];
    }
    const data = await res.json();
    return (data?.results ?? []).slice(0, max).map((r: { title?: string; content?: string; url?: string }) => ({
      title: r.title?.slice(0, 140) ?? "Sans titre",
      snippet: (r.content ?? "").slice(0, 300),
      url: r.url ?? "",
      source: "web" as const,
    }));
  } catch (e) {
    console.log("[RESEARCH] Tavily exception:", e);
    return [];
  }
}

/** Recherche de marché (web). */
export async function research(query: string): Promise<ResearchResult[]> {
  return searchWeb(query);
}

export function hasResearchKeys(): boolean {
  return !!process.env.TAVILY_API_KEY;
}
