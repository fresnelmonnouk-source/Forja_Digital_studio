"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { FV, FVMark } from "@/components/ui/fonderie";
import { useMediaQuery } from "@/lib/use-media-query";
import { LayoutDashboard, Users, LogOut, MessageSquare } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Vue d'ensemble", Icon: LayoutDashboard },
  { href: "/admin/users", label: "Utilisateurs", Icon: Users },
];

export default function AdminShell({ userName, children }: { userName: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const NavLinks = ({ row }: { row: boolean }) => (
    <div style={{ display: "flex", flexDirection: row ? "row" : "column", gap: row ? 6 : 4 }}>
      {NAV.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: row ? "8px 12px" : "10px 12px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: active ? 600 : 500, color: active ? FV.ember : FV.ink2, background: active ? "rgba(238,90,36,0.1)" : "transparent", border: `1px solid ${active ? "rgba(238,90,36,0.25)" : "transparent"}`, whiteSpace: "nowrap" }}>
            <Icon size={16} /> {label}
          </Link>
        );
      })}
    </div>
  );

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: FV.black, fontFamily: FV.sans, color: FV.ink, display: "flex", flexDirection: isMobile ? "column" : "row" }}>
      {/* Sidebar (desktop) / Topbar (mobile) */}
      {isMobile ? (
        <div style={{ borderBottom: `1px solid ${FV.rule}`, background: FV.black2, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FVMark size={28} />
              <div>
                <div style={{ fontFamily: FV.serif, fontSize: 16, fontWeight: 700, letterSpacing: "0.14em" }}>FORJA</div>
                <div style={{ fontFamily: FV.mono, fontSize: 8, color: FV.ember, letterSpacing: "0.2em" }}>BACK OFFICE</div>
              </div>
            </div>
            <button onClick={() => signOut({ callbackUrl: "/" })} title="Déconnexion" style={{ background: "transparent", border: `1px solid ${FV.ruleStrong}`, borderRadius: 7, color: FV.smoke, cursor: "pointer", padding: 7, display: "flex", alignItems: "center" }}><LogOut size={15} /></button>
          </div>
          <div style={{ overflowX: "auto" }}><NavLinks row /></div>
        </div>
      ) : (
        <div style={{ width: 230, flexShrink: 0, borderRight: `1px solid ${FV.rule}`, background: FV.black2, display: "flex", flexDirection: "column", padding: "20px 14px", position: "sticky", top: 0, height: "100vh" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 18px", borderBottom: `1px solid ${FV.rule}`, marginBottom: 16 }}>
            <FVMark size={30} />
            <div>
              <div style={{ fontFamily: FV.serif, fontSize: 18, fontWeight: 700, letterSpacing: "0.14em" }}>FORJA</div>
              <div style={{ fontFamily: FV.mono, fontSize: 8, color: FV.ember, letterSpacing: "0.2em" }}>BACK OFFICE</div>
            </div>
          </div>
          <NavLinks row={false} />
          <div style={{ marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${FV.rule}` }}>
            <Link href="/chat" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, textDecoration: "none", fontSize: 13, color: FV.ink2 }}>
              <MessageSquare size={16} /> Retour au chat
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px" }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: `linear-gradient(135deg, ${FV.amber}, ${FV.emberDeep})`, color: FV.black, fontFamily: FV.serif, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{userName.charAt(0).toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: FV.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</div>
                <div style={{ fontFamily: FV.mono, fontSize: 8, color: FV.ember, letterSpacing: "0.1em" }}>ADMIN</div>
              </div>
              <button onClick={() => signOut({ callbackUrl: "/" })} title="Déconnexion" style={{ background: "transparent", border: "none", color: FV.smoke, cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}><LogOut size={15} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, padding: isMobile ? "20px 16px" : "32px 36px", overflowX: "hidden" }}>
        {children}
      </div>
    </div>
  );
}
