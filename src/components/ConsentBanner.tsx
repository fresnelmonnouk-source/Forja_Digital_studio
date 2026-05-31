// src/components/ConsentBanner.tsx
// Bandeau de consentement (cookies / mesure d'audience).
//
// Affiché UNIQUEMENT si l'utilisateur n'a pas encore choisi (consent === "unknown").
// Deux boutons d'égale importance (exigence Helena : refuser aussi simple qu'accepter).
// Choix persisté en localStorage par setConsent() ; le provider Analytics.tsx réagit
// au CustomEvent "forja-consent-change" pour initialiser ou couper les SDK.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getConsent, setConsent } from "@/lib/analytics";

// Palette FORJA inlinée (le bandeau doit pouvoir s'afficher dans n'importe quel layout
// sans dépendre d'une route — donc pas d'import du module fonderie qui tire d'autres deps).
const C = {
  black2: "#15110D",
  ink:    "#F1E9DA",
  ink2:   "#C8BDA8",
  ember:  "#EE5A24",
  rule:   "rgba(241,233,218,0.16)",
};

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // SSR-safe : on n'évalue le consent qu'après hydratation.
    setVisible(getConsent() === "unknown");
    const onChange = () => setVisible(getConsent() === "unknown");
    window.addEventListener("forja-consent-change", onChange);
    return () => window.removeEventListener("forja-consent-change", onChange);
  }, []);

  if (!visible) return null;

  const accept = () => { setConsent("granted"); setVisible(false); };
  const refuse = () => { setConsent("denied"); setVisible(false); };

  return (
    <div
      role="dialog"
      aria-label="Consentement aux cookies analytiques"
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 10000,
        maxWidth: 680,
        margin: "0 auto",
        background: C.black2,
        border: `1px solid ${C.rule}`,
        borderRadius: 14,
        padding: "20px 22px",
        boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
        color: C.ink,
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 17, fontWeight: 500, marginBottom: 8 }}>
        Cookies & mesure d&apos;audience
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.55, color: C.ink2, margin: "0 0 16px" }}>
        Pour comprendre comment FORJA est utilisé et l&apos;améliorer, on aimerait activer deux outils
        de mesure d&apos;audience (PostHog &amp; Microsoft Clarity, hébergés en UE). <strong style={{ color: C.ink }}>Rien n&apos;est envoyé tant que tu n&apos;as pas accepté.</strong> Ton choix reste sur ton appareil — tu peux changer d&apos;avis à tout moment.{" "}
        <Link href="/legal/confidentialite" style={{ color: C.ember, textDecoration: "underline" }}>
          En savoir plus
        </Link>
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={accept}
          style={{
            background: C.ember,
            color: "#0B0908",
            border: "none",
            padding: "12px 22px",
            borderRadius: 9,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.02em",
            cursor: "pointer",
            minHeight: 44, // cible tactile mobile
          }}
        >
          Accepter
        </button>
        <button
          type="button"
          onClick={refuse}
          style={{
            background: "transparent",
            color: C.ink,
            border: `1px solid ${C.rule}`,
            padding: "12px 22px",
            borderRadius: 9,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            minHeight: 44,
          }}
        >
          Refuser
        </button>
      </div>
    </div>
  );
}
