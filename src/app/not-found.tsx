import Link from "next/link";
import { FV, FVMark, FVHook, FVSGrid } from "@/components/ui/fonderie";

export default function NotFound() {
  return (
    <div style={{ width: '100%', minHeight: '100vh', background: FV.black, fontFamily: FV.sans, color: FV.ink, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <FVSGrid />
      <div style={{ position: 'absolute', top: -200, right: -100, width: 700, height: 700, background: `radial-gradient(circle, ${FV.ember}22 0%, transparent 60%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -200, left: -100, width: 500, height: 500, background: `radial-gradient(circle, ${FV.amber}15 0%, transparent 60%)`, pointerEvents: 'none' }} />

      {/* Nav */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 56px', borderBottom: `1px solid ${FV.rule}`, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FVMark size={30} />
          <div style={{ fontFamily: FV.serif, fontSize: 22, fontWeight: 700, letterSpacing: '0.18em' }}>FORJA</div>
        </div>
        <Link href="/" style={{ background: 'transparent', border: `1px solid ${FV.ruleStrong}`, color: FV.ink, padding: '8px 14px', borderRadius: 7, fontSize: 12, cursor: 'pointer', textDecoration: 'none' }}>← Retour à l'accueil</Link>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 56px', position: 'relative', zIndex: 5 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', maxWidth: 1100, width: '100%' }}>
          {/* Left — text */}
          <div>
            <FVHook tag="404" label="Page introuvable" />
            <h1 style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: 96, lineHeight: 0.9, letterSpacing: '-0.035em', color: FV.ink, margin: '24px 0 0' }}>
              Cette pièce a<br />
              <span style={{ fontStyle: 'italic', background: `linear-gradient(180deg, ${FV.amber}, ${FV.ember})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>fondu</span> au four.
            </h1>
            <p style={{ fontFamily: FV.serif, fontStyle: 'italic', fontSize: 17, color: FV.ink2, marginTop: 24, lineHeight: 1.55, maxWidth: 480 }}>
              La page que tu cherches n'existe plus — ou n'a jamais existé. Pas grave : l'atelier a d'autres enclumes.
            </p>

            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <Link href="/" style={{ background: FV.ember, color: FV.black, border: 'none', padding: '14px 22px', borderRadius: 9, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer', boxShadow: `0 0 24px ${FV.ember}55`, textDecoration: 'none' }}>
                ← Retour à la forge
              </Link>
              <Link href="/chat" style={{ background: 'rgba(241,233,218,0.04)', color: FV.ink, border: `1px solid ${FV.ruleStrong}`, padding: '14px 22px', borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: 'pointer', textDecoration: 'none' }}>
                Voir le journal
              </Link>
            </div>

            <div style={{ marginTop: 36, paddingTop: 24, borderTop: `1px solid ${FV.rule}` }}>
              <div style={{ fontFamily: FV.mono, fontSize: 10, color: FV.smoke, letterSpacing: '0.15em', marginBottom: 14 }}>OU REPRENDS LÀ-DESSUS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ["→", "Démarrer une nouvelle session", "/chat"],
                  ["→", "Consulter le manuel", "/"],
                  ["→", "Se connecter", "/login"],
                ].map(([m, t, href], i) => (
                  <Link key={i} href={href} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', background: 'rgba(241,233,218,0.03)', border: `1px solid ${FV.rule}`, borderRadius: 8, cursor: 'pointer', textDecoration: 'none' }}>
                    <span style={{ color: FV.ember }}>{m}</span>
                    <span style={{ fontSize: 13, color: FV.ink, flex: 1 }}>{t}</span>
                    <span style={{ fontFamily: FV.mono, fontSize: 10, color: FV.smoke }}>{href}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Refroidi orb */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 420 }}>
            <div style={{ position: 'absolute', inset: 40, background: `radial-gradient(circle, ${FV.emberDeep}22 0%, transparent 60%)`, filter: 'blur(40px)' }} />
            {/* Half-cooled orb */}
            <div style={{ width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, #6B3F22 0%, #3A1E10 30%, #1A0604 70%, #0A0302 100%)`, boxShadow: `0 0 60px rgba(184,62,15,0.3), inset -20px -40px 80px rgba(0,0,0,0.6)`, position: 'relative' }}>
              {/* Crack SVG */}
              <svg viewBox="0 0 320 320" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
                <path d="M160 30 Q150 100 165 140 Q145 180 155 220 Q170 260 145 290" stroke={FV.ember} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
                <path d="M155 70 Q140 90 130 110" stroke={FV.ember} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
                <path d="M165 200 Q190 220 195 245" stroke={FV.ember} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
              </svg>
              {/* Glow through crack */}
              <div style={{ position: 'absolute', top: '40%', left: '48%', width: 30, height: 80, background: `radial-gradient(ellipse, ${FV.ember}99 0%, transparent 70%)`, filter: 'blur(8px)', transform: 'rotate(-8deg)' }} />
            </div>

            {/* Status cards */}
            <div style={{ position: 'absolute', top: 30, right: 0, background: FV.black2, border: `1px solid ${FV.ruleStrong}`, borderRadius: 8, padding: '8px 12px' }}>
              <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: '0.15em' }}>STATUT</div>
              <div style={{ fontFamily: FV.serif, fontSize: 14, color: '#DC4628', fontStyle: 'italic', marginTop: 2 }}>refroidie · 22°C</div>
            </div>
            <div style={{ position: 'absolute', bottom: 30, left: 0, background: FV.black2, border: `1px solid ${FV.ruleStrong}`, borderRadius: 8, padding: '8px 12px' }}>
              <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: '0.15em' }}>CODE</div>
              <div style={{ fontFamily: FV.mono, fontSize: 14, color: FV.amber, marginTop: 2 }}>HTTP_404</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
