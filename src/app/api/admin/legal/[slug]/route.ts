import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";
import { getLegalPage, isLegalSlug, legalMeta } from "@/lib/legal";

// GET : contenu actuel d'une page légale (personnalisé ou par défaut).
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { slug } = await params;
  if (!isLegalSlug(slug)) return NextResponse.json({ error: "Page inconnue" }, { status: 404 });

  const page = await getLegalPage(slug);
  return NextResponse.json(page, { headers: { "Cache-Control": "private, no-store" } });
}

// PUT : enregistre (upsert) le contenu d'une page légale.
export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { slug } = await params;
  if (!isLegalSlug(slug)) return NextResponse.json({ error: "Page inconnue" }, { status: 404 });

  try {
    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content : "";
    if (!title || !content.trim()) {
      return NextResponse.json({ error: "Titre et contenu requis." }, { status: 400 });
    }
    if (content.length > 50_000) {
      return NextResponse.json({ error: "Contenu trop long (50 000 caractères max)." }, { status: 400 });
    }

    const saved = await prisma.legalPage.upsert({
      where: { slug },
      update: { title, content },
      create: { slug, title, content },
    });
    return NextResponse.json({ slug: saved.slug, title: saved.title, content: saved.content, updatedAt: saved.updatedAt, isCustom: true });
  } catch (error) {
    console.error("Erreur admin legal PUT:", error);
    return NextResponse.json(
      { error: "Enregistrement impossible. La table LegalPage existe-t-elle ? (npx prisma db push)" },
      { status: 500 }
    );
  }
}

// DELETE : réinitialise au contenu par défaut (supprime la personnalisation).
export async function DELETE(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { slug } = await params;
  if (!isLegalSlug(slug)) return NextResponse.json({ error: "Page inconnue" }, { status: 404 });

  try {
    await prisma.legalPage.delete({ where: { slug } }).catch(() => {});
  } catch {
    // déjà absent → rien à faire
  }
  const meta = legalMeta(slug)!;
  const page = await getLegalPage(slug);
  return NextResponse.json(page ?? { slug, title: meta.title, content: "", updatedAt: null, isCustom: false });
}
