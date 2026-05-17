import React from 'react';
import { FV, FVMark, FVHook, FVOrb, FVSGrid } from "@/components/ui/fonderie";

export default function AuthShell({ children, hero }: { children: React.ReactNode, hero?: React.ReactNode }) {
  return (
    <div style={{ width: '100%', minHeight: '100vh', background: FV.black, fontFamily: FV.sans, color: FV.ink, position: 'relative', display: 'flex', overflow: 'hidden' }}>
      <FVSGrid />
      <div style={{ position: 'absolute', top: -200, left: 200, width: 700, height: 700, background: `radial-gradient(circle, ${FV.ember}22 0%, transparent 60%)`, pointerEvents: 'none' }} />

      {/* Left visual */}
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

      {/* Right form */}
      <div style={{ position: 'relative', flex: 1, padding: '56px 72px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: 380 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
