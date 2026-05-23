export const ALLOWED_TYPES = ["ebook", "formation", "vente", "blueprint"] as const;
export type DocType = (typeof ALLOWED_TYPES)[number];

export type ImageQuality = "standard" | "high" | "premium";

export interface ImagePlan {
  section_index: number;
  quality: ImageQuality;
  description: string;
  kind?: "photo" | "generated"; // photo = vraie photo Unsplash ; generated = image IA
}
