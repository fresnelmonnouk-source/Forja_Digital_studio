"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "@/components/ui/AuthShell";
import { FV, FVHook } from "@/components/ui/fonderie";

function getStrength(pwd: string): number {
  let score = 0;
  if (pwd.length >= 10) score++;
  if (/\d/.test(pwd)) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

const STRENGTH_LABELS = ["", "Faible", "Moyen", "Fort", "Excellent"];
const STRENGTH_COLORS = ["", FV.ember, FV.amber, FV.amber, "#7EC8A0"];

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = getStrength(password);

  const checks = [
    { label: "10 caractères minimum", ok: password.length >= 10 },
    { label: "Au moins un chiffre", ok: /\d/.test(password) },
    { label: "Au moins une majuscule", ok: /[A-Z]/.test(password) },
    { label: "Un caractère spécial (recommandé)", ok: /[^A-Za-z0-9]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Token de réinitialisation manquant dans l'adresse URL.");
      return;
    }

    if (password.length < 10) {
      setError("Le mot de passe doit contenir au moins 10 caractères.");
      return;
    }
    if (!/\d/.test(password)) {
      setError("Le mot de passe doit contenir au moins un chiffre.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Le mot de passe doit contenir au moins une majuscule.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
      } else {
        setSubmitted(true);
        setTimeout(() => router.push("/login"), 2000);
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
          <FVHook tag="✦" label="Nouveau sceau" />
          <div style={{ marginTop: 20, fontFamily: FV.serif, fontWeight: 500, fontSize: 32, color: FV.ink, lineHeight: 1.2, letterSpacing: '-0.015em', maxWidth: 420 }}>
            Grave un mot de passe<br />
            <span style={{ fontStyle: 'italic', color: FV.ember }}>tenu</span> dans le métal.
          </div>
        </div>
      }
    >
      <div style={{ fontFamily: FV.mono, fontSize: 10, color: FV.ember, letterSpacing: '0.2em', marginBottom: 14 }}>— NOUVEAU MOT DE PASSE</div>
      <h2 style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: 44, color: FV.ink, margin: 0, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
        Graver un<br />nouveau <span style={{ fontStyle: 'italic', color: FV.ember }}>sceau</span>.
      </h2>

      {submitted ? (
        <div style={{ marginTop: 32, padding: '20px 16px', background: 'rgba(126,200,160,0.06)', border: `1px solid rgba(126,200,160,0.25)`, borderRadius: 10, fontSize: 14, color: FV.ink2, lineHeight: 1.6 }}>
          <div style={{ fontFamily: FV.serif, fontWeight: 600, fontSize: 16, color: '#7EC8A0', marginBottom: 8 }}>Sceau gravé ✦</div>
          Ton mot de passe a été mis à jour. Redirection vers la connexion…
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <p style={{ fontSize: 14, color: FV.ink2, marginTop: 16, marginBottom: 28, lineHeight: 1.6 }}>
            Au moins 10 caractères. Plus c'est long, plus c'est solide.
          </p>

          {!token && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(238,90,36,0.08)', border: `1px solid rgba(238,90,36,0.3)`, borderRadius: 8, fontSize: 12, color: FV.ember }}>
              Attention : Aucun jeton (token) de réinitialisation n'a été détecté dans l'URL. Veuillez utiliser le lien reçu par e-mail.
            </div>
          )}

          {/* Password field */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: '0.18em', marginBottom: 6, textTransform: 'uppercase' }}>Nouveau mot de passe</div>
            <div style={{ background: FV.black2, border: `1px solid ${FV.ruleStrong}`, borderRadius: 8, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={!token || loading}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: FV.sans, fontSize: 14, color: FV.ink }}
              />
              <button type="button" onClick={() => setShowPwd(v => !v)} style={{ background: 'transparent', border: 'none', color: FV.smoke, cursor: 'pointer', fontFamily: FV.mono, fontSize: 10, flexShrink: 0 }}>
                {showPwd ? "CACHER" : "VOIR"}
              </button>
            </div>
          </div>

          {/* Confirm field */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: '0.18em', marginBottom: 6, textTransform: 'uppercase' }}>Confirmer</div>
            <input
              type={showPwd ? "text" : "password"}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password"
              disabled={!token || loading}
              style={{ width: '100%', boxSizing: 'border-box', background: FV.black2, border: `1px solid ${confirm && confirm !== password ? 'rgba(238,90,36,0.6)' : FV.ruleStrong}`, borderRadius: 8, padding: '12px 14px', fontFamily: FV.sans, fontSize: 14, color: FV.ink, outline: 'none' }}
            />
          </div>

          {/* Strength meter */}
          {password.length > 0 && (
            <div style={{ marginTop: 8, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: '0.15em' }}>SOLIDITÉ</span>
                <span style={{ fontFamily: FV.serif, fontStyle: 'italic', fontSize: 11, color: STRENGTH_COLORS[strength] }}>{STRENGTH_LABELS[strength]}</span>
              </div>
              <div style={{ display: 'flex', gap: 4, height: 4 }}>
                {[1, 2, 3, 4].map(level => (
                  <div key={level} style={{ flex: 1, background: strength >= level ? STRENGTH_COLORS[strength] : 'rgba(241,233,218,0.06)', borderRadius: 2, boxShadow: strength >= level ? `0 0 6px ${STRENGTH_COLORS[strength]}` : 'none', transition: 'all 0.3s' }} />
                ))}
              </div>
            </div>
          )}

          {/* Checklist */}
          <ul style={{ margin: '0 0 16px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
            {checks.map(({ label, ok }, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: ok ? FV.amber : FV.smoke }}>
                <span style={{ fontFamily: FV.mono, fontSize: 11 }}>{ok ? '✓' : '○'}</span>
                {label}
              </li>
            ))}
          </ul>

          {error && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(238,90,36,0.08)', border: `1px solid rgba(238,90,36,0.3)`, borderRadius: 8, fontSize: 12, color: FV.ember }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!token || loading}
            style={{ width: '100%', background: (!token || loading) ? FV.ruleStrong : FV.ember, color: (!token || loading) ? FV.smoke : FV.black, border: 'none', padding: '14px', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', cursor: (!token || loading) ? 'not-allowed' : 'pointer', marginTop: 8, borderRadius: 8, boxShadow: (!token || loading) ? 'none' : `0 0 24px ${FV.ember}66`, textTransform: 'uppercase' }}
          >
            {loading ? "Gravure en cours..." : "Sceller le nouveau mot de passe →"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: FV.black, color: FV.ink, fontFamily: FV.mono, fontSize: 12 }}>
        CHARGEMENT DU SCEAU...
      </div>
    }>
      <ResetForm />
    </Suspense>
  );
}
