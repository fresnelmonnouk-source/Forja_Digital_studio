"use client";
import { useState } from "react";
import Link from "next/link";
import { FV, FVMark, FVHook, FVOrb } from "@/components/ui/fonderie";
import { useBreakpoint } from "@/lib/use-media-query";
import DemoModal from "@/components/DemoModal";
import JsonLd from "@/components/seo/JsonLd";
import { softwareAppSchema, faqSchema, FAQ_ITEMS } from "@/lib/seo/structured-data";
import { PACKS } from "@/lib/plans";

// Copie marketing par pack (la donnée prix/credits vient de plans.ts — source unique).
const PACK_COPY: Record<string, { accroche: string; unite: string; bullets: string[]; cta: string }> = {
  starter: {
    accroche: "Pour lancer tes premiers produits.",
    unite: "30 documents · ~350 F le document",
    bullets: ["30 documents par mois", "Crédits valables 31 jours", "Paiement mobile money (FedaPay)"],
    cta: "Choisir Starter",
  },
  pro: {
    accroche: "Le meilleur rapport pour produire chaque semaine.",
    unite: "50 documents · 300 F le document",
    bullets: ["50 documents par mois", "Meilleur prix au document", "Crédits valables 31 jours", "Paiement mobile money (FedaPay)"],
    cta: "Choisir Pro →",
  },
  studio: {
    accroche: "Pour industrialiser ta production.",
    unite: "200 documents · 225 F le document",
    bullets: ["200 documents par mois", "Le tarif le plus bas au document", "Choix du modèle d'IA", "Crédits valables 31 jours"],
    cta: "Choisir Studio",
  },
};

