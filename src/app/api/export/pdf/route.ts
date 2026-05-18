import { NextResponse } from "next/server";
import { auth } from "@/auth";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { marked } from "marked";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { callLLM, LLMMessage } from "@/lib/llm/client";

export const maxDuration = 60;

const ALLOWED_TYPES = ["ebook", "formation", "vente", "blueprint"] as const;
type DocType = (typeof ALLOWED_TYPES)[number];

// ── Système de génération d'images HuggingFace (payant) ──────────────────────
//
// Niveaux :
//   standard → FLUX.1-schnell → SD 3.5 Large Turbo
//   high     → FLUX.1-dev → SD 3.5 Large Turbo → FLUX.1-schnell
//   premium  → DALL-E 3 → FLUX.1-dev → SD 3.5 Large Turbo
//
// Tous les modèles HF passent par api-inference.huggingface.co (clé payante)

type ImageQuality = "standard" | "high" | "premium";

const PROVIDER_ORDER: Record<ImageQuality, string[]> = {
  standard: ["hf-flux-schnell", "hf-sd35-turbo"],
  high:     ["hf-flux-dev", "hf-sd35-turbo", "hf-flux-schnell"],
  premium:  ["dalle", "hf-flux-dev", "hf-sd35-turbo"],
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

async function generateHF(prompt: string, model: string, params: Record<string, unknown>): Promise<string | null> {
  const hfKey = process.env.HUGGINGFACE_API_KEY;
  if (!hfKey) return null;
  try {
    const res = await fetchWithTimeout(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${hfKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: prompt, parameters: params }),
      },
      15_000
    );
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const ct = res.headers.get("content-type") || "image/jpeg";
    return `data:${ct};base64,${Buffer.from(buf).toString("base64")}`;
  } catch { return null; }
}

async function generateDalle(prompt: string): Promise<string | null> {
  const key = process.env.DALLE_API_KEY;
  if (!key) return null;
  try {
    const res = await fetchWithTimeout(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "dall-e-3", prompt, n: 1, size: "1792x1024", response_format: "b64_json" }),
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
    case "hf-flux-schnell": return generateHF(prompt, "black-forest-labs/FLUX.1-schnell", { num_inference_steps: 4 });
    case "hf-flux-dev":     return generateHF(prompt, "black-forest-labs/FLUX.1-dev", { num_inference_steps: 20, guidance_scale: 3.5 });
    case "hf-sd35-turbo":   return generateHF(prompt, "stabilityai/stable-diffusion-3.5-large-turbo", { num_inference_steps: 4 });
    case "dalle":           return generateDalle(prompt);
    default:                return null;
  }
}

async function generateImage(prompt: string, quality: ImageQuality = "standard"): Promise<string | null> {
  const providers = PROVIDER_ORDER[quality];
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 18_000));
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

// Remplace le premier [IMAGE:qualité:description] (les autres sont supprimés)
async function processImageTags(md: string): Promise<string> {
  const qualityRegex = /\[IMAGE:(standard|high|premium):\s*([^\]]+)\]/g;
  const simpleRegex  = /\[IMAGE:\s*([^\]]+)\]/g;

  const qualityMatches = Array.from(md.matchAll(qualityRegex));
  const simpleMatches  = Array.from(md.matchAll(simpleRegex));

  let result = md.replace(qualityRegex, "").replace(simpleRegex, "");

  let imgData: string | null = null;
  let description = "";

  if (qualityMatches.length > 0) {
    const [, quality, desc] = qualityMatches[0];
    description = desc.trim();
    imgData = await generateImage(description, quality as ImageQuality);
  } else if (simpleMatches.length > 0) {
    description = simpleMatches[0][1].trim();
    imgData = await generateImage(description, "standard");
  }

  if (!description) return result;

  // Si l'image a échoué, on n'insère rien — pas de placeholder avec le prompt brut
  if (!imgData) return result;

  const h2Match = result.match(/^## .+$/m);
  const figure = `\n\n<figure class="ai-figure"><img src="${imgData}" alt="${description}" /><figcaption>${description}</figcaption></figure>\n\n`;

  result = h2Match
    ? result.replace(h2Match[0], h2Match[0] + figure)
    : figure + result;
  return result;
}

