import React from 'react';

export const FV = {
  black: '#0B0908',
  black2: '#15110D',
  black3: '#1E1813',
  ink: '#F1E9DA',
  ink2: '#C8BDA8',
  smoke: '#7A6F5E',
  smokeDim: '#54493B',
  rule: 'rgba(241,233,218,0.08)',
  ruleStrong: 'rgba(241,233,218,0.16)',
  ember: '#EE5A24',
  emberDeep: '#B83E0F',
  amber: '#F39C2C',
  amberPale: '#F5BC8B',
  brass: '#C8A969',
  brassDeep: '#8A6B2E',
  serif: "var(--font-serif)",
  sans: "var(--font-sans)",
  mono: "var(--font-mono)",
};

export const FVMark = ({ size = 36 }: { size?: number }) => (
  <div style={{ width: size, height: size, position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, #FFD27F 0%, ${FV.amber} 20%, ${FV.ember} 45%, ${FV.emberDeep} 75%, #2A0E04 100%)`, boxShadow: `0 0 ${size * 0.6}px ${FV.ember}55, inset 0 -1px 4px rgba(0,0,0,0.6)` }} />
    <div style={{ position: 'absolute', inset: size * 0.18, borderRadius: '50%', border: `1px solid rgba(0,0,0,0.35)` }} />
    <span style={{ position: 'relative', color: '#1A0A04', fontFamily: FV.serif, fontWeight: 700, fontSize: size * 0.42, fontStyle: 'italic', textShadow: '0 1px 0 rgba(255,200,120,0.4)' }}>F</span>
  </div>
);

export const FVHook = ({ tag, label }: { tag: string, label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <span style={{ fontFamily: FV.mono, fontSize: 10, color: FV.ember, letterSpacing: '0.15em' }}>{tag}</span>
    <div style={{ width: 24, height: 1, background: FV.ember }} />
    <span style={{ fontFamily: FV.sans, fontSize: 10, color: FV.ink2, letterSpacing: '0.22em', textTransform: 'uppercase' }}>{label}</span>
  </div>
);

export const FVOrb = ({ size = 360 }: { size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, #FFE9B5 0%, ${FV.amber} 18%, ${FV.ember} 45%, ${FV.emberDeep} 80%, #1A0604 100%)`, boxShadow: `0 0 100px ${FV.ember}99, inset -20px -40px 80px rgba(0,0,0,0.45), inset 20px 30px 60px rgba(255,220,140,0.3)`, position: 'relative' }}>
    <div style={{ position: 'absolute', inset: size * 0.09, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.2)', opacity: 0.4 }} />
    <div style={{ position: 'absolute', inset: size * 0.18, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.15)', opacity: 0.3 }} />
    <div style={{ position: 'absolute', top: '20%', left: '30%', width: size * 0.14, height: size * 0.14, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,240,200,0.7) 0%, transparent 70%)', filter: 'blur(8px)' }} />
  </div>
);

export const FVSGrid = () => (
  <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${FV.rule} 1px, transparent 1px), linear-gradient(90deg, ${FV.rule} 1px, transparent 1px)`, backgroundSize: '64px 64px', pointerEvents: 'none' }} />
);
