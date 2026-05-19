"use client";
import { useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/ui/AuthShell";
import { FV, FVHook } from "@/components/ui/fonderie";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Saisis une adresse email valide.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      hero={
        <div>
          <FVHook tag="✦" label="Rallumage du fourneau" />
          <div style={{ marginTop: 20, fontFamily: FV.serif, fontWeight: 500, fontSize: 32, color: FV.ink, lineHeight: 1.2, letterSpacing: '-0.015em', maxWidth: 420 }}>
            Le feu s'est <span style={{ fontStyle: 'italic', color: FV.ember }}>éteint</span> ?<br />
            On le rallume en deux clics.
          </div>
        </div>
      }
    >
      <div style={{ fontFamily: FV.mono, fontSize: 10, color: FV.ember, letterSpacing: '0.2em', marginBottom: 14 }}>— MOT DE PASSE OUBLIÉ</div>
      <h2 style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: 44, color: FV.ink, margin: 0, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
        Rallumer le <span style={{ fontStyle: 'italic', color: FV.ember }}>feu</span>.
      </h2>

      {submitted ? (
        <div style={{ marginTop: 32 }}>
          <div style={{ padding: '20px 16px', background: 'rgba(238,90,36,0.06)', border: `1px solid rgba(238,90,36,0.25)`, borderRadius: 10, fontSize: 14, color: FV.ink2, lineHeight: 1.6 }}>
            <div style={{ fontFamily: FV.serif, fontWeight: 600, fontSize: 16, color: FV.ember, marginBottom: 8 }}>Lien envoyé ✦</div>
            Si un compte existe pour <strong style={{ color: FV.ink }}>{email}</strong>, tu recevras un lien de réinitialisation sous peu. Vérifie ton dossier spam.
          </div>
          <Link href="/login" style={{ display: 'block', marginTop: 24, fontSize: 12, color: FV.smoke, textDecoration: 'none' }}>← Retour à la connexion</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <p style={{ fontSize: 14, color: FV.ink2, marginTop: 16, marginBottom: 32, lineHeight: 1.6 }}>
            Donne-nous ton email — on t'envoie un lien sécurisé pour graver un nouveau mot de passe.
          </p>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: '0.18em', marginBottom: 6, textTransform: 'uppercase' }}>Email</div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ton@email.com"
              autoComplete="email"
              style={{ width: '100%', boxSizing: 'border-box', background: FV.black2, border: `1px solid ${error ? 'rgba(238,90,36,0.6)' : FV.ruleStrong}`, borderRadius: 8, padding: '12px 14px', fontFamily: FV.sans, fontSize: 14, color: FV.ink, outline: 'none' }}
            />
            {error && <div style={{ marginTop: 6, fontSize: 12, color: FV.ember }}>{error}</div>}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: loading ? FV.ruleStrong : FV.ember, color: loading ? FV.smoke : FV.black, border: 'none', padding: '14px', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 18, borderRadius: 8, boxShadow: loading ? 'none' : `0 0 24px ${FV.ember}66`, textTransform: 'uppercase' }}
          >
            {loading ? "Rallumage du fourneau..." : "Envoyer le lien de réinitialisation →"}
          </button>

          <div style={{ marginTop: 24, padding: '14px 16px', background: 'rgba(243,156,44,0.06)', border: `1px solid rgba(243,156,44,0.18)`, borderRadius: 8, fontSize: 12, color: FV.amberPale, lineHeight: 1.6, display: 'flex', gap: 12 }}>
            <span style={{ color: FV.amber, fontFamily: FV.serif, fontStyle: 'italic', fontSize: 18, lineHeight: 1, flexShrink: 0 }}>✦</span>
            <span>Lien valable 60 minutes. Pas reçu ? Vérifie le dossier <em style={{ color: FV.amber }}>spam</em> — ou réessaie dans 5 min.</span>
          </div>

          <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: FV.smoke }}>
            <Link href="/login" style={{ cursor: 'pointer', color: FV.smoke, textDecoration: 'none' }}>← Retour à la connexion</Link>
            <Link href="/register" style={{ color: FV.ember, fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>Créer un compte →</Link>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
