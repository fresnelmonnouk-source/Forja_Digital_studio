import { isLegalSlug, legalMeta, defaultLegalContent, LEGAL_PAGES } from "@/lib/legal";

describe("legal", () => {
  it("reconnaît les slugs valides", () => {
    expect(isLegalSlug("mentions")).toBe(true);
    expect(isLegalSlug("cgu")).toBe(true);
    expect(isLegalSlug("confidentialite")).toBe(true);
    expect(isLegalSlug("remboursement")).toBe(true);
  });

  it("rejette les slugs inconnus", () => {
    expect(isLegalSlug("inconnu")).toBe(false);
    expect(isLegalSlug("")).toBe(false);
    expect(isLegalSlug("../etc")).toBe(false);
  });

  it("fournit un contenu par défaut non vide pour chaque page", () => {
    for (const p of LEGAL_PAGES) {
      const content = defaultLegalContent(p.slug);
      expect(content.length).toBeGreaterThan(50);
    }
  });

  it("renvoie les métadonnées attendues", () => {
    expect(legalMeta("mentions")?.title).toMatch(/Mentions/);
    expect(legalMeta("inconnu")).toBeUndefined();
  });

  it("ne mentionne jamais '30 ans' dans le contenu par défaut (interdit côté site)", () => {
    for (const p of LEGAL_PAGES) {
      expect(defaultLegalContent(p.slug)).not.toMatch(/30 ans/i);
    }
  });
});
