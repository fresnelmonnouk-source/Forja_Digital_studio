import { randomInt } from "crypto";

/**
 * Génère un code OTP à 6 chiffres cryptographiquement sûr.
 * `crypto.randomInt` (CSPRNG) plutôt que `Math.random` (prédictible).
 */
export function generateOtp(): string {
  return String(randomInt(100000, 1000000));
}
