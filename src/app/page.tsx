"use client";
import Link from "next/link";
import { FV, FVMark, FVHook, FVOrb } from "@/components/ui/fonderie";
import { useBreakpoint } from "@/lib/use-media-query";

export default function FonderieV2Landing() {
  const { isMobile, isTablet } = useBreakpoint();

  // Variables responsive partagées
  const padX = isMobile ? 20 : isTablet ? 36 : 56;
  const sectionPad = (top: number, bottom: number) =>
    `${isMobile ? Math.round(top * 0.55) : top}px ${padX}px ${isMobile ? Math.round(bottom * 0.6) : bottom}px`;

  return (
    <div style={{ width: '100%', minHeight: isMobile ? 'auto' : 3900, background: FV.black, fontFamily: FV.sans, color: FV.ink, position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glows */}
      <div style={{ position: 'absolute', top: -200, right: -200, width: 900, height: 900, background: `radial-gradient(circle, ${FV.ember}22 0%, transparent 60%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 800, left: -300, width: 700, height: 700, background: `radial-gradient(circle, ${FV.amber}11 0%, transparent 60%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${FV.rule} 1px, transparent 1px), linear-gradient(90deg, ${FV.rule} 1px, transparent 1px)`, backgroundSize: '80px 80px', opacity: 0.6, pointerEvents: 'none' }} />

      {/* Nav */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${isMobile ? 14 : 20}px ${padX}px`, borderBottom: `1px solid ${FV.rule}`, backdropFilter: 'blur(8px)', zIndex: 10, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <FVMark size={isMobile ? 26 : 30} />
          <div style={{ fontFamily: FV.serif, fontSize: isMobile ? 18 : 22, fontWeight: 700, letterSpacing: '0.18em', color: FV.ink }}>FORJA</div>
          {!isMobile && <span style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: '0.2em', marginLeft: 8, padding: '2px 8px', border: `1px solid ${FV.rule}`, borderRadius: 999 }}>v.4 — LIVE</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: isTablet ? 16 : 32, fontSize: 13, color: FV.ink2 }}>
          {!isTablet && <>
            <span style={{ cursor: 'pointer' }}>Méthode</span>
            <span style={{ cursor: 'pointer' }}>Forge</span>
            <span style={{ cursor: 'pointer' }}>Témoignages</span>
            <span style={{ cursor: 'pointer' }}>Journal</span>
          </>}
          {!isMobile && <Link href="/login" style={{ background: 'transparent', border: `1px solid ${FV.ruleStrong}`, color: FV.ink, padding: '9px 16px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', textDecoration: 'none' }}>Connexion</Link>}
          <Link href="/register" style={{ background: FV.ember, color: FV.black, border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 12, fontWeight: 700, letterSpacing: '0.02em', cursor: 'pointer', boxShadow: `0 0 24px ${FV.ember}55`, textDecoration: 'none', whiteSpace: 'nowrap' }}>{isMobile ? 'Démarrer →' : 'Allumer le four →'}</Link>
        </div>
      </div>

      {/* Hero */}
      <div style={{ position: 'relative', padding: sectionPad(100, 80), display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1.4fr 1fr', gap: isMobile ? 40 : 56, alignItems: 'center', maxWidth: 1400, margin: '0 auto', zIndex: 5 }}>
        <div>
          <FVHook tag="00:01" label="Édition v.4 — Manuel du forgeron numérique" />
          <h1 style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: isMobile ? 52 : isTablet ? 80 : 110, lineHeight: 0.9, letterSpacing: '-0.035em', color: FV.ink, margin: '36px 0 0' }}>
            <span style={{ display: 'block' }}>L'idée brute</span>
            <span style={{ display: 'block', fontStyle: 'italic', fontWeight: 400, background: `linear-gradient(180deg, ${FV.amber} 0%, ${FV.ember} 60%, ${FV.emberDeep} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>devient produit.</span>
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 18, lineHeight: 1.55, color: FV.ink2, marginTop: 32, maxWidth: 540, fontWeight: 400 }}>
            FORJA est un agent stratégique qui guide chaque créateur, du signal de marché à l'effet WOW.
            <br /><br />
            <span style={{ color: FV.brass, fontFamily: FV.serif, fontStyle: 'italic' }}>Trente ans de terrain</span> dans les produits digitaux, le SaaS et l'automatisation IA — au feu, à l'enclume, et au marteau.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 44, flexWrap: 'wrap' }}>
            <Link href="/register" style={{ background: FV.ember, color: FV.black, border: 'none', padding: '16px 28px', borderRadius: 10, fontSize: 14, fontWeight: 700, letterSpacing: '0.02em', cursor: 'pointer', boxShadow: `0 0 32px ${FV.ember}66, inset 0 1px 0 rgba(255,255,255,0.2)`, textDecoration: 'none' }}>
              Forger gratuitement →
            </Link>
            <button style={{ background: 'rgba(241,233,218,0.04)', color: FV.ink, border: `1px solid ${FV.ruleStrong}`, padding: '16px 24px', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: FV.ember, color: FV.black, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>▶</span>
              Voir la démo — 90s
            </button>
          </div>

          {/* Social proof under CTA */}
          <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex' }}>
              {['#E8A867', '#C77F4F', '#9C5A39', '#6B3F22'].map((c, i) => (
                <div key={i} style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: `2px solid ${FV.black}`, marginLeft: i ? -10 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: FV.black, fontFamily: FV.serif, fontWeight: 700, fontSize: 11 }}>{'EAJM'[i]}</div>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: FV.serif, fontSize: 14, color: FV.ink, lineHeight: 1.3 }}>
                <span style={{ color: FV.amber, fontStyle: 'italic' }}>1 247 créateurs</span> ont allumé leur four ce mois
              </div>
              <div style={{ fontFamily: FV.mono, fontSize: 10, color: FV.smoke, letterSpacing: '0.1em', marginTop: 2 }}>★★★★★ 4.9/5 · 312 AVIS</div>
            </div>
          </div>
        </div>

        {/* Right — molten orb + cards (masqué sur mobile pour la lisibilité) */}
        {!isTablet && (
          <div style={{ position: 'relative', height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: -60, background: `radial-gradient(circle, ${FV.ember}33 0%, transparent 60%)`, filter: 'blur(40px)' }} />
            <FVOrb size={360} />
            <div style={{ position: 'absolute', top: 40, right: 0, background: FV.black2, border: `1px solid ${FV.ruleStrong}`, borderRadius: 8, padding: '10px 14px', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: '0.15em' }}>TEMPÉRATURE</div>
              <div style={{ fontFamily: FV.serif, fontSize: 22, color: FV.amber, fontWeight: 500, marginTop: 2 }}>1 247°<span style={{ fontSize: 14 }}>C</span></div>
            </div>
            <div style={{ position: 'absolute', bottom: 60, left: -10, background: FV.black2, border: `1px solid ${FV.ruleStrong}`, borderRadius: 8, padding: '10px 14px', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: '0.15em' }}>SESSION</div>
              <div style={{ fontFamily: FV.serif, fontSize: 16, color: FV.ink, marginTop: 2 }}>Étape 02 / 12</div>
              <div style={{ marginTop: 8, height: 3, background: 'rgba(241,233,218,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: '20%', height: '100%', background: FV.ember, boxShadow: `0 0 8px ${FV.ember}` }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Marquee */}
      <div style={{ borderTop: `1px solid ${FV.rule}`, borderBottom: `1px solid ${FV.rule}`, padding: '20px 0', overflow: 'hidden', background: FV.black2 }}>
        {(() => {
          const items = ['ORACLE', '✦', "TRIANGLE D'OR", '✦', 'MATRICE DE VALEUR', '✦', '4 PILIERS', '✦', '12 ÉTAPES', '✦', 'FLYWHEEL', '✦', 'BLUEPRINT SAAS', '✦', 'FLYWHEEL DIGITALE', '✦'];
          const rendered = items.map((w, i) => (
            <span key={i} style={{ fontFamily: FV.serif, fontSize: isMobile ? 20 : 26, fontStyle: 'italic', fontWeight: 400, color: i % 2 === 1 ? FV.ember : FV.ink2 }}>{w}</span>
          ));
          return (
            <div className="marquee-track">
              {rendered}
              {rendered.map((el, i) => ({ ...el, key: `dup-${i}` }))}
            </div>
          );
        })()}
      </div>

      {/* Methods */}
      <div style={{ position: 'relative', padding: sectionPad(100, 60), maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: isMobile ? 36 : 56, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <FVHook tag="02" label="L'arsenal" />
            <h2 style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: isMobile ? 38 : 64, color: FV.ink, margin: '20px 0 0', letterSpacing: '-0.025em', lineHeight: 1 }}>
              Six outils à <span style={{ fontStyle: 'italic', color: FV.ember }}>l'enclume</span>.
            </h2>
          </div>
          {!isMobile && <div style={{ fontFamily: FV.mono, fontSize: 11, color: FV.smoke, letterSpacing: '0.1em' }}>06 — FORGE INSTRUMENTS</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 1, background: FV.rule, border: `1px solid ${FV.rule}` }}>
          {[
            ['Oracle', 'Lire le marché.', 'Six lectures pour repérer le signal sous le bruit du marché. Pas de produit sans validation.'],
            ['Triangle d\'Or', 'Trouver l\'idée.', "L'intersection de ce que tu sais, ce que tu aimes, et ce qu'on te demande. C'est là que se cache l'or."],
            ['Matrice', 'Valider sec.', 'Utile, simple, livrable. Trois oui — on forge. Un seul non — on retourne au feu.'],
            ['4 Piliers', "Bâtir l'offre.", 'Douleur miroir, transformation, réduction du risque, valeur disproportionnée.'],
            ['12 Étapes', 'Produire.', "Du signal de marché à l'effet WOW final. La trajectoire complète d'un produit qui se vend."],
            ['Flywheel', 'Scaler.', 'Contenu → offre → publicité → automatisation. La roue qui tourne sans toi.'],
          ].map(([title, hook, desc], i) => (
            <div key={i} style={{ background: FV.black, padding: '32px 28px', position: 'relative', minHeight: 220 }}>
              <div style={{ fontFamily: FV.mono, fontSize: 10, color: FV.smoke, letterSpacing: '0.18em', marginBottom: 16 }}>0{i + 1}</div>
              <div style={{ fontFamily: FV.serif, fontSize: 28, color: FV.ink, fontWeight: 500, letterSpacing: '-0.015em', marginBottom: 6 }}>{title}</div>
              <div style={{ fontFamily: FV.serif, fontStyle: 'italic', fontSize: 16, color: FV.ember, marginBottom: 14 }}>{hook}</div>
              <div style={{ fontSize: 13, color: FV.ink2, lineHeight: 1.65 }}>{desc}</div>
              <div style={{ position: 'absolute', bottom: 20, right: 20, fontFamily: FV.serif, fontStyle: 'italic', color: FV.ember, fontSize: 14 }}>→</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mid CTA — inline */}
      <div style={{ padding: `40px ${padX}px 60px`, maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(238,90,36,0.08), rgba(243,156,44,0.04))', border: `1px solid ${FV.ruleStrong}`, borderRadius: 14, padding: isMobile ? '24px' : '28px 36px', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: isMobile ? 20 : 36, flexDirection: isMobile ? 'column' : 'row' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <FVMark size={52} />
            <div>
              <div style={{ fontFamily: FV.serif, fontSize: isMobile ? 22 : 26, color: FV.ink, fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                Tu as déjà ton <span style={{ fontStyle: 'italic', color: FV.ember }}>idée</span> en tête ?
              </div>
              <div style={{ fontSize: 13, color: FV.ink2, marginTop: 6 }}>FORJA la transforme en plan d'action concret en moins de cinq minutes.</div>
            </div>
          </div>
          <Link href="/register" style={{ background: FV.ember, color: FV.black, border: 'none', padding: '14px 22px', borderRadius: 9, fontSize: 13, fontWeight: 700, letterSpacing: '0.02em', cursor: 'pointer', boxShadow: `0 0 24px ${FV.ember}55`, whiteSpace: 'nowrap', textDecoration: 'none', alignSelf: isMobile ? 'stretch' : 'auto', textAlign: 'center' }}>
            Démarrer ma session →
          </Link>
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ position: 'relative', padding: `60px ${padX}px 80px`, maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 48, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <FVHook tag="03" label="Cahier de l'atelier" />
            <h2 style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: isMobile ? 34 : 56, color: FV.ink, margin: '20px 0 0', letterSpacing: '-0.025em', lineHeight: 1.05 }}>
              Ce que disent ceux qui<br />ont <span style={{ fontStyle: 'italic', color: FV.ember }}>battu le métal</span>.
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontFamily: FV.mono, fontSize: 10, color: FV.smoke, letterSpacing: '0.12em' }}>★★★★★ 4.9 / 5 — 312 AVIS</div>
            {!isMobile && <button style={{ background: 'transparent', border: `1px solid ${FV.ruleStrong}`, color: FV.ink, padding: '8px 14px', borderRadius: 7, fontSize: 11, cursor: 'pointer' }}>Tout lire ↗</button>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 20 }}>
          {[
            {
              quote: "En trois sessions, j'ai eu plus de clarté sur mon offre qu'en six mois de coaching à 2 000 €.",
              snippet: "Promesse mesurable, prix tenu, et un plan d'action que j'ai exécuté en deux semaines.",
              name: 'Élise R.',
              role: 'Consultante marketing — Lyon',
              tag: 'FORMATION · 1 247 €',
              color: '#E8A867',
            },
            {
              quote: "FORJA m'a forcé à arrêter de bidouiller et à valider mon marché. J'ai signé 3 clients avant même de coder mon SaaS.",
              snippet: "L'étape 0 — signal de marché — m'a sauvé six mois de développement à vide.",
              name: 'Marc B.',
              role: 'Fondateur SaaS — Paris',
              tag: 'BLUEPRINT · MVP',
              color: '#C77F4F',
            },
            {
              quote: "Le document généré à la fin est tellement propre que je l'ai envoyé tel quel à mes premiers clients comme proposition.",
              snippet: "Ce que je payais 1 500 € en copy chaque mois, FORJA me le sort en une session.",
              name: 'Julie A.',
              role: 'Coach productivité — Bordeaux',
              tag: 'PAGE DE VENTE',
              color: '#9C5A39',
            },
          ].map((t, i) => (
            <div key={i} style={{ background: FV.black2, border: `1px solid ${FV.ruleStrong}`, borderRadius: 14, padding: '28px 28px 24px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'absolute', top: -10, left: 24, background: FV.ember, color: FV.black, padding: '3px 10px', fontSize: 9, fontFamily: FV.mono, letterSpacing: '0.15em', fontWeight: 700, borderRadius: 999 }}>{t.tag}</div>
              <div style={{ fontFamily: FV.serif, fontSize: 56, color: FV.ember, lineHeight: 0.5, marginTop: 8 }}>"</div>
              <div style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: 20, lineHeight: 1.4, color: FV.ink, marginTop: 8, letterSpacing: '-0.01em' }}>
                {t.quote}
              </div>
              <div style={{ fontFamily: FV.serif, fontStyle: 'italic', fontSize: 14, color: FV.ink2, marginTop: 14, lineHeight: 1.55 }}>
                — {t.snippet}
              </div>
              <div style={{ marginTop: 'auto', paddingTop: 24, display: 'flex', alignItems: 'center', gap: 12, borderTop: `1px solid ${FV.rule}` }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: t.color, color: FV.black, fontFamily: FV.serif, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.name.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: 13, color: FV.ink, fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontFamily: FV.serif, fontStyle: 'italic', fontSize: 12, color: FV.smoke }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Numbers strip */}
        <div style={{ marginTop: 48, padding: '36px 0', borderTop: `1px solid ${FV.ruleStrong}`, borderBottom: `1px solid ${FV.ruleStrong}`, display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 28 : 0 }}>
          {[
            ['1 247', 'créateurs actifs', "Ce mois à l'enclume"],
            ['8 392', 'sessions forgées', "Promesses gravées"],
            ['312', 'PDF générés', "Cette semaine"],
            ['97%', 'satisfaction', "Verdict de la communauté"],
          ].map(([n, l, sub], i) => (
            <div key={i} style={{ padding: isMobile ? '0 16px' : '0 28px', borderLeft: (!isMobile && i) ? `1px solid ${FV.rule}` : 'none' }}>
              <div style={{ fontFamily: FV.serif, fontSize: isMobile ? 42 : 56, color: FV.ember, fontStyle: 'italic', fontWeight: 400, lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 14, color: FV.ink, marginTop: 10, fontWeight: 500 }}>{l}</div>
              <div style={{ fontFamily: FV.serif, fontStyle: 'italic', fontSize: 12, color: FV.smoke, marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Big quote — principe fondamental */}
      <div style={{ padding: `40px ${padX}px 80px`, position: 'relative', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ background: FV.black2, border: `1px solid ${FV.ruleStrong}`, borderRadius: 16, padding: isMobile ? '36px 28px' : '56px 64px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 240, height: 240, borderRadius: '50%', background: `radial-gradient(circle, ${FV.ember}33 0%, transparent 70%)` }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: FV.serif, fontSize: 80, color: FV.ember, lineHeight: 0.8, marginBottom: 8 }}>«</div>
            <div style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: isMobile ? 26 : 38, lineHeight: 1.25, color: FV.ink, maxWidth: 880, letterSpacing: '-0.015em' }}>
              Tu ne vends jamais un fichier. Tu vends une <span style={{ fontStyle: 'italic', color: FV.ember }}>transformation</span> — un pont entre l'état actuel et l'état désiré.
            </div>
            <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 32, height: 1, background: FV.ember }} />
              <div style={{ fontFamily: FV.mono, fontSize: 11, color: FV.brass, letterSpacing: '0.15em' }}>PRINCIPE FONDAMENTAL — FORJA v.4</div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA — full bleed */}
      <div style={{ position: 'relative', background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${FV.emberDeep}30 0%, ${FV.black} 70%)`, padding: `${isMobile ? 64 : 100}px ${padX}px`, textAlign: 'center', borderTop: `1px solid ${FV.ruleStrong}` }}>
        <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
          <FVOrb size={120} />
        </div>
        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto', paddingTop: 80 }}>
          <FVHook tag="✦" label="Colophon" />
          <h3 style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: isMobile ? 40 : 72, color: FV.ink, margin: '24px 0 20px', letterSpacing: '-0.03em', lineHeight: 1 }}>
            Le four est <span style={{ fontStyle: 'italic', color: FV.ember }}>chaud</span>.<br />
            Quelle idée<br />va-t-on forger ?
          </h3>
          <p style={{ fontFamily: FV.serif, fontStyle: 'italic', fontSize: 18, color: FV.ink2, margin: '0 0 40px', lineHeight: 1.55 }}>
            Aucun engagement. Aucune carte. L'atelier ouvre ses portes pour toi en moins de soixante secondes.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/register" style={{ background: FV.ember, color: FV.black, border: 'none', padding: '20px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700, letterSpacing: '0.02em', cursor: 'pointer', boxShadow: `0 0 40px ${FV.ember}88, inset 0 1px 0 rgba(255,255,255,0.25)`, textDecoration: 'none' }}>
              Allumer mon four — gratuit →
            </Link>
            <button style={{ background: 'rgba(241,233,218,0.04)', color: FV.ink, border: `1px solid ${FV.ruleStrong}`, padding: '20px 28px', borderRadius: 12, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
              Voir la démo
            </button>
          </div>
          <div style={{ marginTop: 36, display: 'flex', justifyContent: 'center', gap: isMobile ? 14 : 28, fontFamily: FV.mono, fontSize: 10, color: FV.smoke, letterSpacing: '0.12em', flexWrap: 'wrap' }}>
            <span>✦ 100% GRATUIT</span>
            <span>✦ AUCUNE CARTE</span>
            <span>✦ 60 SECONDES</span>
            <span>✦ FRANÇAIS NATIF</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ position: 'relative', borderTop: `1px solid ${FV.ruleStrong}`, background: FV.black2, padding: `${isMobile ? 48 : 72}px ${padX}px 32px` }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1.5fr repeat(3, 1fr)', gap: isMobile ? 32 : 56, paddingBottom: 48, borderBottom: `1px solid ${FV.rule}`, maxWidth: 1400, margin: '0 auto' }}>
          {/* Brand */}
          <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <FVMark size={36} />
              <div style={{ fontFamily: FV.serif, fontSize: 26, fontWeight: 700, letterSpacing: '0.2em', color: FV.ink }}>FORJA</div>
            </div>
            <p style={{ fontFamily: FV.serif, fontStyle: 'italic', fontSize: 16, color: FV.ink2, marginTop: 22, lineHeight: 1.6, maxWidth: 340 }}>
              L'agent qui transforme l'idée brute en produit qui se vend. Au feu, à l'enclume, au marteau.
            </p>
          </div>

          {/* Produit */}
          <div>
            <div style={{ fontFamily: FV.mono, fontSize: 10, color: FV.ember, letterSpacing: '0.18em', marginBottom: 22, textTransform: 'uppercase' }}>Produit</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="#" style={{ fontSize: 14, color: FV.ink2, textDecoration: 'none' }}>Fonctionnalités</a>
              <a href="#" style={{ fontSize: 14, color: FV.ink2, textDecoration: 'none' }}>Tarifs</a>
              <a href="#" style={{ fontSize: 14, color: FV.ink2, textDecoration: 'none' }}>Démo</a>
            </div>
          </div>

          {/* Support */}
          <div>
            <div style={{ fontFamily: FV.mono, fontSize: 10, color: FV.ember, letterSpacing: '0.18em', marginBottom: 22, textTransform: 'uppercase' }}>Support</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="#" style={{ fontSize: 14, color: FV.ink2, textDecoration: 'none' }}>Documentation</a>
              <a href="#" style={{ fontSize: 14, color: FV.ink2, textDecoration: 'none' }}>Contact</a>
              <a href="#" style={{ fontSize: 14, color: FV.ink2, textDecoration: 'none' }}>FAQ</a>
            </div>
          </div>

          {/* Légal */}
          <div>
            <div style={{ fontFamily: FV.mono, fontSize: 10, color: FV.ember, letterSpacing: '0.18em', marginBottom: 22, textTransform: 'uppercase' }}>Légal</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="#" style={{ fontSize: 14, color: FV.ink2, textDecoration: 'none' }}>Mentions légales</a>
              <a href="#" style={{ fontSize: 14, color: FV.ink2, textDecoration: 'none' }}>CGU</a>
              <a href="#" style={{ fontSize: 14, color: FV.ink2, textDecoration: 'none' }}>Confidentialité</a>
            </div>
          </div>
        </div>

        {/* Bottom row — copyright + socials */}
        <div style={{ paddingTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, maxWidth: 1400, margin: '0 auto', flexDirection: isMobile ? 'column' : 'row' }}>
          <div style={{ fontFamily: FV.mono, fontSize: 11, color: FV.smokeDim, letterSpacing: '0.1em' }}>
            © 2026 FORJA — Digital Studio
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: 'X / Twitter', svg: <path d="M14.5 2H17l-5.6 6.4L18 16h-5l-3.9-5.1L4.6 16H2.1l6-6.9L1.8 2H7l3.5 4.6L14.5 2z" fill="currentColor" /> },
              { label: 'LinkedIn', svg: <g fill="currentColor"><rect x="2" y="6" width="3" height="10" rx="0.4" /><circle cx="3.5" cy="3.5" r="1.5" /><path d="M7 6h3v1.6c.5-.9 1.6-1.8 3.2-1.8C16 5.8 17 7.4 17 10v6h-3v-5.6c0-1.4-.5-2.3-1.7-2.3-1.3 0-2 .9-2 2.3V16H7V6z" /></g> },
              { label: 'YouTube', svg: <g fill="currentColor"><rect x="1" y="4" width="18" height="12" rx="2.5" /><path d="M8.5 7.5v5l4.5-2.5-4.5-2.5z" fill={FV.black2} /></g> },
              { label: 'Instagram', svg: <g fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2.5" y="2.5" width="15" height="15" rx="4" /><circle cx="10" cy="10" r="3.5" /><circle cx="14.5" cy="5.5" r="0.6" fill="currentColor" /></g> },
            ].map((s, i) => (
              <a key={i} href="#" aria-label={s.label} title={s.label} style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(241,233,218,0.04)', border: `1px solid ${FV.rule}`, color: FV.ink2, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'all 0.15s' }}>
                <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden>{s.svg}</svg>
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
