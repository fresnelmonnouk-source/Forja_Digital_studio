"use client";
import { useEffect, useState, useCallback } from "react";
import { FV } from "@/components/ui/fonderie";
import { useMediaQuery } from "@/lib/use-media-query";
import { Wallet, TrendingUp, Users as UsersIcon, Receipt } from "lucide-react";

interface Payment {
  id: string;
  packId: string;
  amount: number;
  credits: number;
  status: string;
  createdAt: string;
  fedapayId: string | null;
  user: { email: string; name: string | null };
}
interface PayData {
  payments: Payment[];
  total: number;
  revenue: { allTime: number; allTimeCount: number; last30d: number; last30dCount: number };
  byPack: { packId: string; label: string; count: number; revenue: number }[];
}

const PAGE = 30;
const fmtF = (n: number) => `${n.toLocaleString("fr-FR")} F`;

const STATUS_STYLE: Record<string, { bg: string; border: string; color: string; label: string }> = {
  approved: { bg: "rgba(126,200,160,0.1)", border: "rgba(126,200,160,0.3)", color: "#7EC8A0", label: "Payé" },
  pending: { bg: "rgba(243,156,44,0.1)", border: "rgba(243,156,44,0.3)", color: "#F39C2C", label: "En attente" },
  declined: { bg: "rgba(238,90,36,0.1)", border: "rgba(238,90,36,0.3)", color: "#EE5A24", label: "Refusé" },
  canceled: { bg: "rgba(122,111,94,0.12)", border: "rgba(122,111,94,0.3)", color: "#7A6F5E", label: "Annulé" },
};

