import { callLLM, LLMMessage } from "@/lib/llm/client";
import { generateImage } from "./image-gen";
import { searchUnsplash } from "@/lib/unsplash";
import { DocType, ImagePlan, ImageQuality } from "./types";

export const IMAGE_PLANNER_PROMPT = `Tu es un designer de documents. Analyse le markdown fourni et retourne UNIQUEMENT un tableau JSON (rien d'autre, pas de commentaire, pas de markdown).

Chaque objet du tableau représente une image à insérer dans le document.
Format strict :
[
  {
    "section_index": 0,
    "kind": "photo",
    "quality": "standard",
    "description": "description en anglais, précise et visuelle"
  }
]

section_index = index 0-based du titre ## dans le document (0 = premier ##, 1 = deuxième ##, etc.)
kind = "photo" (VRAIE photographie : sujets réels, lieux, objets, personnes, ambiance) | "generated" (image générée par IA : couvertures, concepts abstraits, schémas stylisés)
quality = "standard" (schémas, diagrammes) | "high" (illustrations de concepts) | "premium" (couvertures ebook uniquement)

Règles :
- Maximum 5 images par document
- Choisis des sections où une image apporte vraiment de la valeur
- Privilégie "photo" pour tout ce qui est concret/réaliste, "generated" pour l'abstrait et les couvertures
- Pour une photo, la description doit être de bons mots-clés de recherche en anglais (ex : "modern office desk laptop coffee")
- Descriptions en anglais, 15-30 mots (ou mots-clés pour une photo)
- Si aucune image n'est pertinente, retourne []
- Retourne UNIQUEMENT le tableau JSON, rien d'autre`;

export async function planAndGenerateImages(markdown: string, docType: DocType): Promise<string> {
  let plan: ImagePlan[] = [];
  try {
    const plannerMessages: LLMMessage[] = [
      { role: "user", content: `Type de document : ${docType}\n\n${markdown.slice(0, 4000)}` },
    ];
    const plannerResult = await callLLM(plannerMessages, IMAGE_PLANNER_PROMPT);
    const plannerText = plannerResult.content.map((b) => b.text).join("").trim();
    console.log("[IMAGE] Planner raw response:", plannerText.slice(0, 300));
    const jsonMatch = plannerText.match(/\[[\s\S]*\]/);
    if (jsonMatch) plan = JSON.parse(jsonMatch[0]);
    console.log("[IMAGE] Plan parsed:", JSON.stringify(plan));
  } catch (e) {
    console.log("[IMAGE] Planner error:", e);
    return markdown;
  }

  if (!Array.isArray(plan) || plan.length === 0) {
    console.log("[IMAGE] Plan vide ou invalide, pas d'images insérées");
    return markdown;
  }

  console.log(`[IMAGE] Plan reçu: ${plan.length} images proposées`);

  const headings = Array.from(markdown.matchAll(/^(## .+)$/gm)).map((m) => m[1]);
  console.log(
    "[IMAGE] Headings trouvés:",
    headings.length,
    "→",
    headings.slice(0, 5).map((h) => h.slice(0, 40))
  );

  const imagesToGenerate = plan.slice(0, 5);
  console.log(`[IMAGE] Génération de ${imagesToGenerate.length} images (limite: 5)...`);
  const results = await Promise.all(
    imagesToGenerate.map(async (item) => {
      const clampedIndex = Math.min(item.section_index, headings.length - 1);
      const heading = headings[clampedIndex] ?? null;
      console.log(
        `[IMAGE] Génération image pour section_index=${item.section_index}→${clampedIndex} heading="${heading}" quality=${item.quality}`
      );
      if (!heading) return null;
      const quality: ImageQuality = ["standard", "high", "premium"].includes(item.quality)
        ? (item.quality as ImageQuality)
        : "standard";

      let imgData: string | null = null;
      let credit: string | undefined;
      // kind "photo" → vraie photo Unsplash (repli sur génération IA si indisponible)
      if (item.kind === "photo") {
        const photo = await searchUnsplash(item.description, "landscape");
        if (photo) {
          imgData = photo.url;
          credit = photo.credit;
        }
      }
      if (!imgData) imgData = await generateImage(item.description, quality);
      console.log(
        `[IMAGE] Résultat (${credit ? "unsplash" : "ia"}): ${imgData ? "succès (" + imgData.slice(0, 30) + "...)" : "échec"}`
      );
      return imgData ? { heading, imgData, description: item.description, credit } : null;
    })
  );

  let result = markdown;
  for (const item of results) {
    if (!item) continue;
    const caption = item.credit ? `${item.description} — Photo : ${item.credit} / Unsplash` : item.description;
    const figure = `\n\n<figure class="ai-figure"><img src="${item.imgData}" alt="${item.description}" /><figcaption>${caption}</figcaption></figure>\n\n`;
    result = result.replace(item.heading, item.heading + figure);
  }

  return result;
}
