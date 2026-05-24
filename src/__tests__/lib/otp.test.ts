import { generateOtp } from "@/lib/otp";

describe("generateOtp", () => {
  it("génère exactement 6 chiffres", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateOtp()).toMatch(/^\d{6}$/);
    }
  });

  it("reste dans l'intervalle 100000–999999 (pas de zéros en tête tronqués)", () => {
    for (let i = 0; i < 50; i++) {
      const n = Number(generateOtp());
      expect(n).toBeGreaterThanOrEqual(100000);
      expect(n).toBeLessThanOrEqual(999999);
    }
  });

  it("produit des valeurs variées (non constantes)", () => {
    const set = new Set(Array.from({ length: 20 }, () => generateOtp()));
    expect(set.size).toBeGreaterThan(1);
  });
});