export default function AdminPayments() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [data, setData] = useState<PayData | null>(null);
  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (off: number, status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payments?offset=${off}&limit=${PAGE}${status ? `&status=${status}` : ""}`);
      setData(await res.json());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(offset, filter); }, [offset, filter, load]);

  const fmtDate = (s: string) => new Date(s).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" });

  const StatusBadge = ({ s }: { s: string }) => {
    const st = STATUS_STYLE[s] ?? STATUS_STYLE.canceled;
    return <span style={{ padding: "2px 8px", borderRadius: 999, background: st.bg, border: `1px solid ${st.border}`, fontSize: 10, color: st.color, fontFamily: FV.mono, letterSpacing: "0.06em" }}>{st.label}</span>;
  };

  const Card = ({ Icon, label, value, sub }: { Icon: typeof Wallet; label: string; value: string; sub?: string }) => (
    <div style={{ background: FV.black2, border: `1px solid ${FV.rule}`, borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: FV.smoke, marginBottom: 12 }}>
        <Icon size={15} color={FV.ember} />
        <span style={{ fontFamily: FV.mono, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase" }}>{label}</span>
      </div>
      <div style={{ fontFamily: FV.serif, fontSize: 28, fontWeight: 500, color: FV.ink, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: FV.smoke, marginTop: 6 }}>{sub}</div>}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: FV.serif, fontSize: isMobile ? 28 : 34, fontWeight: 500, color: FV.ink, margin: 0, letterSpacing: "-0.02em" }}>Paiements & revenus</h1>
        <p style={{ fontSize: 13, color: FV.smoke, marginTop: 6 }}>Transactions FedaPay et chiffre d'affaires.</p>
      </div>

      {!data ? (
        <div style={{ fontFamily: FV.mono, fontSize: 11, color: FV.smoke, letterSpacing: "0.12em" }}>CHARGEMENT…</div>
      ) : (
        <>
          {/* KPIs revenus */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 14 }}>
            <Card Icon={Wallet} label="CA total" value={fmtF(data.revenue.allTime)} sub={`${data.revenue.allTimeCount} paiement${data.revenue.allTimeCount > 1 ? "s" : ""}`} />
            <Card Icon={TrendingUp} label="CA 30 jours" value={fmtF(data.revenue.last30d)} sub={`${data.revenue.last30dCount} ce mois`} />
            <Card Icon={Receipt} label="Transactions" value={String(data.total)} sub="toutes statuts" />
            <Card Icon={UsersIcon} label="Panier moyen" value={data.revenue.allTimeCount ? fmtF(Math.round(data.revenue.allTime / data.revenue.allTimeCount)) : "—"} />
          </div>

          {/* Répartition par pack */}
          {data.byPack.some((p) => p.count > 0) && (
            <div style={{ background: FV.black2, border: `1px solid ${FV.rule}`, borderRadius: 12, padding: "18px 20px", marginBottom: 28 }}>
              <div style={{ fontFamily: FV.mono, fontSize: 9, color: FV.smoke, letterSpacing: "0.15em", marginBottom: 16, textTransform: "uppercase" }}>Revenus par pack</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.byPack.map((p) => {
                  const max = Math.max(1, ...data.byPack.map((x) => x.revenue));
                  return (
                    <div key={p.packId}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                        <span style={{ color: FV.ink2 }}>{p.label} <span style={{ color: FV.smoke }}>· {p.count}</span></span>
                        <span style={{ color: FV.ink, fontWeight: 600 }}>{fmtF(p.revenue)}</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 999, background: FV.rule, overflow: "hidden" }}>
                        <div style={{ width: `${(p.revenue / max) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${FV.amber}, ${FV.ember})` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filtre */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {[["", "Tous"], ["approved", "Payés"], ["pending", "En attente"], ["declined", "Refusés"]].map(([val, lbl]) => (
              <button key={val} onClick={() => { setFilter(val); setOffset(0); }} style={{ padding: "6px 12px", borderRadius: 999, fontSize: 12, cursor: "pointer", background: filter === val ? "rgba(238,90,36,0.12)" : "transparent", border: `1px solid ${filter === val ? "rgba(238,90,36,0.3)" : FV.ruleStrong}`, color: filter === val ? FV.ember : FV.ink2 }}>{lbl}</button>
            ))}
          </div>

          {loading ? (
            <div style={{ fontFamily: FV.mono, fontSize: 11, color: FV.smoke, letterSpacing: "0.12em" }}>CHARGEMENT…</div>
          ) : data.payments.length === 0 ? (
            <div style={{ fontFamily: FV.serif, fontStyle: "italic", color: FV.smoke }}>Aucune transaction.</div>
          ) : isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.payments.map((p) => (
                <div key={p.id} style={{ background: FV.black2, border: `1px solid ${FV.rule}`, borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: FV.ink, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.user?.email ?? "—"}</div>
                      <div style={{ fontSize: 11, color: FV.smoke, textTransform: "capitalize" }}>{p.packId} · {p.credits} crédits</div>
                    </div>
                    <StatusBadge s={p.status} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                    <span style={{ fontFamily: FV.serif, fontSize: 18, color: FV.ink }}>{fmtF(p.amount)}</span>
                    <span style={{ fontFamily: FV.mono, fontSize: 10, color: FV.smoke }}>{fmtDate(p.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ border: `1px solid ${FV.rule}`, borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: FV.black2, color: FV.smoke }}>
                    {["Client", "Pack", "Montant", "Crédits", "Statut", "Date"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontFamily: FV.mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((p) => (
                    <tr key={p.id} style={{ borderTop: `1px solid ${FV.rule}` }}>
                      <td style={{ padding: "12px 16px", color: FV.ink2 }}>{p.user?.email ?? "—"}</td>
                      <td style={{ padding: "12px 16px", color: FV.ink, textTransform: "capitalize" }}>{p.packId}</td>
                      <td style={{ padding: "12px 16px", color: FV.ink, fontWeight: 600 }}>{fmtF(p.amount)}</td>
                      <td style={{ padding: "12px 16px", color: FV.ink2 }}>{p.credits}</td>
                      <td style={{ padding: "12px 16px" }}><StatusBadge s={p.status} /></td>
                      <td style={{ padding: "12px 16px", color: FV.smoke, fontFamily: FV.mono, fontSize: 11 }}>{fmtDate(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.total > PAGE && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 20 }}>
              <button onClick={() => setOffset(Math.max(0, offset - PAGE))} disabled={offset === 0} style={{ padding: "8px 14px", borderRadius: 8, background: "transparent", border: `1px solid ${FV.ruleStrong}`, color: offset === 0 ? FV.smokeDim : FV.ink2, cursor: offset === 0 ? "default" : "pointer", fontSize: 12 }}>← Précédent</button>
              <span style={{ fontFamily: FV.mono, fontSize: 11, color: FV.smoke }}>{offset + 1}–{Math.min(offset + PAGE, data.total)} / {data.total}</span>
              <button onClick={() => setOffset(offset + PAGE)} disabled={offset + PAGE >= data.total} style={{ padding: "8px 14px", borderRadius: 8, background: "transparent", border: `1px solid ${FV.ruleStrong}`, color: offset + PAGE >= data.total ? FV.smokeDim : FV.ink2, cursor: offset + PAGE >= data.total ? "default" : "pointer", fontSize: 12 }}>Suivant →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
