import { effectiveCredits } from "@/lib/quota";
import { CREDIT_VALIDITY_DAYS, creditExpiryDate } from "@/lib/plans";

describe("credits expiry", () => {
  const now = new Date("2026-05-24T12:00:00Z");

  it("creditExpiryDate ajoute CREDIT_VALIDITY_DAYS jours", () => {
    const exp = creditExpiryDate(now);
    const days = (exp.getTime() - now.getTime()) / (24 * 3600_000);
    expect(days).toBe(CREDIT_VALIDITY_DAYS);
  });

  it("crédits valides tant que la date d'expiration est dans le futur", () => {
    const future = new Date(now.getTime() + 5 * 24 * 3600_000);
    expect(effectiveCredits(30, future, now)).toBe(30);
  });

  it("crédits = 0 quand la date d'expiration est passée", () => {
    const past = new Date(now.getTime() - 1000);
    expect(effectiveCredits(30, past, now)).toBe(0);
  });

  it("crédits = 0 si le solde brut est nul, quelle que soit l'expiration", () => {
    expect(effectiveCredits(0, null, now)).toBe(0);
    expect(effectiveCredits(0, creditExpiryDate(now), now)).toBe(0);
  });

  it("sans date d'expiration, les crédits restent valides (rétrocompat)", () => {
    expect(effectiveCredits(12, null, now)).toBe(12);
  });

  it("expiration pile à l'instant présent → considérés expirés", () => {
    expect(effectiveCredits(5, new Date(now.getTime()), now)).toBe(0);
  });
});
