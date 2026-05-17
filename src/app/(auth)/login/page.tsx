"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthShell from "@/components/ui/AuthShell";
import { FV, FVHook } from "@/components/ui/fonderie";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim()) return setError("L'email est requis.");
    if (!form.password) return setError("Le mot de passe est requis.");

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect. Vérifie et réessaie.");
        setLoading(false);
        return;
      }

      // Connexion réussie → journal de forge
      router.push("/chat");
      router.refresh();
    } catch {
      setError("Erreur réseau. Réessaie.");
      setLoading(false);
    }
  };

  return (
    <AuthShell
      hero={
        <div>
          <FVHook tag="✦" label="Bon retour à la forge" />
          <div style={{ marginTop: 20, fontFamily: FV.serif, fontWeight: 500, fontSize: 32, color: FV.ink, lineHeight: 1.2, letterSpacing: '-0.015em', maxWidth: 420 }}>
            Le four est resté <span style={{ fontStyle: 'italic', color: FV.ember }}>chaud</span>.<br />
            On reprend où on s'est arrêté.
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ fontFamily: FV.mono, fontSize: 10, color: FV.ember, letterSpacing: '0.2em', marginBottom: 14 }}>— CONNEXION</div>
        <h2 style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: 48, color: FV.ink, margin: 0, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
          Reprends ta <span style={{ fontStyle: 'italic', color: FV.ember }}>session</span>.
        </h2>
        <p style={{ fontSize: 14, color: FV.ink2, marginTop: 16, marginBottom: 28 }}>
          Ton journal de forge t'attend.
        </p>

        {/* Error banner */}
        {error && (
          <div style={{ background: 'rgba(238,90,36,0.1)', border: '1px solid rgba(238,90,36,0.35)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: FV.ember, display: 'flex', gap: 8 }}>
            <span>⚠</span> {error}
          </div>
        )}

        {/* Fields */}
        {[
          { key: 'email', label: 'Email', type: 'email', placeholder: 'toi@exemple.fr', autoComplete: 'email', extra: null },
          { key: 'password', label: 'Mot de passe', type: 'password', placeholder: '••••••••', autoComplete: 'current-password', extra: <Link href="/forgot" style={{ fontFamily: FV.serif, fontStyle: 'italic', fontSize: 11, color: FV.ember, textDecoration: 'none' }}>Oublié ?</Link> },
        ].map(({ key, label, type, placeholder, autoComplete, extra }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{label}</div>
              {extra}
            </div>
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

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 4, fontSize: 12, color: FV.ink2, cursor: 'pointer' }}>
          <span style={{ width: 16, height: 16, border: `1px solid ${FV.ruleStrong}`, borderRadius: 4, background: FV.ember, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: FV.black, fontSize: 10, fontWeight: 700 }}>✓</span>
          Rester connecté sur cet appareil
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', background: loading ? FV.smokeDim : FV.ember, color: loading ? FV.smoke : FV.black, border: 'none', padding: '14px', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 18, borderRadius: 8, boxShadow: loading ? 'none' : `0 0 24px ${FV.ember}66`, textTransform: 'uppercase', transition: 'all 0.2s' }}
        >
          {loading ? "Connexion en cours…" : "Reprendre ma session →"}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 22, color: FV.smoke, fontFamily: FV.mono, fontSize: 9, letterSpacing: '0.2em' }}>
          <div style={{ flex: 1, height: 1, background: FV.rule }} />OU<div style={{ flex: 1, height: 1, background: FV.rule }} />
        </div>

        <button type="button" style={{ width: '100%', background: 'transparent', color: FV.ink, border: `1px solid ${FV.ruleStrong}`, padding: '12px', fontSize: 13, fontWeight: 500, cursor: 'pointer', marginTop: 14, borderRadius: 8 }}>
          Continuer avec Google
        </button>

        <div style={{ marginTop: 28, fontSize: 12, color: FV.smoke }}>
          Pas encore de compte ? <Link href="/register" style={{ color: FV.ember, fontWeight: 600, textDecoration: 'none' }}>Allumer mon four →</Link>
        </div>
      </form>
    </AuthShell>
  );
}
