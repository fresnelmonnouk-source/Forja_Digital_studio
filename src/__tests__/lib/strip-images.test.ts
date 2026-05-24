import { stripImageData } from "@/lib/strip-images";

describe("stripImageData (allègement historique / coût LLM)", () => {
  it("remplace une image markdown en data: URI par un placeholder", () => {
    const md = "Voici :\n\n![image](data:image/png;base64,AAAABBBBCCCC)\n\nfin";
    const out = stripImageData(md);
    expect(out).not.toContain("base64");
    expect(out).toContain("[image générée]");
    expect(out).toContain("fin");
  });

  it("conserve les images http(s) (Unsplash) — non base64", () => {
    const md = "![photo](https://images.unsplash.com/photo-123.jpg)";
    expect(stripImageData(md)).toBe(md);
  });

  it("remplace une data: URI isolée (hors markdown)", () => {
    const out = stripImageData("avant data:image/jpeg;base64,ZZZZ après");
    expect(out).not.toContain("base64");
    expect(out).toContain("[image]");
  });

  it("laisse le texte normal intact", () => {
    const txt = "Un message **normal** sans image.";
    expect(stripImageData(txt)).toBe(txt);
  });
});
