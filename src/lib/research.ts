// Recherche de marché pour FORJA (méthode ORACLE) : web (Tavily) + Reddit.
// Permet à FORJA de lire de vrais avis, discussions, posts pour valider un signal.
// Chaque source est gracieuse : sans clé/identifiants → ignorée (pas d'erreur).

export interface ResearchResult {
  title: string;
  snippet: string;
  url: string;
  source: "web" | "reddit";
}

function timeoutSignal(ms: number) {
  return AbortSignal.timeout(ms);
}

// ── Web via Tavily (palier gratuit) ──────────────────────────────
async function searchWeb(query: string, max = 5): Promise<ResearchResult[]> {
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
      signal: timeoutSignal(12_000),
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

// ── Reddit via OAuth client-credentials (lecture) ────────────────
async function getRedditToken(): Promise<string | null> {
  const id = process.env.REDDIT_CLIENT_ID;
  const secret = process.env.REDDIT_CLIENT_SECRET;
  if (!id || !secret) return null;
  try {
    const res = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "forja-research/1.0",
      },
      body: "grant_type=client_credentials",
      signal: timeoutSignal(8_000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.access_token ?? null;
  } catch {
    return null;
  }
}

async function searchReddit(query: string, max = 4): Promise<ResearchResult[]> {
  const token = await getRedditToken();
  if (!token) return [];
  try {
    const url = `https://oauth.reddit.com/search?q=${encodeURIComponent(query)}&limit=${max}&sort=relevance&type=link`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, "User-Agent": "forja-research/1.0" },
      signal: timeoutSignal(10_000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.data?.children ?? []).slice(0, max).map((c: { data?: Record<string, unknown> }) => {
      const d = c.data ?? {};
      return {
        title: String(d.title ?? "").slice(0, 140),
        snippet: (String(d.selftext ?? "") || `r/${d.subreddit ?? ""} · ${d.ups ?? 0} upvotes · ${d.num_comments ?? 0} commentaires`).slice(0, 300),
        url: `https://www.reddit.com${d.permalink ?? ""}`,
        source: "reddit" as const,
      };
    });
  } catch {
    return [];
  }
}

/** Lance web + Reddit en parallèle, renvoie les résultats fusionnés. */
export async function research(query: string): Promise<ResearchResult[]> {
  const [web, reddit] = await Promise.all([searchWeb(query), searchReddit(query)]);
  return [...web, ...reddit];
}

export function hasResearchKeys(): boolean {
  return !!process.env.TAVILY_API_KEY || (!!process.env.REDDIT_CLIENT_ID && !!process.env.REDDIT_CLIENT_SECRET);
}
