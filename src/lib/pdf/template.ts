import { DocType } from "./types";

export function buildHtmlTemplate(
  htmlContent: string,
  type: DocType,
  docTitle: string,
  includeCover: boolean,
  includeSignature: boolean,
  printerMode: boolean
): string {
  const coverPage = includeCover
    ? `<div style="page-break-after: always; display: flex; flex-direction: column; align-items: center; justify-content: center; height: calc(297mm - 60mm); text-align: center; padding: 40px; box-sizing: border-box;">
          <div style="font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif; font-size: 42pt; font-weight: 700; color: #0A0804; line-height: 1.2; margin-bottom: 30px;">${docTitle}</div>
          <div style="background: #E8C547; height: 3px; width: 80px; margin: 0 auto 30px;"></div>
          <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 10pt; color: #5A4A28; text-transform: uppercase; letter-spacing: 4px;">${(type as string).toUpperCase()}</div>
          ${includeSignature ? `<div style="margin-top: 80px; font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif; font-style: italic; font-size: 14pt; color: #A07820;">FORJA Digital Studio</div>` : ""}
        </div>`
    : "";

  // Table des matières — générée automatiquement à partir des titres ## (h2) du document.
  const tocItems = Array.from(htmlContent.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi))
    .map((m) => m[1].replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);
  const tocPage = tocItems.length >= 2
    ? `<div class="toc">
          <div class="toc-title">Table des matières</div>
          <ol class="toc-list">
            ${tocItems.map((t) => `<li><span class="toc-text">${t}</span></li>`).join("")}
          </ol>
        </div>`
    : "";

  return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
          <style>
            /* Les marges réelles (haut/bas/gauche/droite) sont imposées par Puppeteer
               (option margin de page.pdf) → uniformes sur CHAQUE page. Le body ne met
               donc plus de padding (sinon double marge sur la 1re page uniquement). */
            @page { margin: 0; size: A4; }

            body {
              font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
              color: #1a1a1a;
              background: #ffffff;
              line-height: 1.6;
              font-size: ${printerMode ? "10.5pt" : "11pt"};
              padding: 0;
              margin: 0;
            }

            /* Évite de couper têtes de section, et orphelins/veuves en bas/haut de page */
            h1, h2, h3 { page-break-after: avoid; break-after: avoid; }
            p, li { orphans: 2; widows: 2; }
            tr, img, figure, blockquote, pre { page-break-inside: avoid; }

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

            /* Table des matières */
            .toc { page-break-after: always; padding-top: 10mm; }
            .toc-title {
              font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
              font-size: 26pt; font-weight: 700; color: #0A0804;
              border-bottom: 3px solid #E8C547; padding-bottom: 8px; margin-bottom: 24px;
            }
            .toc-list { list-style: none; counter-reset: toc; padding: 0; margin: 0; }
            .toc-list li {
              counter-increment: toc;
              display: flex; align-items: baseline;
              padding: 9px 0; border-bottom: 1px solid #ede4d0;
              font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
              font-size: 13.5pt; color: #2a2a2a;
            }
            .toc-list li::before {
              content: counter(toc, decimal-leading-zero);
              font-family: 'JetBrains Mono', 'Courier New', monospace;
              font-size: 10pt; color: #A07820; font-weight: 700;
              margin-right: 14px; min-width: 26px;
            }
          </style>
        </head>
        <body>
          <script>
            mermaid.initialize({ startOnLoad: true, theme: 'neutral', securityLevel: 'loose', suppressErrors: true });
          </script>
          ${coverPage}
          ${tocPage}
          <div class="header">FORJA Digital Studio</div>
          <div class="type-badge">Document : ${(type as string).toUpperCase()}</div>
          ${htmlContent}
        </body>
      </html>
    `;
}
