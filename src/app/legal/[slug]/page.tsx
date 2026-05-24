import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { FV, FVMark } from "@/components/ui/fonderie";
import { sanitizeHtml } from "@/lib/pdf/sanitize";
import { getLegalPage, isLegalSlug, LEGAL_PAGES, COMPANY } from "@/lib/legal";

// Régénère à la demande : le contenu vient de la base (éditable par l'admin),
// mais on met en cache au niveau page pour éviter une requête à chaque visite.
export const revalidate = 300;

export function generateStaticParams() {
  return LEGAL_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLegalPage(slug);
  if (!page) return {};
  return {
    title: `${page.title} — ${COMPANY.name}`,
    description: `${page.title} de ${COMPANY.name}.`,
    alternates: { canonical: `/legal/${slug}` },
  };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isLegalSlug(slug)) notFound();

  const page = await getLegalPage(slug);
  if (!page) notFound();

  const html = sanitizeHtml(await marked.parse(page.content));

  return (
    <div style={{ minHeight: "100vh", background: FV.black, fontFamily: FV.sans }}>
      {/* En-tête */}
      <header style={{ borderBottom: `1px solid ${FV.rule}`, padding: "18px 24px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <FVMark size={28} />
            <span style={{ fontFamily: FV.serif, fontSize: 18, fontWeight: 700, color: FV.ink, letterSpacing: "0.14em" }}>FORJA</span>
          </Link>
          <Link href="/" style={{ fontSize: 13, color: FV.smoke, textDecoration: "none" }}>← Retour au site</Link>
        </div>
      </header>

      {/* Contenu */}
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 64px" }}>
        <div style={{ fontFamily: FV.mono, fontSize: 10, color: FV.ember, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14 }}>Légal</div>
        <h1 style={{ fontFamily: FV.serif, fontSize: 36, fontWeight: 500, color: FV.ink, margin: "0 0 8px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>{page.title}</h1>
        {page.updatedAt && (
          <div style={{ fontFamily: FV.mono, fontSize: 11, color: FV.smokeDim, marginBottom: 32 }}>
            Mis à jour le {new Date(page.updatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
          </div>
        )}
        {!page.updatedAt && <div style={{ marginBottom: 32 }} />}

        <article className="legal-prose" dangerouslySetInnerHTML={{ __html: html }} />

        {/* Liens vers les autres pages légales */}
        <nav style={{ marginTop: 56, paddingTop: 24, borderTop: `1px solid ${FV.rule}`, display: "flex", flexWrap: "wrap", gap: 16 }}>
          {LEGAL_PAGES.filter((p) => p.slug !== slug).map((p) => (
            <Link key={p.slug} href={`/legal/${p.slug}`} style={{ fontSize: 13, color: FV.smoke, textDecoration: "none" }}>{p.navLabel}</Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
