"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FV, FVMark, FVHook, FVOrb, FVSGrid } from "@/components/ui/fonderie";

const GOALS = [
  { id: "formation", icon: "🎓", label: "Créer une formation", desc: "Programme pédagogique · 12 étapes" },
  { id: "ebook", icon: "📖", label: "Lancer un ebook", desc: "Document structuré · prêt à vendre" },
  { id: "saas", icon: "⚙️", label: "Lancer un SaaS", desc: "MVP · validation marché · roadmap" },
  { id: "vente", icon: "💰", label: "Construire une offre", desc: "Copywriting · page de vente · prix" },
  { id: "automatisation", icon: "🤖", label: "Automatisation IA", desc: "Workflows · Make · systèmes" },
  { id: "marque", icon: "✦", label: "Bâtir ma marque", desc: "Positionnement · audience · contenu" },
];

const LEVELS = [
  { id: "debutant", label: "Débutant", desc: "Je commence de zéro" },
  { id: "intermediaire", label: "Intermédiaire", desc: "J'ai déjà lancé quelque chose" },
  { id: "avance", label: "Avancé", desc: "Je veux scaler ou optimiser" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [name, setName] = useState("");

  const handleFinish = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "forja_onboarding",
        JSON.stringify({ name, goal: selectedGoal, level: selectedLevel })
      );
    }
    router.push("/chat");
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: FV.black, fontFamily: FV.sans, color: FV.ink, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <FVSGrid />
      <div style={{ position: 'absolute', top: -200, right: -200, width: 800, height: 800, background: `radial-gradient(circle, ${FV.ember}20 0%, transparent 60%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -200, left: -100, width: 600, height: 600, background: `radial-gradient(circle, ${FV.amber}10 0%, transparent 60%)`, pointerEvents: 'none' }} />

      {/* Nav */}
      <div style={{ position: 'relative', padding: '20px 48px', borderBottom: `1px solid ${FV.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FVMark size={30} />
          <div style={{ fontFamily: FV.serif, fontSize: 20, fontWeight: 700, letterSpacing: '0.18em' }}>FORJA</div>
        </div>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 999, background: i <= step ? FV.ember : FV.ruleStrong, transition: 'all 0.3s ease', boxShadow: i === step ? `0 0 10px ${FV.ember}88` : 'none' }} />
          ))}
        </div>
        <div style={{ fontFamily: FV.mono, fontSize: 10, color: FV.smoke, letterSpacing: '0.15em' }}>ÉTAPE {step + 1} / 3</div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px', position: 'relative', zIndex: 5 }}>
        <div style={{ width: '100%', maxWidth: 700 }}>

          {/* STEP 0 — Bienvenue + Nom */}
          {step === 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: -40, background: `radial-gradient(circle, ${FV.ember}44 0%, transparent 60%)`, filter: 'blur(30px)' }} />
                  <FVOrb size={120} />
                </div>
              </div>
              <FVHook tag="00" label="Bienvenue à la forge" />
              <h1 style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: 64, lineHeight: 1, letterSpacing: '-0.03em', margin: '24px 0 16px', color: FV.ink }}>
                L'atelier est<br />
                <span style={{ fontStyle: 'italic', background: `linear-gradient(180deg, ${FV.amber}, ${FV.ember})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>prêt pour toi.</span>
              </h1>
              <p style={{ fontFamily: FV.serif, fontStyle: 'italic', fontSize: 16, color: FV.ink2, marginBottom: 40, lineHeight: 1.6 }}>
                En 3 questions, FORJA calibre ta session pour aller droit au feu.
              </p>
              <div style={{ background: FV.black2, border: `1px solid ${FV.ruleStrong}`, borderRadius: 12, padding: '24px', marginBottom: 24, textAlign: 'left' }}>
                <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: '0.2em', marginBottom: 10, textTransform: 'uppercase' }}>Comment t'appelle-t-on ?</div>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ton prénom ou pseudonyme..."
                  style={{ width: '100%', background: FV.black, border: `1px solid ${FV.ruleStrong}`, borderRadius: 8, padding: '14px 16px', fontFamily: FV.sans, fontSize: 15, color: FV.ink, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <button
                onClick={() => setStep(1)}
                disabled={!name.trim()}
                style={{ background: name.trim() ? FV.ember : FV.smokeDim, color: name.trim() ? FV.black : FV.smoke, border: 'none', padding: '16px 36px', borderRadius: 10, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', cursor: name.trim() ? 'pointer' : 'not-allowed', boxShadow: name.trim() ? `0 0 28px ${FV.ember}66` : 'none', textTransform: 'uppercase', transition: 'all 0.2s' }}
              >
                Entrer à la forge →
              </button>
            </div>
          )}

          {/* STEP 1 — Objectif */}
          {step === 1 && (
            <div>
              <FVHook tag="01" label="Ton objectif" />
              <h2 style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: 52, lineHeight: 1.05, letterSpacing: '-0.025em', margin: '20px 0 8px', color: FV.ink }}>
                Qu'est-ce qu'on<br /><span style={{ fontStyle: 'italic', color: FV.ember }}>forge</span> ensemble ?
              </h2>
              <p style={{ fontFamily: FV.serif, fontStyle: 'italic', fontSize: 15, color: FV.ink2, marginBottom: 32, lineHeight: 1.5 }}>
                Choisis l'objectif principal de cette session.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
                {GOALS.map(g => (
                  <div
                    key={g.id}
                    onClick={() => setSelectedGoal(g.id)}
                    style={{ background: selectedGoal === g.id ? 'rgba(238,90,36,0.1)' : FV.black2, border: `1px solid ${selectedGoal === g.id ? 'rgba(238,90,36,0.4)' : FV.rule}`, borderRadius: 12, padding: '20px 18px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
                  >
                    {selectedGoal === g.id && (
                      <div style={{ position: 'absolute', top: 10, right: 10, width: 16, height: 16, borderRadius: '50%', background: FV.ember, color: FV.black, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>✓</div>
                    )}
                    <div style={{ fontSize: 24, marginBottom: 10 }}>{g.icon}</div>
                    <div style={{ fontFamily: FV.serif, fontSize: 16, color: selectedGoal === g.id ? FV.ember : FV.ink, fontWeight: 600, marginBottom: 4 }}>{g.label}</div>
                    <div style={{ fontSize: 11, color: FV.smoke, lineHeight: 1.5 }}>{g.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <button onClick={() => setStep(0)} style={{ background: 'transparent', color: FV.ink2, border: `1px solid ${FV.ruleStrong}`, padding: '14px 24px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                  ← Retour
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedGoal}
                  style={{ background: selectedGoal ? FV.ember : FV.smokeDim, color: selectedGoal ? FV.black : FV.smoke, border: 'none', padding: '14px 32px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', cursor: selectedGoal ? 'pointer' : 'not-allowed', boxShadow: selectedGoal ? `0 0 24px ${FV.ember}66` : 'none', textTransform: 'uppercase', transition: 'all 0.2s' }}
                >
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 — Niveau */}
          {step === 2 && (
            <div>
              <FVHook tag="02" label="Ton niveau" />
              <h2 style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: 52, lineHeight: 1.05, letterSpacing: '-0.025em', margin: '20px 0 8px', color: FV.ink }}>
                Où en es-tu<br /><span style={{ fontStyle: 'italic', color: FV.ember }}>aujourd'hui ?</span>
              </h2>
              <p style={{ fontFamily: FV.serif, fontStyle: 'italic', fontSize: 15, color: FV.ink2, marginBottom: 32, lineHeight: 1.5 }}>
                FORJA adapte sa rigueur à ton expérience.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {LEVELS.map(l => (
                  <div
                    key={l.id}
                    onClick={() => setSelectedLevel(l.id)}
                    style={{ background: selectedLevel === l.id ? 'rgba(238,90,36,0.1)' : FV.black2, border: `1px solid ${selectedLevel === l.id ? 'rgba(238,90,36,0.4)' : FV.rule}`, borderRadius: 12, padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}
                  >
                    <div>
                      <div style={{ fontFamily: FV.serif, fontSize: 20, color: selectedLevel === l.id ? FV.ember : FV.ink, fontWeight: 600, marginBottom: 4 }}>{l.label}</div>
                      <div style={{ fontFamily: FV.serif, fontStyle: 'italic', fontSize: 13, color: FV.smoke }}>{l.desc}</div>
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: selectedLevel === l.id ? FV.ember : FV.rule, border: `1px solid ${selectedLevel === l.id ? FV.ember : FV.ruleStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: FV.black, fontSize: 12, fontWeight: 700, flexShrink: 0, transition: 'all 0.2s' }}>
                      {selectedLevel === l.id ? '✓' : ''}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(243,156,44,0.06)', border: `1px solid rgba(243,156,44,0.18)`, borderRadius: 10, padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ color: FV.amber, fontFamily: FV.serif, fontStyle: 'italic', fontSize: 18, lineHeight: 1, flexShrink: 0 }}>✦</span>
                <span style={{ fontFamily: FV.serif, fontStyle: 'italic', fontSize: 13, color: FV.amberPale, lineHeight: 1.55 }}>
                  Tu peux toujours changer de direction en pleine session. FORJA s'adapte à chaque tournant.
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <button onClick={() => setStep(1)} style={{ background: 'transparent', color: FV.ink2, border: `1px solid ${FV.ruleStrong}`, padding: '14px 24px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                  ← Retour
                </button>
                <button
                  onClick={handleFinish}
                  disabled={!selectedLevel}
                  style={{ background: selectedLevel ? FV.ember : FV.smokeDim, color: selectedLevel ? FV.black : FV.smoke, border: 'none', padding: '14px 32px', borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', cursor: selectedLevel ? 'pointer' : 'not-allowed', boxShadow: selectedLevel ? `0 0 24px ${FV.ember}88, inset 0 1px 0 rgba(255,255,255,0.15)` : 'none', textTransform: 'uppercase', transition: 'all 0.2s' }}
                >
                  Allumer le four →
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
