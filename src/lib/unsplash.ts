// Recherche de photos réelles sur Unsplash (banque d'images).
// Utilisé quand FORJA veut une VRAIE photo plutôt qu'une image générée par IA.
// Nécessite UNSPLASH_ACCESS_KEY (clé gratuite : unsplash.com/developers).
// Sans clé → renvoie null → l'appelant retombe sur la génération IA.

export interface UnsplashPhoto {
  url: string;
  credit: string;      // nom du photographe (attribution requise par les CGU Unsplash)
  creditUrl: string;   // lien vers la photo / le profil
}

export async function searchUnsplash(
  query: string,
  orientation: "landscape" | "portrait" | "squarish" = "landscape"
): Promise<UnsplashPhoto | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;

  try {
    const url =
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query.slice(0, 100))}` +
      `&per_page=1&orientation=${orientation}&content_filter=high`;
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.log(`[UNSPLASH] erreur ${res.status} pour "${query.slice(0, 40)}"`);
      return null;
    }
    const data = await res.json();
    const photo = data?.results?.[0];
    if (!photo?.urls) return null;
    return {
      url: photo.urls.regular ?? photo.urls.full ?? photo.urls.small,
      credit: photo.user?.name ?? "Unsplash",
      creditUrl: photo.links?.html ?? "https://unsplash.com",
    };
  } catch (e) {
    console.log("[UNSPLASH] exception:", e);
    return null;
  }
}