// Convertit [CHART:bar:Titre:Label1=Val1,Label2=Val2] en graphique CSS
function buildBarChart(title: string, dataStr: string): string {
  const items = dataStr.split(",").map((item) => {
    const [label, rawVal] = item.split("=").map((s) => s.trim());
    return { label: label || "", value: parseFloat(rawVal) || 0 };
  }).filter((i) => i.label);

  if (items.length === 0) return "";
  const max = Math.max(...items.map((i) => i.value));

  const rows = items.map(({ label, value }) => {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return `<div class="chart-row">
      <div class="chart-label">${label}</div>
      <div class="chart-bar-wrap">
        <div class="chart-bar" style="width:${pct.toFixed(1)}%"></div>
        <span class="chart-value">${value}</span>
      </div>
    </div>`;
  }).join("");

  return `<div class="chart-container"><div class="chart-title">${title}</div>${rows}</div>`;
}

function processCharts(html: string): string {
  // Remplace <p>[CHART:...]</p> ou [CHART:...] inline
  return html
    .replace(/<p>\s*\[CHART:bar:([^:]+):([^\]]+)\]\s*<\/p>/g, (_, t, d) => buildBarChart(t, d))
    .replace(/\[CHART:bar:([^:]+):([^\]]+)\]/g, (_, t, d) => buildBarChart(t, d));
}

// Convertit les blocs ```mermaid en <div class="mermaid"> pour Mermaid.js
function processMermaidBlocks(html: string): string {
  return html.replace(
    /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
    (_, raw) => {
      const decoded = raw
        .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
      return `<div class="mermaid">${decoded}</div>`;
    }
  );
}

// ── Prompts ────────────────────────────────────────────────────────────────────

const VISUAL_INSTRUCTIONS = `
ÉLÉMENTS VISUELS À UTILISER DANS LE DOCUMENT :

1. DIAGRAMMES Mermaid — utilise des blocs \`\`\`mermaid quand pertinent :
   - Architecture / flux : graph TD ou graph LR
   - Planning : gantt
   - Processus : flowchart TD
   Exemple :
   \`\`\`mermaid
   graph TD
     A[Idée] --> B[Validation] --> C[MVP] --> D[Lancement]
   \`\`\`

2. ILLUSTRATION IA — OBLIGATOIRE. Tu DOIS insérer exactement UN tag image dans chaque document.
   Place-le sur sa propre ligne, juste après le premier ## (premier sous-titre), JAMAIS dans une liste ou un tableau.

   Choisis le niveau selon le type de document :
   [IMAGE:standard:description] → formation, blueprint, ebook technique
   [IMAGE:high:description]     → ebook premium, guide pratique
   [IMAGE:premium:description]  → page de vente, document commercial

   La description DOIT être en anglais, courte (max 20 mots), visuelle et précise.
   BONS exemples :
   [IMAGE:standard:professional online course dashboard interface, clean UI, blue and white tones, minimal design]
   [IMAGE:high:confident entrepreneur at modern desk with laptop, warm office lighting, professional photography]
   [IMAGE:premium:luxury digital product launch event, cinematic composition, ultra realistic, premium brand aesthetic]

   MAUVAIS exemples (à éviter) :
   ❌ [IMAGE:standard:une image de formation] — trop vague, pas en anglais
   ❌ [IMAGE:high:illustration] — pas de description visuelle
   ❌ Oublier le tag — INTERDIT, le tag est obligatoire dans chaque document

3. GRAPHIQUES EN BARRES — insère [CHART:bar:Titre:Label1=Valeur1,Label2=Valeur2] pour les données chiffrées.
   Syntaxe exacte (respecte les = et les ,) :
   [CHART:bar:Croissance mensuelle:Janvier=30,Février=65,Mars=90,Avril=120]
   [CHART:bar:Comparaison stack:Next.js=90,Laravel=70,Django=60]

4. MÉTRIQUES CLÉS — mets les chiffres importants en blockquote :
   > **Métrique :** valeur | **Autre métrique :** valeur

N'abuse pas de ces éléments : qualité > quantité.`;

