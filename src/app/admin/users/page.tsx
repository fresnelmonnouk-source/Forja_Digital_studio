"use client";
import { useEffect, useState, useCallback } from "react";
import { FV } from "@/components/ui/fonderie";
import { useMediaQuery } from "@/lib/use-media-query";
import { Search, ShieldCheck, ShieldOff, Trash2, BadgeCheck, Clock, Coins, RotateCcw } from "lucide-react";
import { FREE_DOC_LIMIT } from "@/lib/plans";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  credits: number;
  freeDocsUsed: number;
  emailVerified: string | null;
  createdAt: string;
  _count: { conversations: number };
}

const PAGE = 25;

export default function AdminUsers() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async (search: string, off: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(search)}&offset=${off}&limit=${PAGE}`);
      const data = await res.json();
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(q, offset); }, [offset, load]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSearch = (e: React.FormEvent) => { e.preventDefault(); setOffset(0); load(q, 0); };

  const toggleRole = async (u: AdminUser) => {
    const next = u.role === "admin" ? "user" : "admin";
    setBusy(u.id);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: next }),
      });
      if (res.ok) setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, role: next } : x)));
      else { const d = await res.json().catch(() => ({})); alert(d.error || "Action impossible."); }
    } finally { setBusy(null); }
  };

  const adjustCredits = async (u: AdminUser) => {
    const raw = prompt(`Crédits à ajouter pour ${u.email} (négatif pour retirer).\nSolde actuel : ${u.credits}`, "10");
    if (raw === null) return;
    const delta = parseInt(raw, 10);
    if (!Number.isInteger(delta) || delta === 0) { alert("Entre un entier non nul."); return; }
    setBusy(u.id);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ addCredits: delta }),
      });
      const d = await res.json();
      if (res.ok) setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, credits: d.credits } : x)));
      else alert(d.error || "Action impossible.");
    } finally { setBusy(null); }
  };

  const resetFree = async (u: AdminUser) => {
    if (!confirm(`Réinitialiser le quota gratuit de ${u.email} ? Il pourra à nouveau générer ${FREE_DOC_LIMIT} documents gratuits.`)) return;
    setBusy(u.id);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resetFreeDocs: true }),
      });
      const d = await res.json();
      if (res.ok) setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, freeDocsUsed: d.freeDocsUsed } : x)));
      else alert(d.error || "Action impossible.");
    } finally { setBusy(null); }
  };

  const removeUser = async (u: AdminUser) => {
    if (!confirm(`Supprimer ${u.email} ? Ses conversations seront effacées. Action irréversible.`)) return;
    setBusy(u.id);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
      if (res.ok) { setUsers((list) => list.filter((x) => x.id !== u.id)); setTotal((t) => t - 1); }
      else { const d = await res.json().catch(() => ({})); alert(d.error || "Suppression impossible."); }
    } finally { setBusy(null); }
  };

  const fmtDate = (s: string) => new Date(s).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "2-digit" });

  const RoleBadge = ({ role }: { role: string }) =>
    role === "admin" ? (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, background: "rgba(238,90,36,0.12)", border: "1px solid rgba(238,90,36,0.3)", fontSize: 10, color: FV.ember, fontFamily: FV.mono, letterSpacing: "0.08em" }}>ADMIN</span>
    ) : (
      <span style={{ fontSize: 10, color: FV.smoke, fontFamily: FV.mono, letterSpacing: "0.08em" }}>USER</span>
    );

  const Actions = ({ u }: { u: AdminUser }) => (
    <div style={{ display: "flex", gap: 6 }}>
      <button type="button" onClick={() => adjustCredits(u)} disabled={busy === u.id} title="Ajuster les crédits" style={{ display: "inline-flex", alignItems: "center", padding: "6px 9px", borderRadius: 7, background: "transparent", border: `1px solid ${FV.ruleStrong}`, color: FV.amber, cursor: "pointer" }}>
        <Coins size={13} />
      </button>
      <button type="button" onClick={() => resetFree(u)} disabled={busy === u.id} title="Réinitialiser le quota gratuit" style={{ display: "inline-flex", alignItems: "center", padding: "6px 9px", borderRadius: 7, background: "transparent", border: `1px solid ${FV.ruleStrong}`, color: FV.ink2, cursor: "pointer" }}>
        <RotateCcw size={13} />
      </button>
      <button type="button" onClick={() => toggleRole(u)} disabled={busy === u.id} title={u.role === "admin" ? "Rétrograder en user" : "Promouvoir admin"} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 9px", borderRadius: 7, background: "transparent", border: `1px solid ${FV.ruleStrong}`, color: FV.ink2, cursor: "pointer", fontSize: 11 }}>
        {u.role === "admin" ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
      </button>
      <button type="button" onClick={() => removeUser(u)} disabled={busy === u.id} title="Supprimer" style={{ display: "inline-flex", alignItems: "center", padding: "6px 9px", borderRadius: 7, background: "transparent", border: "1px solid rgba(238,90,36,0.3)", color: FV.ember, cursor: "pointer" }}>
        <Trash2 size={13} />
      </button>
    </div>
  );

  const CreditCell = ({ u }: { u: AdminUser }) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: u.credits > 0 ? FV.amber : FV.smoke }}>
      <Coins size={12} /> {u.credits}
      <span style={{ color: FV.smokeDim, fontFamily: FV.mono, fontSize: 10 }}>· {u.freeDocsUsed}/{FREE_DOC_LIMIT}</span>
    </span>
  );

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: FV.serif, fontSize: isMobile ? 28 : 34, fontWeight: 500, color: FV.ink, margin: 0, letterSpacing: "-0.02em" }}>Utilisateurs</h1>
        <p style={{ fontSize: 13, color: FV.smoke, marginTop: 6 }}>{total} compte{total > 1 ? "s" : ""} au total.</p>
      </div>

      {/* Search */}
      <form onSubmit={onSearch} style={{ display: "flex", gap: 8, marginBottom: 18, maxWidth: 460 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: FV.black2, border: `1px solid ${FV.ruleStrong}`, borderRadius: 8, padding: "9px 12px" }}>
          <Search size={15} color={FV.smoke} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher par email ou nom…" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: FV.ink, fontSize: 13, fontFamily: FV.sans }} />
        </div>
        <button type="submit" style={{ background: FV.ember, color: FV.black, border: "none", padding: "0 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>OK</button>
      </form>

      {loading ? (
        <div style={{ fontFamily: FV.mono, fontSize: 11, color: FV.smoke, letterSpacing: "0.12em" }}>CHARGEMENT…</div>
      ) : users.length === 0 ? (
        <div style={{ fontFamily: FV.serif, fontStyle: "italic", color: FV.smoke }}>Aucun utilisateur trouvé.</div>
      ) : isMobile ? (
        /* Cartes (mobile) */
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {users.map((u) => (
            <div key={u.id} style={{ background: FV.black2, border: `1px solid ${FV.rule}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: FV.ink, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name || "—"}</div>
                  <div style={{ fontSize: 12, color: FV.smoke, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                </div>
                <RoleBadge role={u.role} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "12px 0", fontSize: 11, color: FV.smoke, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{u.emailVerified ? <BadgeCheck size={13} color="#7EC8A0" /> : <Clock size={13} />} {u.emailVerified ? "Vérifié" : "En attente"}</span>
                <CreditCell u={u} />
                <span>{u._count.conversations} conv.</span>
                <span>{fmtDate(u.createdAt)}</span>
              </div>
              <Actions u={u} />
            </div>
          ))}
        </div>
      ) : (
        /* Tableau (desktop) */
        <div style={{ border: `1px solid ${FV.rule}`, borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: FV.black2, color: FV.smoke }}>
                {["Nom", "Email", "Rôle", "Vérifié", "Crédits", "Conv.", "Inscrit", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontFamily: FV.mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderTop: `1px solid ${FV.rule}` }}>
                  <td style={{ padding: "12px 16px", color: FV.ink, fontWeight: 500 }}>{u.name || "—"}</td>
                  <td style={{ padding: "12px 16px", color: FV.ink2 }}>{u.email}</td>
                  <td style={{ padding: "12px 16px" }}><RoleBadge role={u.role} /></td>
                  <td style={{ padding: "12px 16px" }}>{u.emailVerified ? <BadgeCheck size={15} color="#7EC8A0" /> : <Clock size={15} color={FV.smoke} />}</td>
                  <td style={{ padding: "12px 16px" }}><CreditCell u={u} /></td>
                  <td style={{ padding: "12px 16px", color: FV.ink2 }}>{u._count.conversations}</td>
                  <td style={{ padding: "12px 16px", color: FV.smoke, fontFamily: FV.mono, fontSize: 11 }}>{fmtDate(u.createdAt)}</td>
                  <td style={{ padding: "12px 16px" }}><Actions u={u} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > PAGE && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 20 }}>
          <button onClick={() => setOffset(Math.max(0, offset - PAGE))} disabled={offset === 0} style={{ padding: "8px 14px", borderRadius: 8, background: "transparent", border: `1px solid ${FV.ruleStrong}`, color: offset === 0 ? FV.smokeDim : FV.ink2, cursor: offset === 0 ? "default" : "pointer", fontSize: 12 }}>← Précédent</button>
          <span style={{ fontFamily: FV.mono, fontSize: 11, color: FV.smoke }}>{offset + 1}–{Math.min(offset + PAGE, total)} / {total}</span>
          <button onClick={() => setOffset(offset + PAGE)} disabled={offset + PAGE >= total} style={{ padding: "8px 14px", borderRadius: 8, background: "transparent", border: `1px solid ${FV.ruleStrong}`, color: offset + PAGE >= total ? FV.smokeDim : FV.ink2, cursor: offset + PAGE >= total ? "default" : "pointer", fontSize: 12 }}>Suivant →</button>
        </div>
      )}
    </div>
  );
}
