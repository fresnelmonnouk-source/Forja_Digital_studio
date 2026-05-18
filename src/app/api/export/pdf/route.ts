import { NextResponse } from "next/server";
import { auth } from "@/auth";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { marked } from "marked";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { callLLM, LLMMessage } from "@/lib/llm/client";

const ALLOWED_TYPES = ["ebook", "formation", "vente", "blueprint"] as const;
type DocType = (typeof ALLOWED_TYPES)[number];

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
## Plan d'action

Règles :
- Rédige un vrai contenu développé, pas des titres vides
- Intègre les informations, idées et décisions de la conversation
- Ton professionnel, actionnable, structuré
- Minimum 1500 mots
- Réponds UNIQUEMENT avec le Markdown, sans commentaire`,

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
- Réponds UNIQUEMENT avec le Markdown, sans commentaire`,

  vente: `Tu es FORJA, expert en copywriting et pages de vente. À partir de la conversation ci-dessous, génère une page de vente complète en Markdown.

Structure obligatoire :
# [Headline principale — accroche puissante]
## Le problème que tu résous
## La solution : [Nom du produit/offre]
## Ce que tu vas obtenir
## Pour qui c'est fait
## Ce qui est inclus
## Témoignages & preuves
## L'offre complète & le prix
## Garantie
## FAQ
## Appel à l'action final

Règles :
- Copywriting direct, émotionnel, orienté bénéfices
- Basé sur les informations, l'avatar et l'offre de la conversation
- Minimum 1200 mots
- Réponds UNIQUEMENT avec le Markdown, sans commentaire`,

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
- Réponds UNIQUEMENT avec le Markdown, sans commentaire`,
};

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

    // Génération du document par le LLM
    const llmMessages: LLMMessage[] = conversation
      .filter((m: { role: string; content: string }) => m.role === "user" || m.role === "assistant")
      .map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const llmResult = await callLLM(llmMessages, DOC_PROMPTS[type as DocType]);
    const markdown = llmResult.content.map((b) => b.text).join("");

    if (!markdown.trim()) {
      return NextResponse.json({ error: "Le document généré est vide." }, { status: 500 });
    }

    const htmlContent = await marked.parse(markdown);
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const escapeHtml = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const docTitle = escapeHtml(titleMatch ? titleMatch[1].trim() : (type as string).toUpperCase());

    const coverPage = includeCover
      ? `<div style="page-break-after: always; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: calc(297mm - 40mm); text-align: center; padding: 40px;">
          <div style="font-family: 'Cormorant Garamond', serif; font-size: 42pt; font-weight: 700; color: #0A0804; line-height: 1.2; margin-bottom: 30px;">${docTitle}</div>
          <div style="background: #E8C547; height: 3px; width: 80px; margin: 0 auto 30px;"></div>
          <div style="font-family: 'DM Sans', sans-serif; font-size: 10pt; color: #5A4A28; text-transform: uppercase; letter-spacing: 4px;">${(type as string).toUpperCase()}</div>
          ${includeSignature ? `<div style="margin-top: 80px; font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 14pt; color: #A07820;">FORJA Digital Studio</div>` : ""}
        </div>`
      : "";

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

            @page {
              margin: 0;
              size: A4;
            }
            body {
              font-family: 'DM Sans', sans-serif;
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
              font-family: 'Cormorant Garamond', serif;
              color: #A07820;
              font-size: 14pt;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            h1, h2, h3 {
              font-family: 'Cormorant Garamond', serif;
              color: #0A0804;
              font-weight: 700;
            }
            h1 { font-size: 24pt; border-bottom: 3px solid #E8C547; padding-bottom: 5px; margin-bottom: 20px; }
            h2 { font-size: 18pt; margin-top: 30px; margin-bottom: 15px; color: #8A7040; }
            h3 { font-size: 14pt; font-style: italic; color: #5A4A28; }
            p { margin-bottom: 15px; }
            strong { color: #A07820; }
            code {
              font-family: 'JetBrains Mono', monospace;
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
              overflow-x: auto;
              font-family: 'JetBrains Mono', monospace;
              font-size: 0.85em;
              line-height: 1.5;
              margin-bottom: 15px;
            }
            pre code { background: none; color: inherit; padding: 0; }
            ul, ol { margin-bottom: 15px; padding-left: 20px; }
            li { margin-bottom: 5px; }
            hr { border: 0; border-top: 1px solid #e0e0e0; margin: 30px 0; }
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
      await page.setContent(htmlTemplate, { waitUntil: "load" });
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
