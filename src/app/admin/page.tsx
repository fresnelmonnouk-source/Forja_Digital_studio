"use client";
import { useEffect, useState } from "react";
import { FV } from "@/components/ui/fonderie";
import { useMediaQuery } from "@/lib/use-media-query";
import { Users, BadgeCheck, Activity, Shield, MessageSquare, FileText, Check, AlertTriangle, Wallet, TrendingUp } from "lucide-react";

interface Stats {
  users: { total: number; verified: number; admins: number; active: number; new7d: number; new30d: number };
  content: { conversations: number; messages: number };
  revenue: { allTime: number; last30d: number; paidCount: number; payingUsers: number };
  timeline: { day: string; count: number }[];
  tech: { providers: string[]; envHealth: Record<string, boolean> };
}

const ENV_LABELS: Record<string, string> = {
  DATABASE_URL: "Base de données",
  NEXTAUTH_SECRET: "Secret NextAuth",
  NEXTAUTH_URL: "URL publique",
  RESEND_API_KEY: "Emails (Resend)",
  FEDAPAY: "Paiements (FedaPay)",
  DEEPSEEK: "Modèle IA (DeepSeek)",
  UPSTASH_REDIS: "Rate-limit (Upstash)",
  SENTRY: "Monitoring (Sentry)",
};

const fmtF = (n: number) => `${n.toLocaleString("fr-FR")} F`;

export default function AdminOverview() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setStats)
      .catch(() => setError(true));
  }, []);

  const Card = ({ Icon, label, value, sub }: { Icon: typeof Users; label: string; value: number | string; sub?: string }) => (
    <div style={{ background: FV.black2, border: `1px solid ${FV.rule}`, borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: FV.smoke, marginBottom: 12 }}>
        <Icon size={15} color={FV.ember} />
        <span style={{ fontFamily: FV.mono, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase" }}>{label}</span>
      </div>
      <div style={{ fontFamily: FV.serif, fontSize: 32, fontWeight: 500, color: FV.ink, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: FV.smoke, marginTop: 6 }}>{sub}</div>}
    </div>
  );

  if (error) return <div style={{ color: FV.ember, fontSize: 14 }}>Impossible de charger les statistiques.</div>;
  if (!stats) return <div style={{ fontFamily: FV.mono, fontSize: 11, color: FV.smoke, letterSpacing: "0.12em" }}>CHARGEMENT…</div>;

  const maxCount = Math.max(1, ...stats.timeline.map((t) => t.count));
  const verifRate = stats.users.total ? Math.round((stats.users.verified / stats.users.total) * 100) : 0;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: FV.serif, fontSize: isMobile ? 28 : 34, fontWeight: 500, color: FV.ink, margin: 0, letterSpacing: "-0.02em" }}>Vue d'ensemble</h1>
        <p style={{ fontSize: 13, color: FV.smoke, marginTop: 6 }}>État de la forge en temps réel.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 14 }}>
        <Card Icon={Users} label="Utilisateurs" value={stats.users.total} sub={`+${stats.users.new7d} cette semaine`} />
        <Card Icon={BadgeCheck} label="Vérifiés" value={`${verifRate}%`} sub={`${stats.users.verified} / ${stats.users.total}`} />
        <Card Icon={Activity} label="Actifs" value={stats.users.active} sub="≥ 1 conversation" />
        <Card Icon={Shield} label="Admins" value={stats.users.admins} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
        <Card Icon={MessageSquare} label="Conversations" value={stats.content.conversations} />
        <Card Icon={FileText} label="Messages" value={stats.content.messages} />
        <Card Icon={Users} label="Nouveaux 30j" value={stats.users.new30d} />
        <Card Icon={Activity} label="Msg / conv." value={stats.content.conversations ? (stats.content.messages / stats.content.conversations).toFixed(1) : "0"} />
      </div>

      {/* Revenus */}
      <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: "0.18em", marginBottom: 14, textTransform: "uppercase" }}>Revenus</div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
        <Card Icon={Wallet} label="CA total" value={fmtF(stats.revenue?.allTime ?? 0)} sub={`${stats.revenue?.paidCount ?? 0} paiement${(stats.revenue?.paidCount ?? 0) > 1 ? "s" : ""}`} />
        <Card Icon={TrendingUp} label="CA 30 jours" value={fmtF(stats.revenue?.last30d ?? 0)} />
        <Card Icon={Users} label="Clients payants" value={stats.revenue?.payingUsers ?? 0} />
        <Card Icon={BadgeCheck} label="Conversion" value={`${stats.users.total ? Math.round(((stats.revenue?.payingUsers ?? 0) / stats.users.total) * 100) : 0}%`} sub="payants / inscrits" />
      </div>

      {/* Timeline */}
      <div style={{ background: FV.black2, border: `1px solid ${FV.rule}`, borderRadius: 12, padding: "20px", marginBottom: 28 }}>
        <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: "0.15em", marginBottom: 18, textTransform: "uppercase" }}>Inscriptions — 14 derniers jours</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120 }}>
          {stats.timeline.map((t) => (
            <div key={t.day} title={`${t.day} : ${t.count}`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: "100%", height: `${(t.count / maxCount) * 100}%`, minHeight: t.count ? 4 : 1, background: t.count ? `linear-gradient(180deg, ${FV.amber}, ${FV.ember})` : FV.rule, borderRadius: 3, transition: "height 0.3s" }} />
              <span style={{ fontFamily: FV.mono, fontSize: 8, color: FV.smokeDim }}>{t.day.slice(8)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suivi technique */}
      <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: "0.18em", marginBottom: 14, textTransform: "uppercase" }}>Suivi technique</div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
        <div style={{ background: FV.black2, border: `1px solid ${FV.rule}`, borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: FV.ink, marginBottom: 14 }}>Providers LLM configurés</div>
          {stats.tech.providers.length === 0 ? (
            <div style={{ fontSize: 12, color: FV.ember, display: "flex", alignItems: "center", gap: 8 }}><AlertTriangle size={14} /> Aucun provider configuré</div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {stats.tech.providers.map((p) => (
                <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 999, background: "rgba(126,200,160,0.08)", border: "1px solid rgba(126,200,160,0.3)", fontSize: 11, color: "#7EC8A0", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  <Check size={12} /> {p}
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{ background: FV.black2, border: `1px solid ${FV.rule}`, borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: FV.ink, marginBottom: 14 }}>Variables d'environnement</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(stats.tech.envHealth).map(([k, ok]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: FV.ink2 }}>{ENV_LABELS[k] ?? k}</span>
                {ok ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#7EC8A0" }}><Check size={13} /> OK</span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: FV.smoke }}><AlertTriangle size={13} /> Absente</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
