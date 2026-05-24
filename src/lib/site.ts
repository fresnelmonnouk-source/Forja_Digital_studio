// URL canonique du site, pour les métadonnées SEO, le sitemap et robots.
// Priorité : NEXT_PUBLIC_SITE_URL > NEXTAUTH_URL > domaine de production connu.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  "https://myforja.digital"
).replace(/\/$/, "");

export const SITE_NAME = "FORJA — Digital Studio";
export const SITE_TAGLINE = "L'agent qui transforme l'idée brute en produit qui se vend.";
export const SITE_DESCRIPTION =
  "FORJA est l'agent IA qui vous guide pas à pas pour créer des produits digitaux prêts à vendre — ebooks, guides, kits — et génère des PDF professionnels en quelques minutes.";
