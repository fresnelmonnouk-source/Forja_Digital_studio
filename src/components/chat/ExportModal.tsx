import React, { useState, useEffect } from 'react';
import { FV, FVMark, FVHook } from "@/components/ui/fonderie";

interface Message {
  role: string;
  content: string;
}

const TYPES = [
  { id: "ebook", icon: "📖", label: "Ebook", desc: "Document structuré prêt à vendre" },
  { id: "formation", icon: "🎓", label: "Formation", desc: "Plan pédagogique complet, 12 étapes" },
  { id: "vente", icon: "💰", label: "Page de vente", desc: "Copywriting prêt à publier" },
  { id: "blueprint", icon: "⚙", label: "Blueprint", desc: "Roadmap & architecture technique" },
];

const OPTIONS = [
  ["Inclure la couverture", true],
  ["Ajouter ma signature en page de garde", true],
  ["Mode imprimeur (haute densité, 300 dpi)", false],
] as const;

export default function ExportModal({ onClose, conversation }: { onClose: () => void; conversation: Message[] }) {
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docType, setDocType] = useState("ebook");
  const [opts, setOpts] = useState([true, true, false]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      const markdownContent = conversation
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => {
          if (m.role === "user") return `> **Question :** ${m.content}`;
          return m.content;
        })
        .join("\n\n---\n\n");

      if (!markdownContent.trim()) {
        setError("Aucun contenu à exporter. Lance une conversation d'abord.");
        return;
      }

      const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: markdownContent, type: docType, opts })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || `Erreur ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `FORJA_${docType}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      try {
        a.click();
      } finally {
        document.body.removeChild(a);
      }
      window.URL.revokeObjectURL(url);
      setDone(true);
    } catch (e) {
      console.error("Erreur export PDF:", e);
      setError(e instanceof Error ? e.message : "Une erreur s'est produite lors de la génération du PDF.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(11,9,8,0.78)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div style={{ width: 560, background: FV.black2, border: `1px solid ${FV.ruleStrong}`, borderRadius: 16, padding: 32, boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 80px ${FV.ember}22`, position: 'relative' }}>

        {!done ? (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <FVHook tag="✦" label="Forger un document" />
                <h3 style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: 28, color: FV.ink, margin: '14px 0 6px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  Quel <span style={{ fontStyle: 'italic', color: FV.ember }}>document</span> graver ?
                </h3>
                <p style={{ fontFamily: FV.serif, fontStyle: 'italic', fontSize: 13, color: FV.smoke, margin: 0 }}>
                  FORJA compile la session en PDF professionnel.
                </p>
              </div>
              <button onClick={onClose} style={{ width: 32, height: 32, background: 'rgba(241,233,218,0.04)', border: `1px solid ${FV.rule}`, borderRadius: 7, color: FV.smoke, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
            </div>

            {/* Type grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {TYPES.map(t => (
                <div
                  key={t.id}
                  onClick={() => setDocType(t.id)}
                  style={{ background: docType === t.id ? 'rgba(238,90,36,0.1)' : FV.black, border: `1px solid ${docType === t.id ? 'rgba(238,90,36,0.4)' : FV.rule}`, borderRadius: 10, padding: '16px 18px', cursor: 'pointer', position: 'relative', transition: 'all 0.15s' }}
                >
                  {docType === t.id && (
                    <div style={{ position: 'absolute', top: 10, right: 10, width: 16, height: 16, borderRadius: '50%', background: FV.ember, color: FV.black, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>✓</div>
                  )}
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{t.icon}</div>
                  <div style={{ fontFamily: FV.serif, fontSize: 16, color: docType === t.id ? FV.ember : FV.ink, fontWeight: 600, marginBottom: 4 }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: FV.smoke, lineHeight: 1.5 }}>{t.desc}</div>
                </div>
              ))}
            </div>

            {/* Options */}
            <div style={{ background: FV.black, border: `1px solid ${FV.rule}`, borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: '0.18em', marginBottom: 10 }}>OPTIONS DE GRAVURE</div>
              {OPTIONS.map(([label], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
                  <span style={{ fontSize: 13, color: FV.ink2 }}>{label}</span>
                  <div
                    onClick={() => setOpts(o => { const n = [...o]; n[i] = !n[i]; return n; })}
                    style={{ width: 32, height: 18, borderRadius: 999, background: opts[i] ? FV.ember : 'rgba(241,233,218,0.1)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
                  >
                    <div style={{ position: 'absolute', top: 2, left: opts[i] ? 16 : 2, width: 14, height: 14, borderRadius: '50%', background: opts[i] ? FV.black : FV.smoke, transition: 'left 0.2s' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Error message */}
            {error && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(238,90,36,0.08)', border: `1px solid rgba(238,90,36,0.3)`, borderRadius: 8, fontSize: 12, color: FV.ember, lineHeight: 1.5 }}>
                ⚠️ {error}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleExport}
              disabled={exporting}
              style={{ width: '100%', background: exporting ? FV.smokeDim : FV.ember, color: exporting ? FV.smoke : FV.black, border: 'none', padding: '14px', fontSize: 13, fontWeight: 700, cursor: exporting ? 'not-allowed' : 'pointer', borderRadius: 8, boxShadow: exporting ? 'none' : `0 0 24px ${FV.ember}66`, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s' }}
            >
              <span style={{ fontFamily: FV.serif, fontStyle: 'italic', fontSize: 16 }}>{exporting ? '⏳' : '✦'}</span>
              {exporting ? "GRAVURE EN COURS…" : "FORGER LE PDF MAINTENANT →"}
            </button>
            <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: '0.12em', textAlign: 'center', marginTop: 10 }}>~ 8 SECONDES · GÉNÉRÉ ET TÉLÉCHARGÉ DIRECTEMENT</div>
          </>
        ) : (
          // Success state
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <FVMark size={56} />
            </div>
            <FVHook tag="✦" label="Document gravé" />
            <h3 style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: 32, color: FV.ink, margin: '16px 0 8px', letterSpacing: '-0.02em' }}>
              Ton <span style={{ fontStyle: 'italic', color: FV.ember }}>PDF</span> est prêt.
            </h3>
            <p style={{ fontFamily: FV.serif, fontStyle: 'italic', fontSize: 14, color: FV.ink2, marginBottom: 28, lineHeight: 1.6 }}>
              Le document a été généré et téléchargé automatiquement.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={onClose} style={{ flex: 1, background: 'transparent', color: FV.ink, border: `1px solid ${FV.ruleStrong}`, padding: '12px', fontSize: 13, fontWeight: 500, cursor: 'pointer', borderRadius: 8 }}>
                Retour à la forge
              </button>
              <button onClick={() => { setDone(false); setError(null); }} style={{ flex: 1, background: FV.ember, color: FV.black, border: 'none', padding: '12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', borderRadius: 8, boxShadow: `0 0 20px ${FV.ember}55` }}>
                Nouveau document →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
