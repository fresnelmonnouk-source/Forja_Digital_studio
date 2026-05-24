"use client";
import { useEffect, useState, useCallback } from "react";
import { FV } from "@/components/ui/fonderie";
import { useMediaQuery } from "@/lib/use-media-query";
import { Scale, Save, RotateCcw, ExternalLink, Check, Pencil } from "lucide-react";

interface LegalPage {
  slug: string;
  title: string;
  content: string;
  updatedAt: string | null;
  isCustom: boolean;
}

export default function AdminLegal() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const loadList = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/legal");
      const data = await res.json();
      setPages(data.pages ?? []);
      if (!active && data.pages?.length) selectPage(data.pages[0]);
    } catch {
      setPages([]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadList(); }, [loadList]);

  const selectPage = (p: LegalPage) => {
    setActive(p.slug);
    setTitle(p.title);
    setContent(p.content);
    setSaved(false);
    setError("");
  };

  const save = async () => {
    if (!active) return;
    setSaving(true); setError(""); setSaved(false);
    try {
      const res = await fetch(`/api/admin/legal/${active}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Enregistrement impossible."); return; }
      setSaved(true);
      setPages((list) => list.map((x) => (x.slug === active ? { ...x, title, content, isCustom: true, updatedAt: data.updatedAt } : x)));
      setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  const reset = async () => {
    if (!active) return;
    if (!confirm("Réinitialiser cette page au texte par défaut ? Ta personnalisation sera perdue.")) return;
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/admin/legal/${active}`, { method: "DELETE" });
      const data = await res.json();
      setTitle(data.title); setContent(data.content);
      setPages((list) => list.map((x) => (x.slug === active ? { ...x, ...data } : x)));
    } finally { setSaving(false); }
  };

  const current = pages.find((p) => p.slug === active);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: FV.serif, fontSize: isMobile ? 28 : 34, fontWeight: 500, color: FV.ink, margin: 0, letterSpacing: "-0.02em" }}>Conformité légale</h1>
        <p style={{ fontSize: 13, color: FV.smoke, marginTop: 6 }}>Édite les pages légales du site. Elles sont publiées immédiatement sur <span style={{ fontFamily: FV.mono }}>/legal/…</span></p>
      </div>

      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 14 : 20, alignItems: "flex-start" }}>
        {/* Liste des pages */}
        <div style={{ width: isMobile ? "100%" : 240, flexShrink: 0, display: "flex", flexDirection: isMobile ? "row" : "column", gap: 8, flexWrap: "wrap", overflowX: isMobile ? "auto" : "visible" }}>
          {pages.map((p) => {
            const isActive = p.slug === active;
            return (
              <button key={p.slug} onClick={() => selectPage(p)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, textAlign: "left", cursor: "pointer", background: isActive ? "rgba(238,90,36,0.1)" : FV.black2, border: `1px solid ${isActive ? "rgba(238,90,36,0.3)" : FV.rule}`, color: isActive ? FV.ember : FV.ink2, whiteSpace: "nowrap", flex: isMobile ? "0 0 auto" : undefined }}>
                <Scale size={15} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 500 }}>{p.title}</div>
                  <div style={{ fontFamily: FV.mono, fontSize: 9, color: p.isCustom ? "#7EC8A0" : FV.smoke, marginTop: 2 }}>{p.isCustom ? "PERSONNALISÉE" : "PAR DÉFAUT"}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Éditeur */}
        {current && (
          <div style={{ flex: 1, minWidth: 0, width: isMobile ? "100%" : undefined }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: FV.smoke }}>
              <Pencil size={13} />
              <span style={{ fontFamily: FV.mono, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase" }}>Titre de la page</span>
            </div>
            <input value={title} onChange={(e) => { setTitle(e.target.value); setSaved(false); }} style={{ width: "100%", background: FV.black2, border: `1px solid ${FV.ruleStrong}`, borderRadius: 8, padding: "10px 13px", color: FV.ink, fontSize: 15, fontFamily: FV.sans, outline: "none", marginBottom: 16 }} />

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: FV.smoke }}>
              <Pencil size={13} />
              <span style={{ fontFamily: FV.mono, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase" }}>Contenu (markdown)</span>
            </div>
            <textarea value={content} onChange={(e) => { setContent(e.target.value); setSaved(false); }} rows={isMobile ? 16 : 22} style={{ width: "100%", background: FV.black2, border: `1px solid ${FV.ruleStrong}`, borderRadius: 8, padding: "13px", color: FV.ink, fontSize: 13, fontFamily: FV.mono, lineHeight: 1.7, outline: "none", resize: "vertical", boxSizing: "border-box" }} />

            {error && <div style={{ color: FV.ember, fontSize: 13, marginTop: 10 }}>{error}</div>}

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <button onClick={save} disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: FV.ember, color: FV.black, border: "none", padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1 }}>
                {saved ? <Check size={15} /> : <Save size={15} />} {saved ? "Enregistré" : saving ? "…" : "Enregistrer"}
              </button>
              <button onClick={reset} disabled={saving || !current.isCustom} title={current.isCustom ? "Revenir au texte par défaut" : "Déjà au texte par défaut"} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "transparent", color: current.isCustom ? FV.ink2 : FV.smokeDim, border: `1px solid ${FV.ruleStrong}`, padding: "10px 14px", borderRadius: 8, fontSize: 13, cursor: current.isCustom ? "pointer" : "default" }}>
                <RotateCcw size={14} /> Réinitialiser
              </button>
              <a href={`/legal/${current.slug}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, color: FV.smoke, fontSize: 13, textDecoration: "none", marginLeft: "auto" }}>
                Voir en ligne <ExternalLink size={13} />
              </a>
            </div>
            {current.updatedAt && (
              <div style={{ fontFamily: FV.mono, fontSize: 10, color: FV.smokeDim, marginTop: 12 }}>
                Dernière modification : {new Date(current.updatedAt).toLocaleString("fr-FR")}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