export default function FonderieV2Landing() {
  const { isMobile, isTablet } = useBreakpoint();
  const [showDemo, setShowDemo] = useState(false);

  // Variables responsive partagées
  const padX = isMobile ? 20 : isTablet ? 36 : 56;
  const sectionPad = (top: number, bottom: number) =>
    `${isMobile ? Math.round(top * 0.55) : top}px ${padX}px ${isMobile ? Math.round(bottom * 0.6) : bottom}px`;

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: FV.black, fontFamily: FV.sans, color: FV.ink, position: 'relative', overflow: 'hidden' }}>
      {/* Données structurées : application + offres + FAQ */}
      <JsonLd data={[softwareAppSchema(), faqSchema()]} />

      {/* Ambient glows */}
      <div style={{ position: 'absolute', top: -200, right: -200, width: 900, height: 900, background: `radial-gradient(circle, ${FV.ember}22 0%, transparent 60%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 800, left: -300, width: 700, height: 700, background: `radial-gradient(circle, ${FV.amber}11 0%, transparent 60%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${FV.rule} 1px, transparent 1px), linear-gradient(90deg, ${FV.rule} 1px, transparent 1px)`, backgroundSize: '80px 80px', opacity: 0.6, pointerEvents: 'none' }} />

      {/* Nav */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${isMobile ? 14 : 20}px ${padX}px`, borderBottom: `1px solid ${FV.rule}`, backdropFilter: 'blur(8px)', zIndex: 10, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <FVMark size={isMobile ? 26 : 30} />
          <div style={{ fontFamily: FV.serif, fontSize: isMobile ? 18 : 22, fontWeight: 700, letterSpacing: '0.18em', color: FV.ink }}>FORJA</div>
          {!isMobile && <span style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: '0.2em', marginLeft: 8, padding: '2px 8px', border: `1px solid ${FV.rule}`, borderRadius: 999 }}>v.1 — LIVE</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: isTablet ? 16 : 32, fontSize: 13, color: FV.ink2 }}>
          {!isTablet && <>
            <a href="#methode" style={{ color: FV.ink2, textDecoration: 'none', cursor: 'pointer' }}>Méthode</a>
            <a href="#tarifs" style={{ color: FV.ink2, textDecoration: 'none', cursor: 'pointer' }}>Tarifs</a>
            <a href="#faq" style={{ color: FV.ink2, textDecoration: 'none', cursor: 'pointer' }}>FAQ</a>
          </>}
          {!isMobile && <Link href="/login" style={{ background: 'transparent', border: `1px solid ${FV.ruleStrong}`, color: FV.ink, padding: '9px 16px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', textDecoration: 'none' }}>Connexion</Link>}
          <Link href="/register" style={{ background: FV.ember, color: FV.black, border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 12, fontWeight: 700, letterSpacing: '0.02em', cursor: 'pointer', boxShadow: `0 0 24px ${FV.ember}55`, textDecoration: 'none', whiteSpace: 'nowrap' }}>{isMobile ? 'Démarrer →' : 'Allumer le four →'}</Link>
        </div>
      </div>

      {/* Hero */}
      <div style={{ position: 'relative', padding: sectionPad(100, 80), display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1.4fr 1fr', gap: isMobile ? 40 : 56, alignItems: 'center', maxWidth: 1400, margin: '0 auto', zIndex: 5 }}>
        <div>
          <FVHook tag="00:01" label="Édition v.1 — Manuel du forgeron numérique" />
          <h1 style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: isMobile ? 46 : isTablet ? 72 : 96, lineHeight: 0.95, letterSpacing: '-0.035em', color: FV.ink, margin: '36px 0 0' }}>
            <span style={{ display: 'block' }}>De l&apos;idée floue</span>
            <span style={{ display: 'block', fontStyle: 'italic', fontWeight: 400, background: `linear-gradient(180deg, ${FV.amber} 0%, ${FV.ember} 60%, ${FV.emberDeep} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>au produit qui se vend.</span>
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 18, lineHeight: 1.55, color: FV.ink2, marginTop: 32, maxWidth: 560, fontWeight: 400 }}>
            Tu as un savoir, une compétence, une idée. FORJA la transforme en vrai produit digital — ebook, formation, page de vente — et te le livre fini, prêt à vendre et à <span style={{ color: FV.brass, fontFamily: FV.serif, fontStyle: 'italic' }}>encaisser en mobile money</span>.
            <br /><br />
            Pas dans six mois. En quelques sessions, au feu, à l&apos;enclume, au marteau.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 44, flexWrap: 'wrap' }}>
            <Link href="/register" style={{ background: FV.ember, color: FV.black, border: 'none', padding: '16px 28px', borderRadius: 10, fontSize: 14, fontWeight: 700, letterSpacing: '0.02em', cursor: 'pointer', boxShadow: `0 0 32px ${FV.ember}66, inset 0 1px 0 rgba(255,255,255,0.2)`, textDecoration: 'none' }}>
              Forger mon produit — gratuit →
            </Link>
            <button onClick={() => setShowDemo(true)} style={{ background: 'rgba(241,233,218,0.04)', color: FV.ink, border: `1px solid ${FV.ruleStrong}`, padding: '16px 24px', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: FV.ember, color: FV.black, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>▶</span>
              Voir une vraie session
            </button>
          </div>

          {/* Micro-réassurance (remplace l'ancien faux social proof) */}
          <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: isMobile ? 14 : 22, flexWrap: 'wrap', fontFamily: FV.mono, fontSize: 11, color: FV.smoke, letterSpacing: '0.08em' }}>
            <span><span style={{ color: FV.ember }}>✦</span> 5 documents gratuits</span>
            <span><span style={{ color: FV.ember }}>✦</span> Sans carte</span>
            <span><span style={{ color: FV.ember }}>✦</span> Mobile money (FCFA)</span>
          </div>
        </div>

        {/* Right — molten orb + cards (masqué sur mobile pour la lisibilité) */}
        {!isTablet && (
          <div style={{ position: 'relative', height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: -60, background: `radial-gradient(circle, ${FV.ember}33 0%, transparent 60%)`, filter: 'blur(40px)' }} />
            <FVOrb size={360} />
            <div style={{ position: 'absolute', top: 40, right: 0, background: FV.black2, border: `1px solid ${FV.ruleStrong}`, borderRadius: 8, padding: '10px 14px', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: '0.15em' }}>TEMPÉRATURE</div>
              <div style={{ fontFamily: FV.serif, fontSize: 22, color: FV.amber, fontWeight: 500, marginTop: 2, fontStyle: 'italic' }}>À blanc</div>
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

      {/* Bande 3 temps (remplace le marquee) */}
      <div style={{ borderTop: `1px solid ${FV.rule}`, borderBottom: `1px solid ${FV.rule}`, background: FV.black2, padding: sectionPad(56, 56) }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ marginBottom: isMobile ? 28 : 40 }}>
            <FVHook tag="01" label="La trajectoire" />
            <h2 style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: isMobile ? 28 : 40, color: FV.ink, margin: '16px 0 0', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Trois temps. De l&apos;idée floue<br />au produit qu&apos;on télécharge.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 1, background: FV.rule, border: `1px solid ${FV.rule}` }}>
            {[
              ['01', 'Au feu', 'Le marché parle', "On lit le signal avant de créer : qui achète, pourquoi, à quel prix. Pas d'idée lancée à l'aveugle."],
              ['02', "À l'enclume", 'La méthode façonne', "Une méthode en 12 étapes structure ton idée brute en offre claire — promesse, transformation, prix tenu."],
              ['03', 'Au marteau', 'Le produit sort', "FORJA livre un vrai PDF professionnel, prêt à vendre. Pas un conseil. Un livrable."],
            ].map(([n, title, sub, desc], i) => (
              <div key={i} style={{ background: FV.black, padding: '28px 26px', position: 'relative', minHeight: 180 }}>
                <div style={{ fontFamily: FV.mono, fontSize: 10, color: FV.ember, letterSpacing: '0.18em', marginBottom: 14 }}>{n}</div>
                <div style={{ fontFamily: FV.serif, fontSize: 26, color: FV.ink, fontWeight: 500, letterSpacing: '-0.015em' }}>{title}</div>
                <div style={{ fontFamily: FV.serif, fontStyle: 'italic', fontSize: 15, color: FV.ember, marginBottom: 12 }}>{sub}</div>
                <div style={{ fontSize: 13, color: FV.ink2, lineHeight: 1.65 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section douleur → mécanisme */}
      <div style={{ position: 'relative', padding: sectionPad(100, 40), maxWidth: 1400, margin: '0 auto' }}>
        <FVHook tag="02" label="Le vrai problème" />
        <h2 style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: isMobile ? 34 : 58, color: FV.ink, margin: '20px 0 0', letterSpacing: '-0.025em', lineHeight: 1.05 }}>
          Tu n&apos;as jamais manqué d&apos;idées.<br /><span style={{ fontStyle: 'italic', color: FV.ember }}>Tu manques d&apos;un produit fini.</span>
        </h2>
        <div style={{ maxWidth: 680, marginTop: 28 }}>
          <p style={{ fontSize: isMobile ? 16 : 18, lineHeight: 1.65, color: FV.ink2, margin: 0 }}>
            Des notes partout. Des formations suivies. Des cours achetés. Et toujours rien à vendre.
          </p>
          <p style={{ fontSize: isMobile ? 16 : 18, lineHeight: 1.65, color: FV.ink2, margin: '18px 0 0' }}>
            Le problème n&apos;est pas ton savoir — il est réel. Ce qui manque, c&apos;est la méthode qui valide, structure, et livre à ta place.
          </p>
          <p style={{ fontSize: isMobile ? 18 : 22, lineHeight: 1.45, color: FV.ink, margin: '24px 0 0', fontFamily: FV.serif }}>
            Les autres te donnent des conseils. <span style={{ fontStyle: 'italic', color: FV.ember }}>FORJA te rend un produit fini.</span>
          </p>
        </div>
      </div>

      {/* Methods / Outils */}
      <div id="methode" style={{ position: 'relative', padding: sectionPad(60, 60), maxWidth: 1400, margin: '0 auto', scrollMarginTop: 80 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: isMobile ? 28 : 44, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <FVHook tag="03" label="L'arsenal" />
            <h2 style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: isMobile ? 38 : 64, color: FV.ink, margin: '20px 0 0', letterSpacing: '-0.025em', lineHeight: 1 }}>
              Six outils à <span style={{ fontStyle: 'italic', color: FV.ember }}>l&apos;enclume</span>.
            </h2>
            <p style={{ fontSize: isMobile ? 14 : 16, lineHeight: 1.6, color: FV.ink2, margin: '16px 0 0', maxWidth: 560 }}>
              Six étapes, une seule logique : valider avant de créer, créer avant de vendre. Tu avances pas à pas, l&apos;agent t&apos;accompagne à chaque coup de marteau.
            </p>
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
            ['Flywheel', 'Faire grandir.', 'Contenu → offre → publicité → automatisation. La roue qui tourne, et qui ramène des clients sans toi.'],
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

      {/* Différenciateur — conseiller vs livrer */}
      <div style={{ padding: `40px ${padX}px 60px`, maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(238,90,36,0.08), rgba(243,156,44,0.04))', border: `1px solid ${FV.ruleStrong}`, borderRadius: 16, padding: isMobile ? '28px 24px' : '44px 48px' }}>
          <FVHook tag="✦" label="La différence" />
          <div style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: isMobile ? 24 : 36, color: FV.ink, margin: '20px 0 0', lineHeight: 1.25, letterSpacing: '-0.015em', maxWidth: 860 }}>
            Les autres t&apos;expliquent comment faire. FORJA le fait avec toi — et te rend le <span style={{ fontStyle: 'italic', color: FV.ember }}>fichier</span>.
          </div>
          <p style={{ fontSize: isMobile ? 14 : 16, color: FV.ink2, margin: '16px 0 28px', lineHeight: 1.6, maxWidth: 720 }}>
            Pas une formation de plus. Pas un cours à regarder. Un atelier qui produit un livrable à chaque session.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 1, background: FV.rule, border: `1px solid ${FV.rule}`, marginBottom: 28 }}>
            {[
              ['Une formation', 'Un produit fini, exporté en PDF'],
              ['Des heures de vidéo', 'Une conversation de quelques minutes'],
              ['« Débrouille-toi ensuite »', 'Tu repars avec le livrable en main'],
            ].map(([before, after], i) => (
              <div key={i} style={{ background: FV.black2, padding: '20px 22px' }}>
                <div style={{ fontSize: 13, color: FV.smoke, marginBottom: 10, textDecoration: 'line-through', textDecorationColor: FV.smokeDim }}>{before}</div>
                <div style={{ fontSize: 14, color: FV.ink, lineHeight: 1.5, display: 'flex', gap: 8 }}><span style={{ color: FV.ember }}>✦</span><span>{after}</span></div>
              </div>
            ))}
          </div>
          <button onClick={() => setShowDemo(true)} style={{ background: 'transparent', color: FV.ink, border: `1px solid ${FV.ruleStrong}`, padding: '13px 22px', borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            Voir ce que ça donne →
          </button>
        </div>
      </div>

      {/* Tarifs */}
      <div id="tarifs" style={{ position: 'relative', padding: sectionPad(60, 70), maxWidth: 1400, margin: '0 auto', scrollMarginTop: 80 }}>
        <div style={{ marginBottom: isMobile ? 32 : 48 }}>
          <FVHook tag="04" label="Tarifs" />
          <h2 style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: isMobile ? 34 : 56, color: FV.ink, margin: '20px 0 0', letterSpacing: '-0.025em', lineHeight: 1.05 }}>
            Commence gratuitement.<br /><span style={{ fontStyle: 'italic', color: FV.ember }}>Paie quand tu vends.</span>
          </h2>
          <p style={{ fontSize: isMobile ? 15 : 17, lineHeight: 1.6, color: FV.ink2, margin: '18px 0 0', maxWidth: 620 }}>
            Cinq documents offerts, à vie, sans carte. Ensuite, tu recharges en FCFA par mobile money — quand tu en as besoin, pas avant.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 16, alignItems: 'stretch' }}>
          {/* Carte Gratuit */}
          <div style={{ background: FV.black2, border: `1px solid ${FV.ruleStrong}`, borderRadius: 14, padding: '28px 24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: FV.serif, fontSize: 22, color: FV.ink, fontWeight: 500 }}>Gratuit</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 14 }}>
              <span style={{ fontFamily: FV.serif, fontSize: 40, color: FV.ember, fontWeight: 500, fontStyle: 'italic' }}>0</span>
              <span style={{ fontSize: 13, color: FV.ink2 }}>FCFA</span>
            </div>
            <div style={{ fontFamily: FV.mono, fontSize: 10, color: FV.smoke, letterSpacing: '0.1em', marginTop: 4 }}>À VIE</div>
            <div style={{ fontSize: 13, color: FV.ink2, fontStyle: 'italic', fontFamily: FV.serif, marginTop: 14 }}>Pour juger sur pièce.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18, flexGrow: 1 }}>
              {['5 documents PDF gratuits, à vie', 'Sans carte bancaire', 'Accès à la méthode en 12 étapes', 'Génération PDF professionnelle'].map((b, i) => (
                <div key={i} style={{ fontSize: 13, color: FV.ink2, display: 'flex', gap: 8, lineHeight: 1.45 }}><span style={{ color: FV.ember }}>✦</span><span>{b}</span></div>
              ))}
            </div>
            <Link href="/register" style={{ marginTop: 22, background: 'transparent', color: FV.ink, border: `1px solid ${FV.ruleStrong}`, padding: '12px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>Forger gratuitement →</Link>
          </div>

          {/* Cartes payantes depuis PACKS */}
          {PACKS.map((p) => {
            const copy = PACK_COPY[p.id];
            if (!copy) return null;
            const hl = p.highlight;
            return (
              <div key={p.id} style={{ background: hl ? 'linear-gradient(160deg, rgba(238,90,36,0.10), rgba(21,17,13,0.6))' : FV.black2, border: `1px solid ${hl ? FV.ember : FV.ruleStrong}`, borderRadius: 14, padding: '28px 24px', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: hl ? `0 0 40px ${FV.ember}33` : 'none' }}>
                {hl && <div style={{ position: 'absolute', top: -10, left: 24, background: FV.ember, color: FV.black, padding: '3px 12px', fontSize: 9, fontFamily: FV.mono, letterSpacing: '0.15em', fontWeight: 700, borderRadius: 999 }}>RECOMMANDÉ</div>}
                <div style={{ fontFamily: FV.serif, fontSize: 22, color: FV.ink, fontWeight: 500 }}>{p.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 14 }}>
                  <span style={{ fontFamily: FV.serif, fontSize: 40, color: FV.ember, fontWeight: 500, fontStyle: 'italic' }}>{p.amount.toLocaleString('fr-FR')}</span>
                  <span style={{ fontSize: 13, color: FV.ink2 }}>FCFA</span>
                </div>
                <div style={{ fontFamily: FV.mono, fontSize: 10, color: FV.smoke, letterSpacing: '0.05em', marginTop: 4 }}>{copy.unite}</div>
                <div style={{ fontSize: 13, color: FV.ink2, fontStyle: 'italic', fontFamily: FV.serif, marginTop: 14 }}>{copy.accroche}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18, flexGrow: 1 }}>
                  {copy.bullets.map((b, i) => (
                    <div key={i} style={{ fontSize: 13, color: FV.ink2, display: 'flex', gap: 8, lineHeight: 1.45 }}><span style={{ color: FV.ember }}>✦</span><span>{b}</span></div>
                  ))}
                </div>
                <Link href="/register" style={{ marginTop: 22, background: hl ? FV.ember : 'transparent', color: hl ? FV.black : FV.ink, border: hl ? 'none' : `1px solid ${FV.ruleStrong}`, padding: '12px 16px', borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none', textAlign: 'center', boxShadow: hl ? `0 0 24px ${FV.ember}55` : 'none' }}>{copy.cta}</Link>
              </div>
            );
          })}
        </div>

        {/* Réassurance */}
        <div style={{ marginTop: 36, padding: isMobile ? '24px' : '28px 32px', background: FV.black2, border: `1px solid ${FV.rule}`, borderRadius: 14 }}>
          <div style={{ fontFamily: FV.serif, fontSize: isMobile ? 18 : 20, color: FV.ink, fontWeight: 500, marginBottom: 8 }}>Aucun risque de ton côté.</div>
          <p style={{ fontSize: 14, color: FV.ink2, lineHeight: 1.6, margin: 0 }}>
            Satisfait ou remboursé sur les packs — notre équipe s&apos;en occupe, au cas par cas. Les crédits achetés sont valables 31 jours. Tes 5 documents gratuits, eux, n&apos;expirent jamais.
          </p>
          <div style={{ marginTop: 18, display: 'flex', gap: isMobile ? 12 : 24, flexWrap: 'wrap', fontFamily: FV.mono, fontSize: 10, color: FV.smoke, letterSpacing: '0.1em' }}>
            <span><span style={{ color: FV.ember }}>✦</span> FCFA</span>
            <span><span style={{ color: FV.ember }}>✦</span> MOBILE MONEY</span>
            <span><span style={{ color: FV.ember }}>✦</span> SANS ENGAGEMENT</span>
            <span><span style={{ color: FV.ember }}>✦</span> AUCUNE COORDONNÉE BANCAIRE STOCKÉE</span>
          </div>
        </div>
      </div>

      {/* Preuve honnête (remplace les faux témoignages + numbers strip) */}
      <div style={{ position: 'relative', padding: sectionPad(40, 80), maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ marginBottom: isMobile ? 28 : 44 }}>
          <FVHook tag="05" label="Pourquoi nous faire confiance" />
          <h2 style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: isMobile ? 32 : 52, color: FV.ink, margin: '20px 0 0', letterSpacing: '-0.025em', lineHeight: 1.05 }}>
            On ne te montrera pas<br /><span style={{ fontStyle: 'italic', color: FV.ember }}>de faux avis.</span>
          </h2>
          <p style={{ fontSize: isMobile ? 15 : 17, lineHeight: 1.6, color: FV.ink2, margin: '18px 0 0', maxWidth: 640 }}>
            FORJA est jeune. Plutôt que d&apos;inventer des témoignages, on te laisse juger toi-même — gratuitement, avant de payer un franc.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20 }}>
          {[
            ['Teste, ne crois pas', 'Cinq documents gratuits, sans carte. La meilleure preuve, c\'est le PDF que tu tiens en main à la fin.'],
            ['La méthode est l\'autorité', 'Oracle, Triangle d\'Or, 12 étapes : une méthode de terrain, détaillée et vérifiable. Pas de promesse magique.'],
            ['Le livrable parle', 'Regarde la démo. Vois la qualité réelle d\'un document FORJA avant même de créer ton compte.'],
          ].map(([title, desc], i) => (
            <div key={i} style={{ background: FV.black2, border: `1px solid ${FV.ruleStrong}`, borderRadius: 14, padding: '28px 26px' }}>
              <div style={{ fontFamily: FV.mono, fontSize: 10, color: FV.ember, letterSpacing: '0.18em', marginBottom: 14 }}>0{i + 1}</div>
              <div style={{ fontFamily: FV.serif, fontSize: 22, color: FV.ink, fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 10 }}>{title}</div>
              <div style={{ fontSize: 14, color: FV.ink2, lineHeight: 1.65 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Big quote — principe fondamental */}
      <div id="apropos" style={{ padding: `20px ${padX}px 80px`, position: 'relative', maxWidth: 1400, margin: '0 auto', scrollMarginTop: 80 }}>
        <div style={{ background: FV.black2, border: `1px solid ${FV.ruleStrong}`, borderRadius: 16, padding: isMobile ? '36px 28px' : '56px 64px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 240, height: 240, borderRadius: '50%', background: `radial-gradient(circle, ${FV.ember}33 0%, transparent 70%)` }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: FV.serif, fontSize: 80, color: FV.ember, lineHeight: 0.8, marginBottom: 8 }}>«</div>
            <div style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: isMobile ? 26 : 38, lineHeight: 1.25, color: FV.ink, maxWidth: 880, letterSpacing: '-0.015em' }}>
              Tu ne vends jamais un fichier. Tu vends une <span style={{ fontStyle: 'italic', color: FV.ember }}>transformation</span> — un pont entre l&apos;état actuel et l&apos;état désiré.
            </div>
            <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 32, height: 1, background: FV.ember }} />
              <div style={{ fontFamily: FV.mono, fontSize: 11, color: FV.brass, letterSpacing: '0.15em' }}>PRINCIPE FONDAMENTAL — FORJA v.1</div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ — alimente aussi le schéma FAQPage (JSON-LD) */}
      <div id="faq" style={{ padding: `20px ${padX}px 80px`, position: 'relative', maxWidth: 1400, margin: '0 auto', scrollMarginTop: 80 }}>
        <div style={{ marginBottom: isMobile ? 28 : 40 }}>
          <FVHook tag="✦" label="Questions fréquentes" />
          <h2 style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: isMobile ? 32 : 48, color: FV.ink, margin: '20px 0 0', letterSpacing: '-0.02em', lineHeight: 1.05 }}>
            Tout ce qu&apos;il faut savoir<br />avant d&apos;allumer le four.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 12 : 20 }}>
          {FAQ_ITEMS.map((item, idx) => (
            <div key={idx} style={{ background: FV.black2, border: `1px solid ${FV.rule}`, borderRadius: 14, padding: isMobile ? '20px 22px' : '26px 28px' }}>
              <h3 style={{ fontFamily: FV.serif, fontWeight: 500, fontSize: isMobile ? 18 : 20, color: FV.ink, margin: '0 0 10px', letterSpacing: '-0.01em' }}>{item.question}</h3>
              <p style={{ fontSize: 15, color: FV.ink2, lineHeight: 1.65, margin: 0 }}>{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA — full bleed */}
      <div id="forge" style={{ position: 'relative', background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${FV.emberDeep}30 0%, ${FV.black} 70%)`, padding: `${isMobile ? 64 : 100}px ${padX}px`, textAlign: 'center', borderTop: `1px solid ${FV.ruleStrong}`, scrollMarginTop: 80 }}>
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
            Aucun engagement. Aucune carte. L&apos;atelier ouvre ses portes pour toi en moins de soixante secondes.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/register" style={{ background: FV.ember, color: FV.black, border: 'none', padding: '20px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700, letterSpacing: '0.02em', cursor: 'pointer', boxShadow: `0 0 40px ${FV.ember}88, inset 0 1px 0 rgba(255,255,255,0.25)`, textDecoration: 'none' }}>
              Allumer mon four — gratuit →
            </Link>
            <button onClick={() => setShowDemo(true)} style={{ background: 'rgba(241,233,218,0.04)', color: FV.ink, border: `1px solid ${FV.ruleStrong}`, padding: '20px 28px', borderRadius: 12, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
              Voir la démo
            </button>
          </div>
          <div style={{ marginTop: 36, display: 'flex', justifyContent: 'center', gap: isMobile ? 14 : 28, fontFamily: FV.mono, fontSize: 10, color: FV.smoke, letterSpacing: '0.12em', flexWrap: 'wrap' }}>
            <span>✦ 5 DOCS GRATUITS</span>
            <span>✦ AUCUNE CARTE</span>
            <span>✦ MOBILE MONEY</span>
            <span>✦ EN FCFA</span>
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
              De l&apos;idée floue au produit qui se vend. Au feu, à l&apos;enclume, au marteau.
            </p>
          </div>

          {/* Produit */}
          <div>
            <div style={{ fontFamily: FV.mono, fontSize: 10, color: FV.ember, letterSpacing: '0.18em', marginBottom: 22, textTransform: 'uppercase' }}>Produit</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="#methode" style={{ fontSize: 14, color: FV.ink2, textDecoration: 'none' }}>Comment ça marche</a>
              <a href="#tarifs" style={{ fontSize: 14, color: FV.ink2, textDecoration: 'none' }}>Tarifs</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setShowDemo(true); }} style={{ fontSize: 14, color: FV.ink2, textDecoration: 'none', cursor: 'pointer' }}>Démo</a>
            </div>
          </div>

          {/* Support */}
          <div>
            <div style={{ fontFamily: FV.mono, fontSize: 10, color: FV.ember, letterSpacing: '0.18em', marginBottom: 22, textTransform: 'uppercase' }}>Support</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="#faq" style={{ fontSize: 14, color: FV.ink2, textDecoration: 'none' }}>FAQ</a>
              <a href="mailto:aide@myforja.digital" style={{ fontSize: 14, color: FV.ink2, textDecoration: 'none' }}>Contact</a>
            </div>
          </div>

          {/* Légal */}
          <div>
            <div style={{ fontFamily: FV.mono, fontSize: 10, color: FV.ember, letterSpacing: '0.18em', marginBottom: 22, textTransform: 'uppercase' }}>Légal</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link href="/legal/mentions" style={{ fontSize: 14, color: FV.ink2, textDecoration: 'none' }}>Mentions légales</Link>
              <Link href="/legal/cgu" style={{ fontSize: 14, color: FV.ink2, textDecoration: 'none' }}>CGU / CGV</Link>
              <Link href="/legal/confidentialite" style={{ fontSize: 14, color: FV.ink2, textDecoration: 'none' }}>Confidentialité</Link>
              <Link href="/legal/remboursement" style={{ fontSize: 14, color: FV.ink2, textDecoration: 'none' }}>Remboursement</Link>
            </div>
          </div>
        </div>

        {/* Bottom row — copyright + socials */}
        <div style={{ paddingTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, maxWidth: 1400, margin: '0 auto', flexDirection: isMobile ? 'column' : 'row' }}>
          <div style={{ fontFamily: FV.mono, fontSize: 11, color: FV.smokeDim, letterSpacing: '0.1em' }}>
            © 2026 Forja Digital Studio — Cotonou, Bénin
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

      {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
    </div>
  );
}
