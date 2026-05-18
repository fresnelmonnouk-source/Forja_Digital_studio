import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

type ImageQuality = "standard" | "high" | "premium";

const PROVIDER_ORDER: Record<ImageQuality, string[]> = {
  standard: ["fal-flux-schnell", "pollinations"],
  high:     ["fal-flux-dev", "fal-flux-schnell", "pollinations"],
  premium:  ["dalle2", "fal-flux-dev", "fal-flux-schnell", "pollinations"],
};

const STYLE_PREFIXES: Record<string, string> = {
  cover:        "Professional ebook cover design, ",
  illustration: "Modern editorial illustration, ",
  diagram:      "Clean technical diagram, ",
  header:       "Elegant section header visual, ",
};

function buildPrompt(type: string, description: string): string {
  const prefix = STYLE_PREFIXES[type] ?? "";
  const hasWarmColors = /ember|amber|brass|orange/i.test(description);
  const colorHint =
    !hasWarmColors && (type === "cover" || type === "illustration")
      ? ", warm color palette with orange and amber tones"
      : "";
  return `${prefix}${description}${colorHint}, high quality, professional, no text overlays, clean composition`;
}

async function fetchWithTimeout(url: string, opts: RequestInit, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function generateFal(prompt: string, model: string, params: Record<string, unknown>): Promise<string | null> {
  const falKey = process.env.FAL_KEY;
  if (!falKey) return null;
  try {
    const res = await fetchWithTimeout(
      `https://fal.run/${model}`,
      {
        method: "POST",
        headers: { Authorization: `Key ${falKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, ...params }),
      },
      20_000
    );
    if (!res.ok) return null;
    const data = await res.json();
    const imageUrl = data?.images?.[0]?.url;
    if (!imageUrl) return null;
    const imgRes = await fetchWithTimeout(imageUrl, {}, 10_000);
    if (!imgRes.ok) return null;
    const buf = await imgRes.arrayBuffer();
    const ct = imgRes.headers.get("content-type") || "image/jpeg";
    return `data:${ct};base64,${Buffer.from(buf).toString("base64")}`;
  } catch { return null; }
}

async function generatePollinations(prompt: string): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(prompt.slice(0, 500));
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=512&model=flux-schnell&nologo=true&seed=${Date.now() % 10000}`;
    const res = await fetchWithTimeout(url, { method: "GET" }, 18_000);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const ct = res.headers.get("content-type") || "image/jpeg";
    return `data:${ct};base64,${Buffer.from(buf).toString("base64")}`;
  } catch { return null; }
}

async function generateDalle2(prompt: string): Promise<string | null> {
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
    if (!res.ok) return null;
    const data = await res.json();
    const b64 = data?.data?.[0]?.b64_json;
    return b64 ? `data:image/png;base64,${b64}` : null;
  } catch { return null; }
}

async function generateByProvider(provider: string, prompt: string): Promise<string | null> {
  switch (provider) {
    case "fal-flux-schnell": return generateFal(prompt, "fal-ai/flux/schnell", { image_size: "landscape_4_3", num_inference_steps: 4, num_images: 1 });
    case "fal-flux-dev":     return generateFal(prompt, "fal-ai/flux/dev", { image_size: "landscape_4_3", num_inference_steps: 28, guidance_scale: 3.5, num_images: 1 });
    case "dalle2":           return generateDalle2(prompt);
    case "pollinations":     return generatePollinations(prompt);
    default:                 return null;
  }
}

async function generateImage(prompt: string, quality: ImageQuality): Promise<string | null> {
  const providers = PROVIDER_ORDER[quality];
  const globalTimeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 20_000));
  try {
    return await Promise.race([
      Promise.any(
        providers.map((p) =>
          generateByProvider(p, prompt).then((r) => {
            if (!r) throw new Error("null");
            return r;
          })
        )
      ),
      globalTimeout,
    ]);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { quality, type, description } = await req.json();

    if (!type || !description) {
      return NextResponse.json({ error: "Type et description requis" }, { status: 400 });
    }
    if (!["cover", "illustration", "diagram", "header"].includes(type)) {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    }
    const resolvedQuality: ImageQuality =
      ["standard", "high", "premium"].includes(quality) ? quality : "standard";

    const prompt = buildPrompt(type, description);
    const imageData = await generateImage(prompt, resolvedQuality);

    if (!imageData) {
      return NextResponse.json({ error: "Aucun provider n'a pu générer l'image" }, { status: 503 });
    }

    return NextResponse.json({ url: imageData, type, quality: resolvedQuality });
  } catch (error) {
    console.error("[generate-image]", error);
    return NextResponse.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}
