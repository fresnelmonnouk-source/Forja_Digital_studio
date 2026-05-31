// Packs de crédits payants (modèle : achat ponctuel de documents).
// Devise : FCFA (XOF) — marché ouest-africain (FedaPay).
//
// IMPORTANT — Pivot pricing 2026-05-31 :
//   La discussion avec l'agent FORJA est désormais 100% gratuite et illimitée.
//   En revanche, l'EXPORT PDF nécessite un pack payant (palier d'entrée = "Essai"
//   à 3 500 F / 10 docs). Donc FREE_DOC_LIMIT = 0 (plus aucun PDF gratuit).
//   La logique quota.ts gère nativement ce cas (max(0, 0 - freeDocsUsed) = 0).
//   Les anciens comptes qui avaient des freeDocsUsed historiques voient leur
//   quota gratuit à 0 (aligné avec la nouvelle politique).
export const FREE_DOC_LIMIT = 0;

// Durée de validité des crédits achetés. Les crédits expirent 31 jours après
// le dernier rechargement → ils ne s'accumulent pas indéfiniment.
export const CREDIT_VALIDITY_DAYS = 31;

/** Date d'expiration des crédits à partir d'une date de rechargement. */
export function creditExpiryDate(from: Date = new Date()): Date {
  return new Date(from.getTime() + CREDIT_VALIDITY_DAYS * 24 * 3600_000);
}

export interface Pack {
  id: string;
  label: string;
  credits: number; // nombre de documents débloqués
  amount: number; // prix en FCFA (XOF)
  highlight?: boolean;
}

// Plans mensuels (prix /mois, renouvellement manuel). Seul "studio" débloque
// le choix du modèle IA (sinon DeepSeek par défaut).
export const PACKS: Pack[] = [
  { id: "essai", label: "Essai", credits: 10, amount: 3500 },        // 350 F/doc · palier d'entrée
  { id: "starter", label: "Starter", credits: 30, amount: 10500 },   // 350 F/doc
  { id: "pro", label: "Pro", credits: 50, amount: 15000, highlight: true }, // 300 F/doc
  { id: "studio", label: "Studio", credits: 200, amount: 45000 },    // 225 F/doc · choix du modèle IA
];

export function getPack(id: string): Pack | null {
  return PACKS.find((p) => p.id === id) ?? null;
}
