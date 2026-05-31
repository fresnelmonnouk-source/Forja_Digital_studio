// URL canonique du site, pour les métadonnées SEO, le sitemap et robots.
// Priorité : NEXT_PUBLIC_SITE_URL > NEXTAUTH_URL > domaine de production connu.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  "https://myforja.digital"
).replace(/\/$/, "");

export const SITE_NAME = "FORJA — Digital Studio";
export const SITE_TAGLINE = "De l'idée brute au produit qui se vend.";
export const SITE_DESCRIPTION =
  "FORJA transforme ton idée en produit digital prêt à vendre — ebook, formation, page de vente. Discussion gratuite et illimitée, PDF pro dès 3 500 FCFA. Paiement mobile money.";
