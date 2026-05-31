// Quota quotidien de messages chat — anti-abus / contrôle du coût LLM.
//
// Trois couches complémentaires (cf. /api/chat/route.ts) :
//   1. Rate-limit utilisateur (déjà via @upstash/ratelimit dans lib/rate-limit.ts) :
//      ex. 30 messages / heure → anti-burst.
//   2. Quota quotidien (ce fichier) : compteur Redis incrémental avec TTL 24h.
//      - Non-payeurs (jamais d'achat approuvé) : DAILY_LIMIT_FREE messages/jour.
//      - Payeurs (au moins 1 Payment approved) : DAILY_LIMIT_CUSTOMER messages/jour.
//   3. Cap par conversation (côté route) : si messages.length > CONVERSATION_CAP
//      → l'utilisateur doit clôturer ou ouvrir une nouvelle session.
//
// Défensif : si Upstash Redis n'est pas configuré, on laisse passer (failsafe)
// pour ne pas casser le chat. Le rate-limit IP basique reste actif quoi qu'il arrive.
import { Redis } from "@upstash/redis";

// Seuils — ajustables si abus constatés via PostHog event "chat_quota_exceeded".
export const DAILY_LIMIT_FREE = 50;       // messages/jour pour un utilisateur jamais payant
export const DAILY_LIMIT_CUSTOMER = 300;  // messages/jour pour un utilisateur avec pack acheté
export const PER_HOUR_LIMIT = 30;         // messages/heure (toutes catégories) — anti-burst
export const CONVERSATION_CAP = 80;       // messages max dans une même conversation

let redis: Redis | null = null;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || url.includes("...")) return null;
  if (!redis) redis = new Redis({ url, token });
  return redis;
}

/** Clé Redis du compteur quotidien (réinitialisé à 00:00 UTC via TTL 24h glissant). */
function dailyKey(userId: string): string {
  // YYYY-MM-DD — partition par jour UTC pour avoir un reset cohérent
  const today = new Date().toISOString().slice(0, 10);
  return `chat-daily:${userId}:${today}`;
}

export interface QuotaCheckResult {
  /** true = autorisé à envoyer ce message, false = bloqué (quota dépassé). */
  allowed: boolean;
  /** Compteur actuel après incrément (utile pour debug/UI). */
  count: number;
  /** Plafond applicable (DAILY_LIMIT_FREE ou DAILY_LIMIT_CUSTOMER). */
  limit: number;
  /** Combien de messages il reste avant blocage. Négatif si déjà dépassé. */
  remaining: number;
}

/**
 * Incrémente le compteur quotidien et indique si l'utilisateur peut envoyer
 * son message. Atomique côté Redis (INCR + EXPIRE).
 *
 * Failsafe : si Redis n'est pas joignable, on autorise (preserve l'UX), on log.
 */
export async function checkAndIncrementDailyChat(
  userId: string,
  isCustomer: boolean
): Promise<QuotaCheckResult> {
  const limit = isCustomer ? DAILY_LIMIT_CUSTOMER : DAILY_LIMIT_FREE;
  const r = getRedis();
  if (!r) {
    return { allowed: true, count: 0, limit, remaining: limit };
  }
  try {
    const key = dailyKey(userId);
    const count = await r.incr(key);
    // Sur la PREMIÈRE incrémentation du jour, on pose un TTL 24h (sliding).
    if (count === 1) {
      await r.expire(key, 86400);
    }
    const allowed = count <= limit;
    return { allowed, count, limit, remaining: limit - count };
  } catch (error) {
    console.error("[chat-quota] Erreur Redis (failsafe : on autorise) :", error);
    return { allowed: true, count: 0, limit, remaining: limit };
  }
}

/** Helper pur (testable sans I/O) : message d'erreur adapté au profil. */
export function buildQuotaExceededMessage(isCustomer: boolean, limit: number): string {
  if (isCustomer) {
    return `Tu as atteint la limite quotidienne (${limit} messages). Reviens demain — ou écris-nous à aide@myforja.digital si c'est bloquant.`;
  }
  return `Tu as atteint la limite quotidienne de ${limit} messages gratuits. Prends un pack (à partir de 3 500 FCFA) pour discuter sans limite et exporter ton produit en PDF.`;
}
