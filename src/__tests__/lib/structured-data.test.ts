import {
  organizationSchema, websiteSchema, softwareAppSchema, faqSchema, FAQ_ITEMS,
} from "@/lib/seo/structured-data";
import { PACKS } from "@/lib/plans";

describe("structured-data (JSON-LD)", () => {
  it("Organization et WebSite ont le bon @type et une URL absolue", () => {
    const org = organizationSchema();
    expect(org["@type"]).toBe("Organization");
    expect(String(org.url)).toMatch(/^https?:\/\//);
    expect(websiteSchema()["@type"]).toBe("WebSite");
  });

  it("SoftwareApplication expose une offre par pack en XOF", () => {
    const app = softwareAppSchema();
    const offers = app.offers as Array<Record<string, string>>;
    expect(offers).toHaveLength(PACKS.length);
    for (const o of offers) {
      expect(o["@type"]).toBe("Offer");
      expect(o.priceCurrency).toBe("XOF");
      expect(Number(o.price)).toBeGreaterThan(0);
    }
  });

  it("FAQPage reflète exactement FAQ_ITEMS", () => {
    const faq = faqSchema();
    const entities = faq.mainEntity as Array<Record<string, unknown>>;
    expect(entities).toHaveLength(FAQ_ITEMS.length);
    entities.forEach((q, i) => {
      expect(q["@type"]).toBe("Question");
      expect(q.name).toBe(FAQ_ITEMS[i].question);
      expect((q.acceptedAnswer as Record<string, string>).text).toBe(FAQ_ITEMS[i].answer);
    });
  });

  it("aucune réponse FAQ ne mentionne '30 ans' (interdit côté site)", () => {
    for (const item of FAQ_ITEMS) {
      expect(item.answer).not.toMatch(/30 ans/i);
    }
  });
});
