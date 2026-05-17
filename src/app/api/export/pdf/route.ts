import { NextResponse } from "next/server";
import { auth } from "@/auth";
import puppeteer from "puppeteer";
import { marked } from "marked";

const ALLOWED_TYPES = ["ebook", "formation", "vente", "blueprint"] as const;
type DocType = (typeof ALLOWED_TYPES)[number];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const { markdown, type } = await req.json();

    if (!markdown || typeof markdown !== "string") {
      return NextResponse.json({ error: "Aucun contenu fourni" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(type as DocType)) {
      return NextResponse.json({ error: "Type de document invalide" }, { status: 400 });
    }

    const htmlContent = await marked.parse(markdown);

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
              font-size: 11pt;
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
          <div class="header">FORJA Digital Studio</div>
          <div class="type-badge">Document : ${(type as string).toUpperCase()}</div>
          ${htmlContent}
        </body>
      </html>
    `;

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
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
