import { ImageQuality } from "./types";

export const PROVIDER_ORDER: Record<ImageQuality, string[]> = {
  standard: ["pollinations"],
  high: ["pollinations"],
  premium: ["dalle", "pollinations"],
};

async function fetchWithTimeout(url: string, opts: RequestInit, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function generateDalle(prompt: string): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetchWithTimeout(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "dall-e-2",
          prompt: prompt.slice(0, 1000),
          n: 1,
          size: "1024x1024",
          response_format: "b64_json",
        }),
      },
      12_000
    );
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.log(`[IMAGE] DALL-E 2 error ${res.status}: ${errText.slice(0, 200)}`);
      return null;
    }
    const data = await res.json();
    const b64 = data?.data?.[0]?.b64_json;
    return b64 ? `data:image/png;base64,${b64}` : null;
  } catch (e) {
    console.log("[IMAGE] DALL-E 2 exception:", e);
    return null;
  }
}

export async function generatePollinations(prompt: string): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(prompt.slice(0, 500));
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=512&model=flux-schnell&nologo=true&seed=${Date.now() % 10000}`;
    const res = await fetchWithTimeout(url, { method: "GET" }, 9_000);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const ct = res.headers.get("content-type") || "image/jpeg";
    return `data:${ct};base64,${Buffer.from(buf).toString("base64")}`;
  } catch {
    return null;
  }
}

async function generateByProvider(provider: string, prompt: string): Promise<string | null> {
  switch (provider) {
    case "dalle":
      return generateDalle(prompt);
    case "pollinations":
      return generatePollinations(prompt);
    default:
      return null;
  }
}

export async function generateImage(prompt: string, quality: ImageQuality = "standard"): Promise<string | null> {
  const providers = PROVIDER_ORDER[quality];
  // Budget court : mieux vaut une image manquante qu'un timeout de toute la requête PDF.
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 10_000));
  try {
    const result = await Promise.race([
      Promise.any(
        providers.map((p) =>
          generateByProvider(p, prompt).then((r) => {
            if (!r) throw new Error("null");
            return r;
          })
        )
      ),
      timeout,
    ]);
    return result;
  } catch {
    return null;
  }
}
