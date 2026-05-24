// Nettoyage du HTML avant rendu PDF (Puppeteer).
// Le markdown généré par le LLM peut contenir du HTML brut (marked le laisse
// passer). Avec les entrées externes (recherche web, fichiers uploadés), une
// injection de prompt pourrait insérer <script>, <iframe>, des handlers on*…
// On retire ces constructions dangereuses tout en gardant les balises légitimes
// (figure, img, div des graphiques/Mermaid injectés par notre propre code).
export function sanitizeHtml(html: string): string {
  return html
    // balises exécutables / chargeantes
    .replace(/<\s*script[\s\S]*?<\s*\/\s*script\s*>/gi, "")
    .replace(/<\s*style[\s\S]*?<\s*\/\s*style\s*>/gi, "")
    .replace(/<\s*(iframe|object|embed|link|meta|base|form)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(iframe|object|embed|link|meta|base|form)\b[^>]*\/?>/gi, "")
    // gestionnaires d'événements inline : onclick=, onerror=, onload=…
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    // URLs javascript: dans href/src
    .replace(/\s(href|src)\s*=\s*("\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]+)/gi, " $1=\"#\"");
}
