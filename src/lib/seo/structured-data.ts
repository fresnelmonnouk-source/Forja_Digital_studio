// Données structurées Schema.org (JSON-LD) pour le référencement.
// Source de vérité unique : la FAQ ci-dessous alimente À LA FOIS la section
// visible de la landing ET le schéma FAQPage (Google exige la correspondance).
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_TAGLINE } from "@/lib/site";
import { PACKS } from "@/lib/plans";

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Qu'est-ce que FORJA ?",
    answer:
      "FORJA est ton atelier pour transformer une idée en vrai produit digital — ebook, formation, page de vente. Tu discutes gratuitement avec lui pour construire ton offre, et quand tu es prêt, il te livre un PDF professionnel prêt à vendre.",
  },
  {
    question: "FORJA est-il gratuit ?",
    answer:
      "La conversation avec FORJA est entièrement gratuite et illimitée — tu peux explorer ton idée, valider ton marché et construire ton offre sans rien dépenser. Pour exporter ton produit en PDF prêt à vendre, choisis un pack à partir de 3 500 FCFA (pack Essai, 10 documents).",
  },
  {
    question: "Combien coûtent les packs FORJA ?",
    answer:
      "Le pack Essai démarre à 3 500 FCFA pour 10 documents (palier d'entrée). Le pack Starter offre 30 documents pour 10 500 FCFA, le pack Pro 50 documents pour 15 000 FCFA, et le pack Studio 200 documents pour 45 000 FCFA avec en plus le choix du modèle d'IA.",
  },
  {
    question: "Comment se passe le paiement ?",
    answer:
      "Les paiements sont traités de façon sécurisée par FedaPay (mobile money et cartes), en francs CFA (XOF). FORJA ne stocke aucune coordonnée bancaire.",
  },
  {
    question: "À qui appartiennent les documents générés ?",
    answer:
      "Les documents que tu crées avec FORJA t'appartiennent intégralement. Tu es libre de les vendre et de les diffuser.",
  },
  {
    question: "Ai-je besoin de compétences techniques ?",
    answer:
      "Non. FORJA t'accompagne par la conversation, étape par étape. Tu décris ton idée, l'agent fait le reste : structure, contenu, mise en page et export PDF.",
  },
  {
    question: "En quoi FORJA est différent d'une formation ?",
    answer:
      "Une formation t'explique quoi faire, puis te laisse seul devant la page blanche. FORJA travaille avec toi et te rend un livrable fini : un PDF professionnel prêt à vendre, à la fin de la session. Tu ne repars pas avec des notes — tu repars avec ton produit.",
  },
  {
    question: "Et si je ne suis pas satisfait ?",
    answer:
      "La discussion avec FORJA est gratuite et illimitée — tu peux juger sur pièce avant d'investir dans un pack. Sur les packs payants, c'est satisfait ou remboursé : notre équipe traite chaque demande au cas par cas, par email à aide@myforja.digital.",
  },
];

type JsonLdObject = Record<string, unknown>;

export function organizationSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: "FORJA",
    url: SITE_URL,
    logo: `${SITE_URL}/opengraph-image`,
    description: SITE_DESCRIPTION,
    slogan: SITE_TAGLINE,
    email: "aide@myforja.digital",
  };
}

export function websiteSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "fr-FR",
    description: SITE_DESCRIPTION,
  };
}

// Application logicielle + offres (alignées sur les packs réels).
export function softwareAppSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    offers: PACKS.map((p) => ({
      "@type": "Offer",
      name: `Pack ${p.label}`,
      price: String(p.amount),
      priceCurrency: "XOF",
      category: "PaymentService",
      description: `${p.credits} documents PDF (achat ponctuel, crédits valables 31 jours)`,
    })),
  };
}

export function faqSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
