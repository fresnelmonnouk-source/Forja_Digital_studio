// Pages légales — contenu éditable depuis le back office (modèle LegalPage),
// avec un contenu par défaut servi tant que l'admin n'a rien personnalisé OU
// si la table n'existe pas encore (déploiement avant migration → pas de crash).
import prisma from "@/lib/prisma";

export const COMPANY = {
  name: "FORJA — Digital Studio",
  legalName: "Forja Digital Studio",
  domain: "myforja.digital",
  url: "https://myforja.digital",
  contact: "aide@myforja.digital",
  privacyContact: "securite@myforja.digital",
};

export interface LegalSlugMeta {
  slug: string;
  title: string;
  navLabel: string; // libellé court (footer / admin)
}

// Source de vérité des pages légales disponibles.
export const LEGAL_PAGES: LegalSlugMeta[] = [
  { slug: "mentions", title: "Mentions légales", navLabel: "Mentions légales" },
  { slug: "cgu", title: "Conditions générales d'utilisation et de vente", navLabel: "CGU / CGV" },
  { slug: "confidentialite", title: "Politique de confidentialité", navLabel: "Confidentialité" },
  { slug: "remboursement", title: "Politique de remboursement", navLabel: "Remboursement" },
];

export function isLegalSlug(slug: string): boolean {
  return LEGAL_PAGES.some((p) => p.slug === slug);
}

export function legalMeta(slug: string): LegalSlugMeta | undefined {
  return LEGAL_PAGES.find((p) => p.slug === slug);
}

// Contenu par défaut (markdown). Volontairement neutre/prudent : aucune mention
// de "30 ans d'expérience" côté site (interdit), pas de promesses de résultat.
const today = "Dernière mise à jour : à compléter par l'éditeur.";

