import { NextResponse } from "next/server";
import { auth } from "@/auth";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { marked } from "marked";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { callLLM, LLMMessage } from "@/lib/llm/client";
import { ALLOWED_TYPES, DocType } from "@/lib/pdf/types";
import { truncateToCharBudget } from "@/lib/pdf/truncate";
import { processCharts } from "@/lib/pdf/charts";
import { processMermaidBlocks } from "@/lib/pdf/mermaid";
import { planAndGenerateImages } from "@/lib/pdf/image-planner";
import { DOC_PROMPTS } from "@/lib/pdf/prompts";
import { buildHtmlTemplate } from "@/lib/pdf/template";

export const maxDuration = 60;

export async function POST(req: Request) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).slice(2, 10);
  console.log(`[PDF-${requestId}] ⏱️ Début de la requête`);

  if (!(await rateLimit(getIp(req), 5, 60_000))) {
    console.log(`[PDF-${requestId}] ❌ Rate limit dépassée`);
    return NextResponse.json({ error: "Trop de requêtes. Attends une minute." }, { status: 429 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    console.log(`[PDF-${requestId}] ❌ Non authentifié`);
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  console.log(`[PDF-${requestId}] ✓ Authentification OK`);

  try {
    const { conversation, type, opts } = await req.json();
    console.log(`[PDF-${requestId}] 📦 Données reçues: ${conversation.length} messages, type=${type}`);

    if (!Array.isArray(conversation) || conversation.length === 0) {
      console.log(`[PDF-${requestId}] ❌ Conversation invalide`);
      return NextResponse.json({ error: "Aucune conversation fournie" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(type as DocType)) {
      console.log(`[PDF-${requestId}] ❌ Type de document invalide: ${type}`);
      return NextResponse.json({ error: "Type de document invalide" }, { status: 400 });
    }

    const [includeCover = true, includeSignature = true, printerMode = false] = Array.isArray(opts)
      ? opts.map((v) => Boolean(v))
      : [true, true, false];
    console.log(`[PDF-${requestId}] ⚙️ Options: cover=${includeCover}, signature=${includeSignature}, printer=${printerMode}`);

    const allMessages: LLMMessage[] = conversation
      .filter((m: { role: string; content: string }) => m.role === "user" || m.role === "assistant")
      .map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    // Contexte borné (~20k tokens) : on garde la conversation récente pertinente.
    // Inutile d'envoyer des Mo au LLM — ça ralentit la génération et coûte cher.
    const CHAR_BUDGET = 80_000;
    const llmMessages = truncateToCharBudget(allMessages, CHAR_BUDGET);
    console.log(`[PDF-${requestId}] 📝 Messages tronqués: ${llmMessages.length} messages (budget caractères: ${CHAR_BUDGET})`);

    const llmStartTime = Date.now();
    // 8192 tokens de sortie (au lieu de 4096) : un ebook complet de plusieurs
    // chapitres dépassait 4096 et se faisait couper en pleine phrase.
    const llmResult = await callLLM(llmMessages, DOC_PROMPTS[type as DocType], undefined, 8192);
    let markdown = llmResult.content.map((b) => b.text).join("");
    // Nettoyage : retire tout préambule conversationnel avant le 1er titre "# ..."
    // (le modèle ajoute parfois "Absolument… Voici ton ebook." malgré la consigne)
    // et les éventuelles clôtures de bloc de code markdown autour du document.
    markdown = markdown.replace(/^```(?:markdown)?\s*/i, "").replace(/\s*```\s*$/i, "");
    const h1Idx = markdown.search(/^#\s+/m);
    if (h1Idx > 0) markdown = markdown.slice(h1Idx);
    const llmDuration = Date.now() - llmStartTime;
    console.log(`[PDF-${requestId}] ✓ LLM #1 terminé en ${llmDuration}ms (markdown: ${markdown.length} chars)`);

    if (!markdown.trim()) {
      console.log(`[PDF-${requestId}] ❌ Markdown vide après LLM`);
      return NextResponse.json({ error: "Le document généré est vide." }, { status: 500 });
    }

    const imagesStartTime = Date.now();
    markdown = await planAndGenerateImages(markdown, type as DocType);
    const imagesDuration = Date.now() - imagesStartTime;
    console.log(`[PDF-${requestId}] ✓ Images traitées en ${imagesDuration}ms`);

    const htmlStartTime = Date.now();
    let htmlContent = await marked.parse(markdown);
    htmlContent = processMermaidBlocks(htmlContent);
    htmlContent = processCharts(htmlContent);
    const htmlDuration = Date.now() - htmlStartTime;
    console.log(`[PDF-${requestId}] ✓ HTML converti en ${htmlDuration}ms`);

    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const docTitle = titleMatch ? titleMatch[1].trim() : (type as string).toUpperCase();
    const htmlTemplate = buildHtmlTemplate(htmlContent, type as DocType, docTitle, includeCover, includeSignature, printerMode);

    let browser;
    try {
      const puppeteerStartTime = Date.now();
      console.log(`[PDF-${requestId}] 🌐 Lancement Puppeteer...`);

      browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      });
      console.log(`[PDF-${requestId}] ✓ Puppeteer lancé`);

      const page = await browser.newPage();
      console.log(`[PDF-${requestId}] ✓ Nouvelle page créée`);

      await page.setContent(htmlTemplate, { waitUntil: "domcontentloaded" });
      console.log(`[PDF-${requestId}] ✓ Contenu HTML chargé`);

      await new Promise((r) => setTimeout(r, 1000));
      console.log(`[PDF-${requestId}] ✓ Attente 1s (images/fonts)`);

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        // Marges imposées sur CHAQUE page (haut/bas/gauche/droite).
        margin: { top: "20mm", bottom: "20mm", left: "18mm", right: "18mm" },
        // Pied de page constant : numéro de page + signature.
        displayHeaderFooter: true,
        headerTemplate: "<div></div>",
        footerTemplate:
          `<div style="width:100%; padding:0 18mm; font-family:Georgia,'Times New Roman',serif; font-size:8pt; color:#A07820; text-align:center;">` +
          `<span class="pageNumber"></span> · FORJA Digital Studio</div>`,
      });
      const puppeteerDuration = Date.now() - puppeteerStartTime;
      console.log(`[PDF-${requestId}] ✓ PDF généré en ${puppeteerDuration}ms (taille: ${pdfBuffer.length} bytes)`);

      const totalDuration = Date.now() - startTime;
      console.log(`[PDF-${requestId}] ✅ SUCCÈS - Durée totale: ${totalDuration}ms`);
      console.log(`[PDF-${requestId}] 📊 Résumé: LLM=${llmDuration}ms, Images=${imagesDuration}ms, HTML=${htmlDuration}ms, Puppeteer=${puppeteerDuration}ms`);

      return new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="FORJA_${type}_${Date.now()}.pdf"`,
          "X-PDF-Request-ID": requestId,
          "X-PDF-Duration-MS": totalDuration.toString(),
        },
      });
    } finally {
      if (browser) {
        console.log(`[PDF-${requestId}] 🧹 Fermeture Puppeteer`);
        await browser.close();
      }
    }
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`[PDF-${requestId}] ❌ ERREUR après ${totalDuration}ms:`, error);
    return NextResponse.json({
      error: "Erreur lors de la génération du PDF",
      details: error instanceof Error ? error.message : String(error),
      requestId
    }, { status: 500 });
  }
}
