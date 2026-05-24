"use client";
import React, { useState, useEffect } from "react";
import { FV, FVHook } from "@/components/ui/fonderie";
import { useMediaQuery } from "@/lib/use-media-query";
import { PACKS, FREE_DOC_LIMIT } from "@/lib/plans";
import { X, Check, Sparkles, Loader2, ArrowRight, AlertTriangle } from "lucide-react";

interface QuotaData {
  freeUsed: number;
  freeRemaining: number;
  credits: number;
  freeLimit: number;
}

export default function CreditsModal({ onClose }: { onClose: () => void }) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [quota, setQuota] = useState<QuotaData | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/quota").then((r) => r.ok ? r.json() : null).then(setQuota).catch(() => {});
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const buy = async (packId: string) => {
    setBusy(packId);
    setError(null);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ packId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Paiement indisponible pour le moment.");
        setBusy(null);
        return;
      }
      window.location.href = data.url; // redirection vers le checkout FedaPay
    } catch {
      setError("Erreur réseau. Réessaie.");
      setBusy(null);
    }
  };

  const fmt = (n: number) => n.toLocaleString("fr-FR");

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(11,9,8,0.8)", backdropFilter: "blur(12px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? 14 : 24, overflowY: "auto" }}
    >
      <div style={{ width: "100%", maxWidth: 560, maxHeight: "92vh", overflowY: "auto", background: FV.black2, border: `1px solid ${FV.ruleStrong}`, borderRadius: 16, padding: isMobile ? 20 : 32, boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 80px ${FV.ember}22`, position: "relative" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <FVHook tag="✦" label="Crédits FORJA" />
            <h3 style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: 26, color: FV.ink, margin: "12px 0 6px", letterSpacing: "-0.02em" }}>
              Continue à <span style={{ fontStyle: "italic", color: FV.ember }}>forger</span>.
            </h3>
          </div>
          <button onClick={onClose} title="Fermer" style={{ width: 32, height: 32, background: "rgba(241,233,218,0.04)", border: `1px solid ${FV.rule}`, borderRadius: 7, color: FV.smoke, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><X size={16} /></button>
        </div>

        {/* État du quota */}
        {quota && (
          <div style={{ background: FV.black, border: `1px solid ${FV.rule}`, borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: FV.ink2 }}>
            {quota.freeRemaining > 0
              ? <>Il te reste <strong style={{ color: FV.ember }}>{quota.freeRemaining}</strong> document{quota.freeRemaining > 1 ? "s" : ""} gratuit{quota.freeRemaining > 1 ? "s" : ""} (sur {quota.freeLimit}).</>
              : <>Tes <strong style={{ color: FV.ember }}>{quota.freeLimit}</strong> documents gratuits sont utilisés.</>}
            {quota.credits > 0 && <> · Crédits : <strong style={{ color: FV.ember }}>{quota.credits}</strong>.</>}
          </div>
        )}

        {/* Packs */}
        <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
          {PACKS.map((p) => (
            <button
              key={p.id}
              onClick={() => buy(p.id)}
              disabled={!!busy}
              style={{ textAlign: "left", display: "flex", alignItems: "center", gap: 14, background: p.highlight ? "rgba(238,90,36,0.08)" : FV.black, border: `1px solid ${p.highlight ? "rgba(238,90,36,0.4)" : FV.rule}`, borderRadius: 12, padding: "16px 18px", cursor: busy ? "not-allowed" : "pointer", opacity: busy && busy !== p.id ? 0.5 : 1, transition: "all 0.15s" }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 8, background: `linear-gradient(135deg, ${FV.amber}, ${FV.emberDeep})`, color: FV.black, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {busy === p.id ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: FV.serif, fontSize: 17, fontWeight: 600, color: FV.ink }}>{p.label}</span>
                  {p.highlight && <span style={{ fontFamily: FV.mono, fontSize: 8, letterSpacing: "0.12em", color: FV.black, background: FV.ember, padding: "2px 7px", borderRadius: 999 }}>POPULAIRE</span>}
                </div>
                <div style={{ fontSize: 12, color: FV.smoke, marginTop: 2 }}>{p.credits} documents</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: FV.serif, fontSize: 18, color: FV.ember, fontWeight: 600 }}>{fmt(p.amount)} F</div>
                <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smokeDim }}>{Math.round(p.amount / p.credits)} F / doc</div>
              </div>
            </button>
          ))}
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(238,90,36,0.08)", border: "1px solid rgba(238,90,36,0.3)", borderRadius: 8, fontSize: 12, color: FV.ember, marginBottom: 12 }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: FV.mono, fontSize: 9, color: FV.smokeDim, letterSpacing: "0.1em" }}>
          <ArrowRight size={11} /> PAIEMENT SÉCURISÉ VIA FEDAPAY · MOBILE MONEY & CARTE
        </div>
      </div>
    </div>
  );
}
