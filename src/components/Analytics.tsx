// src/components/Analytics.tsx
// Provider client : initialise PostHog + Microsoft Clarity UNIQUEMENT après
// consentement explicite. Aucun SDK n'est chargé sinon (pas de cookie, pas de requête).
//
// Défensif : si une clé d'env manque, on saute silencieusement ce SDK.
// Branché une seule fois dans src/app/layout.tsx.
"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { getConsent } from "@/lib/analytics";

const PH_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const PH_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

// Garde-fous d'idempotence : on n'init chaque SDK qu'une seule fois.
let posthogInited = false;
let clarityInited = false;

function initPostHog(): void {
  if (posthogInited || !PH_KEY) return;
  if (typeof window === "undefined") return;
  posthog.init(PH_KEY, {
    api_host: PH_HOST,
    persistence: "localStorage", // cookies analytiques minimisés
    capture_pageview: true,
    autocapture: false,           // on capture explicitement via track()
    disable_session_recording: true, // Clarity gère le replay
  });
  // Exposer pour le helper lib/analytics.ts (qui lit window.posthog).
  (window as unknown as { posthog: typeof posthog }).posthog = posthog;
  posthogInited = true;
}

function initClarity(): void {
  if (clarityInited || !CLARITY_ID) return;
  if (typeof window === "undefined" || typeof document === "undefined") return;
  // Snippet officiel Microsoft Clarity, adapté en TS.
  type ClarityWindow = Window & { clarity?: { q?: unknown[][] } & ((...args: unknown[]) => void) };
  const w = window as ClarityWindow;
  if (!w.clarity) {
    const stub = function (this: unknown, ...args: unknown[]) {
      (stub.q = stub.q || []).push(args);
    } as { (...args: unknown[]): void; q?: unknown[][] };
    w.clarity = stub;
  }
  const tag = document.createElement("script");
  tag.async = true;
  tag.src = "https://www.clarity.ms/tag/" + CLARITY_ID;
  const first = document.getElementsByTagName("script")[0];
  first?.parentNode?.insertBefore(tag, first);
  clarityInited = true;
}

function applyConsent(): void {
  if (getConsent() === "granted") {
    initPostHog();
    initClarity();
    // Au cas où PostHog ait été opt-out auparavant (changement d'avis).
    try { posthog.opt_in_capturing(); } catch { /* not init yet */ }
  } else if (getConsent() === "denied" && posthogInited) {
    // L'utilisateur retire son consentement → on coupe la capture sans recharger.
    try { posthog.opt_out_capturing(); } catch { /* noop */ }
  }
}

export default function Analytics() {
  useEffect(() => {
    applyConsent();
    const onChange = () => applyConsent();
    window.addEventListener("forja-consent-change", onChange);
    return () => window.removeEventListener("forja-consent-change", onChange);
  }, []);
  return null;
}
