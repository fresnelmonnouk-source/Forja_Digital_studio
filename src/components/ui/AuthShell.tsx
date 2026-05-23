"use client";
import React from 'react';
import { FV, FVMark, FVOrb, FVSGrid } from "@/components/ui/fonderie";
import { useMediaQuery } from "@/lib/use-media-query";

export default function AuthShell({ children, hero }: { children: React.ReactNode, hero?: React.ReactNode }) {
  // En dessous de 900px, on masque le panneau visuel et on centre le formulaire.
  const isCompact = useMediaQuery("(max-width: 900px)");

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: FV.black, fontFamily: FV.sans, color: FV.ink, position: 'relative', display: 'flex', overflow: 'hidden' }}>
      <FVSGrid />
      <div style={{ position: 'absolute', top: -200, left: 200, width: 700, height: 700, background: `radial-gradient(circle, ${FV.ember}22 0%, transparent 60%)`, pointerEvents: 'none' }} />

      {/* Left visual — masqué sur petit écran */}
      {!isCompact && (
        <div style={{ position: 'relative', width: '52%', padding: '48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: `1px solid ${FV.rule}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FVMark size={36} />
            <div style={{ fontFamily: FV.serif, fontSize: 26, fontWeight: 700, letterSpacing: '0.18em' }}>FORJA</div>
          </div>

          <div style={{ position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <div style={{ position: 'absolute', inset: -60, background: `radial-gradient(circle, ${FV.ember}33 0%, transparent 60%)`, filter: 'blur(40px)' }} />
            <FVOrb size={240} />
          </div>

          <div style={{ position: 'relative', marginTop: 'auto' }}>
            {hero}
          </div>
        </div>
      )}

      {/* Right form */}
      <div style={{ position: 'relative', flex: 1, padding: isCompact ? '40px 24px' : '56px 72px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: isCompact ? 'center' : 'stretch' }}>
        {/* Logo en tête sur petit écran (puisque le panneau gauche est masqué) */}
        {isCompact && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, width: '100%', maxWidth: 380 }}>
            <FVMark size={30} />
            <div style={{ fontFamily: FV.serif, fontSize: 22, fontWeight: 700, letterSpacing: '0.18em' }}>FORJA</div>
          </div>
        )}
        <div style={{ width: '100%', maxWidth: 380 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
