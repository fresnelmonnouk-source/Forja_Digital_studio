import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { listLegalPages } from "@/lib/legal";

// GET : liste toutes les pages légales avec leur état (par défaut / personnalisée).
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const pages = await listLegalPages();
  return NextResponse.json({ pages }, { headers: { "Cache-Control": "private, no-store" } });
}
