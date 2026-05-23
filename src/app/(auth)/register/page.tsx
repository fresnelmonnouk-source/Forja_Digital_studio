"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthShell from "@/components/ui/AuthShell";
import { FV, FVHook } from "@/components/ui/fonderie";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Ton prénom est requis.");
    if (!form.email.trim()) return setError("L'email est requis.");
    if (form.password.length < 8) return setError("Le mot de passe doit contenir au moins 8 caractères.");

    setLoading(true);
    try {
      // 1. Créer le compte
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        setLoading(false);
        return;
      }

      // 2. Stocker le mot de passe temporairement pour auto-login après OTP
      sessionStorage.setItem("forja_reg_pwd", form.password);

      // 3. Rediriger vers la vérification OTP
      router.push(`/verify?email=${encodeURIComponent(form.email)}`);
    } catch {
      setError("Erreur réseau. Réessaie.");
      setLoading(false);
    }
  };

  return (
    <AuthShell
      hero={
        <div>
          <FVHook tag="✦" label="Cahier de l'atelier" />
          <div style={{ marginTop: 20, background: FV.black2, border: `1px solid ${FV.ruleStrong}`, borderRadius: 14, padding: '24px 28px' }}>
            <div style={{ fontFamily: FV.serif, fontSize: 60, color: FV.ember, lineHeight: 0.5, marginBottom: 8 }}>"</div>
            <div style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: 22, lineHeight: 1.4, color: FV.ink, marginTop: 4, maxWidth: 460, letterSpacing: '-0.005em' }}>
              En trois sessions, j'ai eu plus de clarté sur mon offre qu'en six mois de coaching à <span style={{ fontStyle: 'italic', color: FV.ember }}>2 000 €</span>.
            </div>
            <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E8A867', color: FV.black, fontFamily: FV.serif, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>E</div>
              <div>
                <div style={{ fontSize: 13, color: FV.ink, fontWeight: 600 }}>Élise R.</div>
                <div style={{ fontFamily: FV.serif, fontStyle: 'italic', fontSize: 12, color: FV.smoke }}>Consultante marketing — Lyon</div>
              </div>
              <div style={{ marginLeft: 'auto', fontFamily: FV.mono, fontSize: 9, color: FV.amber, letterSpacing: '0.12em' }}>★★★★★</div>
            </div>
          </div>
          <div style={{ fontFamily: FV.mono, fontSize: 10, color: FV.smokeDim, letterSpacing: '0.15em', marginTop: 16 }}>
            1 247 CRÉATEURS · 8 392 SESSIONS · 4.9 / 5
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ fontFamily: FV.mono, fontSize: 10, color: FV.ember, letterSpacing: '0.2em', marginBottom: 14 }}>— CRÉER UN COMPTE</div>
        <h2 style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: 48, color: FV.ink, margin: 0, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
          Allumer le<br /><span style={{ fontStyle: 'italic', color: FV.ember }}>fourneau</span>.
        </h2>
        <p style={{ fontSize: 14, color: FV.ink2, marginTop: 16, marginBottom: 28 }}>
          Compte gratuit. Aucune carte. Ton premier produit en 60 secondes.
        </p>

        {/* Error banner */}
        {error && (
          <div style={{ background: 'rgba(238,90,36,0.1)', border: '1px solid rgba(238,90,36,0.35)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: FV.ember, display: 'flex', gap: 8 }}>
            <span>⚠</span> {error}
          </div>
        )}

        {/* Fields */}
        {[
          { key: 'name', label: 'Prénom', type: 'text', placeholder: 'Ton prénom', autoComplete: 'name' },
          { key: 'email', label: 'Email', type: 'email', placeholder: 'toi@exemple.fr', autoComplete: 'email' },
          { key: 'password', label: 'Mot de passe', type: 'password', placeholder: '8 caractères minimum', autoComplete: 'new-password' },
        ].map(({ key, label, type, placeholder, autoComplete }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: '0.18em', marginBottom: 6, textTransform: 'uppercase' }}>{label}</div>
            <input
              type={type}
              autoComplete={autoComplete}
              placeholder={placeholder}
              value={form[key as keyof typeof form]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              disabled={loading}
              style={{ width: '100%', background: FV.black2, border: `1px solid ${FV.ruleStrong}`, borderRadius: 8, padding: '12px 14px', fontFamily: FV.sans, fontSize: 14, color: FV.ink, outline: 'none', boxSizing: 'border-box', opacity: loading ? 0.6 : 1 }}
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', background: loading ? FV.smokeDim : FV.ember, color: loading ? FV.smoke : FV.black, border: 'none', padding: '14px', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 18, borderRadius: 8, boxShadow: loading ? 'none' : `0 0 24px ${FV.ember}66`, textTransform: 'uppercase', transition: 'all 0.2s' }}
        >
          {loading ? "Allumage en cours…" : "Allumer le four →"}
        </button>

        <div style={{ marginTop: 28, fontSize: 12, color: FV.smoke }}>
          Déjà un compte ? <Link href="/login" style={{ color: FV.ember, fontWeight: 600, textDecoration: 'none' }}>Se connecter →</Link>
        </div>
      </form>
    </AuthShell>
  );
}
