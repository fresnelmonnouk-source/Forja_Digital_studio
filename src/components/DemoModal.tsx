"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FV, FVMark } from "@/components/ui/fonderie";
import { useMediaQuery } from "@/lib/use-media-query";
import { X, Sparkles, RotateCcw, ArrowRight } from "lucide-react";

type Msg = { role: "user" | "forja"; text: string };

// Conversation scriptée : montre la méthode FORJA (signal de marché → angle → promesse).
const SCRIPT: Msg[] = [
  { role: "user", text: "Je veux créer une formation sur Notion, mais je ne sais pas par où commencer." },
  { role: "forja", text: "Parfait. Avant de construire quoi que ce soit — **Étape 0 : le signal de marché**. Est-ce que des gens cherchent déjà à payer pour ça ? Sur quels forums, groupes ou vidéos vois-tu la question revenir ?" },
  { role: "user", text: "Beaucoup de monde galère à organiser ses projets sur Notion, oui." },
  { role: "forja", text: "Donc la douleur est **réelle et répétée** — c'est ton signal. On tient un angle : « Reprends le contrôle de tes projets en un seul dashboard Notion ». Passons à la **promesse mesurable** : qu'est-ce que l'élève saura *faire* à la fin, concrètement ?" },
  { role: "user", text: "Construire son propre système de gestion de projet en 1 heure." },
  { role: "forja", text: "Excellent — promesse claire, vérifiable, vendable. On a une vraie offre. Quand tu veux, je te génère le **plan de formation complet en PDF** prêt à lancer. ✦" },
];

/** Rend le **gras** et l'*italique* basiques inline. */
function renderText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i} style={{ color: FV.brass }}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("*") && p.endsWith("*")) return <em key={i} style={{ color: FV.amberPale }}>{p.slice(1, -1)}</em>;
    return p;
  });
}

export default function DemoModal({ onClose }: { onClose: () => void }) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [shown, setShown] = useState<Msg[]>([]);
  const [typing, setTyping] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const runId = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  async function play() {
    const myId = ++runId.current;
    const alive = () => runId.current === myId;
    setShown([]);
    setTyping(null);
    setDone(false);
    await sleep(400);
    for (const m of SCRIPT) {
      if (!alive()) return;
      if (m.role === "user") {
        await sleep(550);
        if (!alive()) return;
        setShown((s) => [...s, m]);
      } else {
        setTyping("");
        await sleep(650);
        let acc = "";
        for (const ch of m.text) {
          if (!alive()) return;
          acc += ch;
          setTyping(acc);
          await sleep(13);
        }
        if (!alive()) return;
        setShown((s) => [...s, m]);
        setTyping(null);
        await sleep(350);
      }
    }
    if (alive()) setDone(true);
  }

  useEffect(() => {
    play();
    return () => { runId.current++; }; // invalide la lecture en cours au démontage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [shown, typing]);

  const Avatar = ({ user }: { user: boolean }) =>
    user ? (
      <div style={{ width: 30, height: 30, borderRadius: 6, background: `linear-gradient(135deg, ${FV.amber}, ${FV.emberDeep})`, color: FV.black, fontFamily: FV.serif, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>T</div>
    ) : (
      <FVMark size={30} />
    );

  const Bubble = ({ m }: { m: Msg }) => {
    const isUser = m.role === "user";
    return (
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexDirection: isUser ? "row-reverse" : "row" }}>
        <Avatar user={isUser} />
        <div style={{ maxWidth: "80%" }}>
          {!isUser && <div style={{ fontFamily: FV.serif, fontWeight: 600, fontSize: 13, color: FV.ember, letterSpacing: "0.12em", marginBottom: 6 }}>FORJA</div>}
          <div style={{ background: isUser ? "rgba(238,90,36,0.08)" : FV.black, border: `1px solid ${isUser ? "rgba(238,90,36,0.22)" : FV.rule}`, borderRadius: isUser ? "14px 3px 14px 14px" : "3px 14px 14px 14px", padding: "12px 16px", fontSize: 14, lineHeight: 1.65, color: isUser ? FV.ink : FV.ink2 }}>
            {renderText(m.text)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(11,9,8,0.8)", backdropFilter: "blur(12px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? 14 : 24 }}
    >
      <div style={{ width: "100%", maxWidth: 540, background: FV.black2, border: `1px solid ${FV.ruleStrong}`, borderRadius: 16, boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 80px ${FV.ember}22`, display: "flex", flexDirection: "column", maxHeight: "90vh", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "16px 18px" : "18px 24px", borderBottom: `1px solid ${FV.rule}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles size={16} color={FV.ember} />
            <div>
              <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: "0.2em" }}>DÉMO INTERACTIVE</div>
              <div style={{ fontFamily: FV.serif, fontSize: 16, color: FV.ink, fontWeight: 500, marginTop: 1 }}>FORJA en action</div>
            </div>
          </div>
          <button onClick={onClose} title="Fermer" style={{ width: 32, height: 32, background: "rgba(241,233,218,0.04)", border: `1px solid ${FV.rule}`, borderRadius: 7, color: FV.smoke, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} /></button>
        </div>

        {/* Conversation */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: isMobile ? "18px 16px" : "24px 24px", minHeight: 280 }}>
          {shown.map((m, i) => <Bubble key={i} m={m} />)}
          {typing !== null && (
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <FVMark size={30} />
              <div style={{ maxWidth: "80%" }}>
                <div style={{ fontFamily: FV.serif, fontWeight: 600, fontSize: 13, color: FV.ember, letterSpacing: "0.12em", marginBottom: 6 }}>FORJA</div>
                <div style={{ background: FV.black, border: `1px solid ${FV.rule}`, borderRadius: "3px 14px 14px 14px", padding: "12px 16px", fontSize: 14, lineHeight: 1.65, color: FV.ink2 }}>
                  {typing === "" ? (
                    <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
                      {[0, 150, 300].map((d, i) => (
                        <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: FV.ember, animation: "bounce 1.2s infinite", animationDelay: `${d}ms` }} />
                      ))}
                    </span>
                  ) : (
                    <>{renderText(typing)}<span style={{ color: FV.ember }}>▋</span></>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: isMobile ? "14px 16px" : "16px 24px", borderTop: `1px solid ${FV.rule}`, background: FV.black }}>
          <button onClick={play} disabled={!done && shown.length < SCRIPT.length} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: `1px solid ${FV.ruleStrong}`, color: done ? FV.ink : FV.smoke, padding: "10px 16px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: done ? "pointer" : "default", opacity: done ? 1 : 0.5 }}>
            <RotateCcw size={14} /> Rejouer
          </button>
          <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: FV.ember, color: FV.black, padding: "12px 20px", borderRadius: 9, fontSize: 13, fontWeight: 700, letterSpacing: "0.02em", textDecoration: "none", boxShadow: `0 0 24px ${FV.ember}55`, whiteSpace: "nowrap" }}>
            Allumer mon four <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