const DOC_PROMPTS: Record<DocType, string> = {
  ebook: `Tu es FORJA, expert en création de produits digitaux. À partir de la conversation ci-dessous, génère un ebook complet et professionnel en Markdown.

Structure obligatoire :
# [Titre accrocheur basé sur le sujet]
## Introduction
## Chapitre 1 : [...]
## Chapitre 2 : [...]
## Chapitre 3 : [...]
(autant de chapitres que nécessaire)
## Conclusion
## Plan d'action en 5 étapes

Règles :
- Rédige un vrai contenu développé, pas des titres vides
- Intègre les informations, idées et décisions de la conversation
- Ton professionnel, actionnable, structuré
- Minimum 1500 mots
${VISUAL_INSTRUCTIONS}

Réponds UNIQUEMENT avec le Markdown, sans commentaire.`,

  formation: `Tu es FORJA, expert en ingénierie pédagogique. À partir de la conversation ci-dessous, génère un plan de formation complet en Markdown.

Structure obligatoire :
# [Titre de la formation]
## Objectifs pédagogiques
## Public cible & prérequis
## Module 1 : [Titre]
### Objectifs du module
### Contenu
### Exercice pratique
## Module 2 : [Titre]
...
## Évaluation & certification
## Ressources complémentaires

Règles :
- Développe chaque module avec un vrai contenu
- Inclus des exercices pratiques concrets
- Basé sur les informations de la conversation
- Minimum 1500 mots
${VISUAL_INSTRUCTIONS}

Réponds UNIQUEMENT avec le Markdown, sans commentaire.`,

  vente: `Tu es FORJA, expert en copywriting et pages de vente. À partir de la conversation ci-dessous, génère une page de vente complète en Markdown.

Structure obligatoire :
# [Headline principale — accroche puissante]
## Le problème que tu résous
## La solution : [Nom du produit/offre]
## Ce que tu vas obtenir
## Pour qui c'est fait
## Ce qui est inclus
## Témoignages & preuves sociales
## L'offre complète & le prix
## Garantie
## FAQ
## Appel à l'action final

Règles :
- Copywriting direct, émotionnel, orienté bénéfices
- Basé sur les informations, l'avatar et l'offre de la conversation
- Minimum 1200 mots
${VISUAL_INSTRUCTIONS}

Réponds UNIQUEMENT avec le Markdown, sans commentaire.`,

  blueprint: `Tu es FORJA, expert en architecture digitale et SaaS. À partir de la conversation ci-dessous, génère un blueprint technique complet en Markdown.

Structure obligatoire :
# [Titre du projet/produit]
## Résumé exécutif
## Problème & opportunité de marché
## Architecture de la solution
## Stack technique recommandé
## Roadmap de développement (phases)
## Modèle économique
## KPIs & métriques de succès
## Risques & mitigation
## Prochaines étapes immédiates

Règles :
- Contenu concret, chiffré, actionnable
- Basé sur les informations techniques de la conversation
- Minimum 1200 mots
${VISUAL_INSTRUCTIONS}

Réponds UNIQUEMENT avec le Markdown, sans commentaire.`,
};

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  if (!(await rateLimit(getIp(req), 5, 60_000))) {
    return NextResponse.json({ error: "Trop de requêtes. Attends une minute." }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const { conversation, type, opts } = await req.json();

    if (!Array.isArray(conversation) || conversation.length === 0) {
      return NextResponse.json({ error: "Aucune conversation fournie" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(type as DocType)) {
      return NextResponse.json({ error: "Type de document invalide" }, { status: 400 });
    }

    const [includeCover = true, includeSignature = true, printerMode = false] = Array.isArray(opts)
      ? opts.map((v) => Boolean(v))
      : [true, true, false];

    // 1. LLM génère le document en Markdown
    const llmMessages: LLMMessage[] = conversation
      .filter((m: { role: string; content: string }) => m.role === "user" || m.role === "assistant")
      .map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const llmResult = await callLLM(llmMessages, DOC_PROMPTS[type as DocType]);
    let markdown = llmResult.content.map((b) => b.text).join("");

    if (!markdown.trim()) {
      return NextResponse.json({ error: "Le document généré est vide." }, { status: 500 });
    }

    // 2. Génère l'image IA (si HUGGINGFACE_API_KEY configuré)
    markdown = await processImageTags(markdown);

    // 3. Markdown → HTML
    let htmlContent = await marked.parse(markdown);

    // 4. Convertit les blocs Mermaid et les graphiques CSS
    htmlContent = processMermaidBlocks(htmlContent);
    htmlContent = processCharts(htmlContent);

    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const escapeHtml = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const docTitle = escapeHtml(titleMatch ? titleMatch[1].trim() : (type as string).toUpperCase());

    const coverPage = includeCover
      ? `<div style="page-break-after: always; display: flex; flex-direction: column; align-items: center; justify-content: center; height: calc(297mm - 60mm); text-align: center; padding: 40px; box-sizing: border-box;">
          <div style="font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif; font-size: 42pt; font-weight: 700; color: #0A0804; line-height: 1.2; margin-bottom: 30px;">${docTitle}</div>
          <div style="background: #E8C547; height: 3px; width: 80px; margin: 0 auto 30px;"></div>
          <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 10pt; color: #5A4A28; text-transform: uppercase; letter-spacing: 4px;">${(type as string).toUpperCase()}</div>
          ${includeSignature ? `<div style="margin-top: 80px; font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif; font-style: italic; font-size: 14pt; color: #A07820;">FORJA Digital Studio</div>` : ""}
        </div>`
      : "";

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
          <style>
            @page { margin: 0; size: A4; }

            body {
              font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
              color: #1a1a1a;
              background: #ffffff;
              line-height: 1.6;
              font-size: ${printerMode ? "10.5pt" : "11pt"};
              padding: 20mm;
            }

            .header {
              text-align: right;
              border-bottom: 2px solid #E8C547;
              padding-bottom: 10px;
              margin-bottom: 30px;
              font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
              color: #A07820;
              font-size: 14pt;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 2px;
            }

            h1, h2, h3 { font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif; color: #0A0804; font-weight: 700; }
            h1 { font-size: 24pt; border-bottom: 3px solid #E8C547; padding-bottom: 5px; margin-bottom: 20px; }
            h2 { font-size: 18pt; margin-top: 36px; margin-bottom: 15px; color: #8A7040; }
            h3 { font-size: 14pt; font-style: italic; color: #5A4A28; margin-top: 20px; }
            p { margin-bottom: 15px; }
            strong { color: #A07820; }

            /* Tables */
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 24px 0;
              font-size: 10pt;
            }
            th {
              background: #0A0804;
              color: #E8C547;
              font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              font-size: 9pt;
              padding: 10px 14px;
              text-align: left;
            }
            td {
              padding: 9px 14px;
              border-bottom: 1px solid #e8e0d0;
              vertical-align: top;
            }
            tr:nth-child(even) td { background: #faf7f0; }

            /* Blockquotes → cartes métriques */
            blockquote {
              margin: 20px 0;
              padding: 14px 20px;
              background: #fdf9ee;
              border-left: 4px solid #E8C547;
              border-radius: 0 8px 8px 0;
              font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
              font-size: 13pt;
              color: #5A4A28;
            }
            blockquote strong { color: #8A5C00; }

            /* Mermaid */
            .mermaid {
              text-align: center;
              margin: 28px 0;
              padding: 20px;
              background: #faf7f0;
              border: 1px solid #e8e0d0;
              border-radius: 8px;
              overflow: hidden;
              page-break-inside: avoid;
              page-break-before: avoid;
            }
            .mermaid svg { max-width: 100%; height: auto; }

            /* Images IA */
            .ai-figure {
              margin: 28px 0;
              text-align: center;
              page-break-inside: avoid;
            }
            .ai-figure img {
              max-width: 100%;
              border-radius: 8px;
              border: 1px solid #e8e0d0;
            }
            .ai-figure figcaption {
              margin-top: 8px;
              font-size: 9pt;
              color: #8A7040;
              font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
              font-style: italic;
            }

            code {
              font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
              background: #f5f5f5;
              padding: 2px 5px;
              border-radius: 3px;
              font-size: 0.9em;
              color: #A07820;
            }
            pre {
              background: #0A0804;
              color: #7EC8A0;
              padding: 15px;
              border-radius: 5px;
              font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
              font-size: 0.85em;
              line-height: 1.5;
              margin-bottom: 15px;
              overflow-x: auto;
            }
            pre code { background: none; color: inherit; padding: 0; }
            ul, ol { margin-bottom: 15px; padding-left: 20px; }
            li { margin-bottom: 5px; }
            hr { border: 0; border-top: 1px solid #e0e0e0; margin: 30px 0; }

            /* Graphiques CSS */
            .chart-container {
              margin: 24px 0;
              padding: 20px 24px;
              background: #faf7f0;
              border: 1px solid #e8e0d0;
              border-radius: 8px;
              page-break-inside: avoid;
            }
            .chart-title {
              font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
              font-size: 13pt;
              font-weight: 700;
              color: #0A0804;
              margin-bottom: 14px;
            }
            .chart-row {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 8px;
            }
            .chart-label {
              width: 110px;
              font-size: 9pt;
              color: #5A4A28;
              flex-shrink: 0;
              text-align: right;
            }
            .chart-bar-wrap {
              flex: 1;
              display: flex;
              align-items: center;
              gap: 8px;
              background: #ede8de;
              border-radius: 4px;
              padding: 2px;
            }
            .chart-bar {
              height: 18px;
              background: linear-gradient(90deg, #E8C547, #EE5A24);
              border-radius: 3px;
              min-width: 4px;
            }
            .chart-value {
              font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
              font-size: 8.5pt;
              color: #8A7040;
              white-space: nowrap;
              padding-right: 6px;
            }

            .type-badge {
              display: inline-block;
              background: #E8C547;
              color: #0A0804;
              padding: 3px 10px;
              border-radius: 12px;
              font-size: 9pt;
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <script>
            mermaid.initialize({ startOnLoad: true, theme: 'neutral', securityLevel: 'loose', suppressErrors: true });
          </script>
          ${coverPage}
          <div class="header">FORJA Digital Studio</div>
          <div class="type-badge">Document : ${(type as string).toUpperCase()}</div>
          ${htmlContent}
        </body>
      </html>
    `;

    let browser;
    try {
      browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      });
      const page = await browser.newPage();
      await page.setContent(htmlTemplate, { waitUntil: "domcontentloaded" });
      // Attend que Mermaid.js finisse de rendre les diagrammes
      await new Promise((r) => setTimeout(r, 1000));
      const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

      return new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="FORJA_${type}_${Date.now()}.pdf"`,
        },
      });
    } finally {
      if (browser) await browser.close();
    }
  } catch (error) {
    console.error("Erreur PDF:", error);
    return NextResponse.json({ error: "Erreur lors de la génération du PDF" }, { status: 500 });
  }
}
