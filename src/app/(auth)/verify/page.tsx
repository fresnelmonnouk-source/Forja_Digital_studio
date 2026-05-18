"use client";
import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import AuthShell from "@/components/ui/AuthShell";
import { FV, FVHook } from "@/components/ui/fonderie";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError("");
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setDigits(text.split(""));
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const code = digits.join("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return setError("Saisis les 6 chiffres du code.");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Code incorrect.");
        setLoading(false);
        return;
      }

      const password = sessionStorage.getItem("forja_reg_pwd");
      if (password) {
        const result = await signIn("credentials", { email, password, redirect: false });
        sessionStorage.removeItem("forja_reg_pwd");
        if (result?.ok) {
          router.push("/onboarding");
          return;
        }
      }

      router.push("/login?verified=true");
    } catch {
      setError("Erreur réseau. Réessaie.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    setResendSuccess(false);
    try {
      await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setCooldown(60);
      setResendSuccess(true);
    } catch {
      setError("Impossible de renvoyer le code.");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: 52,
    height: 64,
    textAlign: "center",
    background: FV.black2,
    border: `1px solid ${FV.ruleStrong}`,
    borderRadius: 8,
    fontFamily: FV.serif,
    fontSize: 32,
    fontStyle: "italic",
    color: FV.ember,
    outline: "none",
    caretColor: FV.ember,
    transition: "border-color .15s",
  };

  return (
    <AuthShell
      hero={
        <div>
          <FVHook tag="✦" label="Vérification email" />
          <div style={{ marginTop: 20, background: FV.black2, border: `1px solid ${FV.ruleStrong}`, borderRadius: 14, padding: "24px 28px" }}>
            <div style={{ fontFamily: FV.serif, fontSize: 60, color: FV.ember, lineHeight: 0.5, marginBottom: 8 }}>"</div>
            <div style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: 20, lineHeight: 1.4, color: FV.ink, marginTop: 4, maxWidth: 460, letterSpacing: "-0.005em" }}>
              Une dernière étape avant d'allumer le <span style={{ fontStyle: "italic", color: FV.ember }}>fourneau</span>.
            </div>
            <div style={{ marginTop: 18, fontFamily: FV.mono, fontSize: 11, color: FV.smoke, letterSpacing: "0.1em" }}>
              CODE ENVOYÉ À {email.toUpperCase()}
            </div>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ fontFamily: FV.mono, fontSize: 10, color: FV.ember, letterSpacing: "0.2em", marginBottom: 14 }}>— VÉRIFICATION</div>
        <h2 style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: 40, color: FV.ink, margin: 0, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
          Le code<br /><span style={{ fontStyle: "italic", color: FV.ember }}>du four</span>.
        </h2>
        <p style={{ fontSize: 14, color: FV.ink2, marginTop: 14, marginBottom: 32, lineHeight: 1.6 }}>
          Consulte ta boîte mail et saisis le code à 6 chiffres reçu de FORJA.
        </p>

        {error && (
          <div style={{ background: "rgba(238,90,36,0.1)", border: "1px solid rgba(238,90,36,0.35)", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: FV.ember, display: "flex", gap: 8 }}>
            <span>⚠</span> {error}
          </div>
        )}
        {resendSuccess && (
          <div style={{ background: "rgba(45,180,90,0.08)", border: "1px solid rgba(45,180,90,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "#5BCE8C" }}>
            Nouveau code envoyé.
          </div>
        )}

        {/* OTP inputs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }} onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
              style={{
                ...inputStyle,
                borderColor: d ? FV.ember : FV.ruleStrong,
                opacity: loading ? 0.6 : 1,
              }}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || code.length < 6}
          style={{
            width: "100%",
            background: loading || code.length < 6 ? FV.smokeDim : FV.ember,
            color: loading || code.length < 6 ? FV.smoke : FV.black,
            border: "none",
            padding: "14px",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.04em",
            cursor: loading || code.length < 6 ? "not-allowed" : "pointer",
            borderRadius: 8,
            boxShadow: code.length === 6 && !loading ? `0 0 24px ${FV.ember}66` : "none",
            textTransform: "uppercase",
            transition: "all 0.2s",
          }}
        >
          {loading ? "Vérification…" : "Confirmer le code →"}
        </button>

        <div style={{ marginTop: 24, fontSize: 13, color: FV.smoke, textAlign: "center" }}>
          Tu n'as pas reçu le mail ?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0}
            style={{ background: "none", border: "none", cursor: cooldown > 0 ? "not-allowed" : "pointer", color: cooldown > 0 ? FV.smoke : FV.ember, fontWeight: 600, fontSize: 13, padding: 0 }}
          >
            {cooldown > 0 ? `Renvoyer dans ${cooldown}s` : "Renvoyer →"}
          </button>
        </div>

        <div style={{ marginTop: 16, fontSize: 12, color: FV.smoke, textAlign: "center" }}>
          <Link href="/register" style={{ color: FV.smoke, textDecoration: "none" }}>← Recommencer l'inscription</Link>
        </div>
      </form>
    </AuthShell>
  );
}
