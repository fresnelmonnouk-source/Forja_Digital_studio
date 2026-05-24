export type LLMMessage = { role: "user" | "assistant"; content: string };
export type LLMResponse = { content: Array<{ text: string }>; usedProvider: string };

// Ordre de fallback : Anthropic → DeepSeek → OpenAI
const FALLBACK_ORDER = ["anthropic", "deepseek", "openai"] as const;

const DEFAULT_MODELS: Record<string, string> = {
  anthropic: process.env.LLM_MODEL || "claude-haiku-4-5-20251101",
  openai:    "gpt-4o-mini",
  deepseek:  "deepseek-chat",
};

function getApiKey(provider: string): string | undefined {
  if (provider === "anthropic") return process.env.ANTHROPIC_API_KEY;
  if (provider === "openai")    return process.env.OPENAI_API_KEY;
  if (provider === "deepseek")  return process.env.DEEPSEEK_API_KEY;
}

function availableProviders(): string[] {
  return FALLBACK_ORDER.filter((p) => !!getApiKey(p));
}

// Détecte si l'erreur vient d'un manque de crédits/quota → déclenche le fallback
function isQuotaError(status: number, body: unknown): boolean {
  if (status === 402) return true;
  if (status === 429) {
    const raw = JSON.stringify(body).toLowerCase();
    return raw.includes("quota") || raw.includes("billing") || raw.includes("credit") || raw.includes("insufficient");
  }
  return false;
}

async function callAnthropic(messages: LLMMessage[], systemPrompt: string, maxTokens: number): Promise<string> {
  const apiKey = getApiKey("anthropic")!;
  const model = DEFAULT_MODELS.anthropic;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    // Prompt caching : le gros prompt système (~9k tokens) est mis en cache côté
    // Anthropic et n'est re-facturé qu'à ~10% sur les appels suivants (TTL ~5 min).
    // Le system devient un bloc avec cache_control (au lieu d'une simple string).
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
      messages,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    if (isQuotaError(res.status, data)) throw new QuotaError("anthropic", data?.error?.message);
    throw new Error(data?.error?.message || `Anthropic ${res.status}`);
  }
  return (data.content as Array<{ text?: string }>).map((b) => b.text || "").join("");
}

async function callOpenAICompat(
  provider: "openai" | "deepseek",
  messages: LLMMessage[],
  systemPrompt: string,
  maxTokens: number
): Promise<string> {
  const apiKey = getApiKey(provider)!;
  const model = DEFAULT_MODELS[provider];
  const baseUrl =
    provider === "openai"
      ? "https://api.openai.com/v1/chat/completions"
      : "https://api.deepseek.com/v1/chat/completions";

  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    if (isQuotaError(res.status, data)) throw new QuotaError(provider, data?.error?.message);
    throw new Error(data?.error?.message || `${provider} ${res.status}`);
  }
  return data.choices?.[0]?.message?.content ?? "";
}

class QuotaError extends Error {
  constructor(public provider: string, message?: string) {
    super(message || `Quota épuisé sur ${provider}`);
    this.name = "QuotaError";
  }
}

async function callProvider(provider: string, messages: LLMMessage[], systemPrompt: string, maxTokens: number): Promise<string> {
  if (provider === "anthropic") return callAnthropic(messages, systemPrompt, maxTokens);
  if (provider === "openai" || provider === "deepseek")
    return callOpenAICompat(provider as "openai" | "deepseek", messages, systemPrompt, maxTokens);
  throw new Error(`Provider inconnu : ${provider}`);
}

export async function callLLM(
  messages: LLMMessage[],
  systemPrompt: string,
  preferredProvider?: string,
  maxTokens = 4096
): Promise<LLMResponse> {
  const available = availableProviders();
  if (available.length === 0) throw new Error("Aucune clé API configurée.");

  // Ordre : provider choisi en premier, puis fallback sur les autres
  const order =
    preferredProvider && preferredProvider !== "auto"
      ? [preferredProvider, ...available.filter((p) => p !== preferredProvider)]
      : available;

  const tried: string[] = [];
  for (const provider of order) {
    if (!getApiKey(provider)) continue;
    tried.push(provider);
    try {
      const text = await callProvider(provider, messages, systemPrompt, maxTokens);
      return { content: [{ text }], usedProvider: provider };
    } catch (err) {
      if (err instanceof QuotaError) {
        console.warn(`[LLM] Quota épuisé sur ${provider}, passage au suivant…`);
        continue;
      }
      throw err;
    }
  }

  throw new Error(`Tous les providers ont échoué (testés : ${tried.join(", ")})`);
}

export { availableProviders };
