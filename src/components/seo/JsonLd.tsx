// Injecte un bloc JSON-LD (données structurées Schema.org) dans le <head>/<body>.
// Le type "application/ld+json" est ignoré par le navigateur et lu par les
// moteurs de recherche. Autorisé par la CSP (script-src 'unsafe-inline').
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify échappe les caractères ; on neutralise < pour éviter toute
      // sortie de balise script (défense en profondeur, contenu de confiance).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