const DEFAULT_CONTENT: Record<string, string> = {
  mentions: `## Éditeur du site

Le site **${COMPANY.domain}** ("${COMPANY.name}") est édité par ${COMPANY.legalName}.

- **Contact** : ${COMPANY.contact}
- **Site** : ${COMPANY.url}

> Coordonnées légales complètes (forme juridique, immatriculation, siège, directeur de publication) à compléter par l'éditeur.

## Hébergement

Le site est hébergé par Vercel Inc. et la base de données par Supabase. Ces prestataires assurent le stockage et la diffusion des contenus.

## Propriété intellectuelle

L'ensemble des éléments du site (marque FORJA, interface, textes, visuels) est protégé. Toute reproduction non autorisée est interdite. Les documents générés par l'utilisateur via l'outil lui appartiennent.

## Responsabilité

FORJA fournit un outil d'assistance à la création de produits digitaux. Les contenus générés par l'IA sont fournis à titre d'aide et doivent être vérifiés par l'utilisateur avant toute exploitation commerciale.`,

  cgu: `## 1. Objet

Les présentes conditions régissent l'accès et l'utilisation de la plateforme ${COMPANY.name}, qui permet de générer des produits digitaux et des documents PDF assistés par intelligence artificielle.

## 2. Compte et accès

La création d'un compte nécessite une adresse email vérifiée. Chaque personne ne peut détenir qu'**un seul compte**. L'utilisation de FORJA est soumise à des quotas anti-abus (limite de messages par heure et par jour). Toute tentative de contournement (multi-comptes, automatisation) peut entraîner la suspension.

## 3. Conversation gratuite et offres payantes

- **Conversation avec FORJA** : entièrement gratuite et illimitée. Tu peux explorer ton idée, valider ton marché et construire ton offre sans rien dépenser.
- **Offres payantes** (Essai, Starter, Pro, Studio) : packs de crédits requis pour exporter ton produit en PDF. Le pack le plus accessible est **Essai** (10 documents pour 3 500 FCFA). Les crédits sont valables 31 jours après l'achat. Les prix sont indiqués en FCFA (XOF).

Les paiements sont traités par notre prestataire **FedaPay**. FORJA ne stocke aucune coordonnée bancaire.

## 4. Utilisation acceptable

L'utilisateur s'engage à ne pas employer le service à des fins illégales, trompeuses ou portant atteinte aux droits de tiers. FORJA peut suspendre tout compte en cas d'abus.

## 5. Disponibilité

Le service est fourni "en l'état". Des interruptions pour maintenance ou raisons techniques peuvent survenir.

## 6. Modification

FORJA peut faire évoluer ces conditions. La version applicable est celle publiée sur le site au moment de l'utilisation.

${today}`,

  confidentialite: `## Données collectées

Nous collectons : email, nom, mot de passe (chiffré), adresse IP d'inscription (anti-fraude), historique de conversations et documents générés, ainsi que les informations de paiement nécessaires au traitement des transactions (via FedaPay).

## Finalités

- Fournir et sécuriser le service.
- Gérer les comptes, quotas et paiements.
- Prévenir la fraude et les abus.
- Améliorer la qualité du produit.

## Sous-traitants

Vos données peuvent transiter par : Supabase (base de données), Vercel (hébergement), Resend (emails transactionnels), FedaPay (paiements), les fournisseurs de modèles d'IA pour le traitement des requêtes, ainsi que — **uniquement après votre consentement explicite** — PostHog (mesure d'audience produit, hébergement UE) et Microsoft Clarity (heatmaps et enregistrements d'usage anonymisés).

## Conservation

Les données sont conservées le temps de la relation contractuelle puis archivées ou supprimées conformément aux obligations légales.

## Vos droits

Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour l'exercer, écrivez à **${COMPANY.privacyContact}**.

## Cookies et mesure d'audience

Le site utilise par défaut **uniquement les cookies strictement nécessaires** à l'authentification et au bon fonctionnement du service. Aucun cookie analytique ou de mesure n'est posé sans votre accord.

Si vous l'acceptez via le bandeau de consentement, deux outils peuvent être activés :

- **PostHog** (hébergement UE) — mesure d'audience produit (pages vues, parcours d'usage). Permet d'améliorer le service. Stockage local côté navigateur.
- **Microsoft Clarity** — heatmaps et enregistrements d'usage anonymisés (les champs sensibles comme les mots de passe sont automatiquement masqués).

Vous pouvez retirer votre consentement à tout moment : votre choix est conservé en local sur votre appareil, et l'arrêt de la collecte est immédiat. Pour exercer ce droit ou toute question, écrivez à **${COMPANY.privacyContact}**.

${today}`,

  remboursement: `## Principe

La discussion avec FORJA est gratuite et illimitée — tu peux juger sur pièce avant tout achat. Pour l'export en PDF, tu paies un pack de crédits (Essai, Starter, Pro ou Studio). Chaque crédit débloque un document PDF.

En raison de la nature numérique et immédiate du service, **les crédits déjà consommés ne sont pas remboursables**.

## Crédits non utilisés

Si tu n'es pas satisfait, écris-nous à **${COMPANY.contact}**. Notre équipe étudie chaque demande au cas par cas et te répond personnellement.

## Problème technique

En cas d'échec de génération imputable à un dysfonctionnement de notre service, le crédit correspondant est recrédité automatiquement ou sur demande.

## Pack Essai

Le pack Essai (3 500 FCFA, 10 documents) est un palier d'entrée disponible **une seule fois par compte**. Au-delà, les autres packs (Starter, Pro, Studio) restent ouverts.

## Traitement

Les remboursements éventuels sont effectués via le même moyen de paiement (FedaPay) que l'achat initial.

${today}`,
};

export function defaultLegalContent(slug: string): string {
  return DEFAULT_CONTENT[slug] ?? "";
}

export interface LegalPageData {
  slug: string;
  title: string;
  content: string;
  updatedAt: Date | null;
  isCustom: boolean; // true si édité en base, false si contenu par défaut
}

/**
 * Récupère une page légale. Si la base n'a pas (encore) de ligne ou si la table
 * n'existe pas (migration non passée), on sert le contenu par défaut sans crash.
 */
export async function getLegalPage(slug: string): Promise<LegalPageData | null> {
  const meta = legalMeta(slug);
  if (!meta) return null;

  try {
    const row = await prisma.legalPage.findUnique({ where: { slug } });
    if (row) {
      return { slug, title: row.title, content: row.content, updatedAt: row.updatedAt, isCustom: true };
    }
  } catch {
    // table absente / erreur DB → fallback silencieux
  }
  return { slug, title: meta.title, content: defaultLegalContent(slug), updatedAt: null, isCustom: false };
}

/** Liste les pages avec leur état (personnalisée ou non) pour le back office. */
export async function listLegalPages(): Promise<LegalPageData[]> {
  let rows: { slug: string; title: string; content: string; updatedAt: Date }[] = [];
  try {
    rows = await prisma.legalPage.findMany();
  } catch {
    rows = [];
  }
  return LEGAL_PAGES.map((meta) => {
    const row = rows.find((r) => r.slug === meta.slug);
    return row
      ? { slug: meta.slug, title: row.title, content: row.content, updatedAt: row.updatedAt, isCustom: true }
      : { slug: meta.slug, title: meta.title, content: defaultLegalContent(meta.slug), updatedAt: null, isCustom: false };
  });
}
