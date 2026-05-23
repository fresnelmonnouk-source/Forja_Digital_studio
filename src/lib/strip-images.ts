// Retire les images base64 (data: URIs) d'un contenu de message.
// Elles sont inutiles pour le LLM (qui ne les "voit" pas) et trop lourdes pour
// l'historique : limite 200k chars côté /api/chat, 50k en base, et budget de
// tokens côté génération PDF. L'image reste affichée dans l'UI ; on n'envoie /
// ne stocke qu'un placeholder léger.
export function stripImageData(content: string): string {
  return content
    .replace(/!\[[^\]]*\]\(\s*data:[^)]*\)/g, "[image générée]")
    .replace(/data:[^\s)]+/g, "[image]");
}
