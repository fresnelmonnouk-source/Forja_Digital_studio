// src/lib/analytics.ts
// Helper unifié pour PostHog + Microsoft Clarity, en mode opt-in strict.
//
// Défensif : sans consentement ET sans clés d'env, NE FAIT RIEN.
//   - Aucun crash, aucune requête réseau avant clic "Accepter".
//   - Tous les events sont typés (voir AnalyticsEvent) pour éviter les fautes.
//
// Variables d'env attendues (toutes optionnelles → no-op gracieux si absentes) :
//   NEXT_PUBLIC_POSTHOG_KEY          (clé projet PostHog, ex. "phc_xxx")
//   NEXT_PUBLIC_POSTHOG_HOST         (défaut : https://eu.i.posthog.com — EU Cloud)
//   NEXT_PUBLIC_CLARITY_PROJECT_ID   (ID projet Microsoft Clarity)
//
// Le bandeau de consentement (ConsentBanner.tsx) écrit "granted" | "denied"
// dans localStorage ; le provider (Analytics.tsx) lit cet état pour décider
// d'initialiser ou non les SDK. Aucun init avant consentement.
"use client";

const STORAGE_KEY = "forja_analytics_consent"; // "granted" | "denied" | absent

export type ConsentState = "granted" | "denied" | "unknown";

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return "unknown";
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : "unknown";
  } catch {
    return "unknown";
  }
}

export function setConsent(state: "granted" | "denied"): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, state);
    // Notifier le provider en temps réel (init ou opt-out runtime).
    window.dispatchEvent(new CustomEvent("forja-consent-change", { detail: state }));
  } catch {
    // localStorage indisponible (mode privé strict, etc.) → silencieux.
  }
}

// Liste exhaustive des events AARRR — typée pour éviter toute faute de frappe.
// Acquisition → Activation → Revenu → Rétention (cf. plan Sofia, session 10).
export type AnalyticsEvent =
  | "landing_viewed"          // Acquisition
  | "pricing_viewed"          // Revenu (intent)
  | "pack_selected"           // Revenu (intent)
  | "signup_completed"        // Activation (proxy: arrivée onboarding)
  | "onboarding_completed"    // Activation
  | "first_doc_generated"     // Activation
  | "pdf_export_clicked"      // Activation
  | "pdf_export_success"      // Activation / Revenu
  | "payment_initiated"       // Revenu
  | "payment_success"         // Revenu
  | "credits_low"             // Rétention
  | "repurchase";             // Rétention

export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

interface PostHogLike {
  capture?: (event: string, props?: AnalyticsProps) => void;
  identify?: (userId: string, traits?: AnalyticsProps) => void;
  reset?: () => void;
  opt_out_capturing?: () => void;
  opt_in_capturing?: () => void;
}

function getPostHog(): PostHogLike | null {
  if (typeof window === "undefined") return null;
  const ph = (window as unknown as { posthog?: PostHogLike }).posthog;
  return ph ?? null;
}

/** Capture un event analytique. No-op tant que le consentement n'est pas "granted". */
export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  if (getConsent() !== "granted") return;
  const ph = getPostHog();
  if (ph?.capture) ph.capture(event, props);
}

/** Associe l'utilisateur connecté à ses events futurs. Respecte le consentement. */
export function identify(userId: string, traits?: AnalyticsProps): void {
  if (getConsent() !== "granted") return;
  const ph = getPostHog();
  if (ph?.identify) ph.identify(userId, traits);
}

/** À appeler à la déconnexion pour repartir d'une identité vierge. */
export function reset(): void {
  const ph = getPostHog();
  if (ph?.reset) ph.reset();
}
