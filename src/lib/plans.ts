// Plan gratuit + packs de crédits payants (modèle : achat ponctuel de documents).
// Devise : FCFA (XOF) — marché ouest-africain (FedaPay).

export const FREE_DOC_LIMIT = 5; // documents PDF gratuits À VIE par compte

// Durée de validité des crédits achetés (packs mensuels). Les crédits expirent
// 31 jours après le dernier rechargement → ils ne s'accumulent pas indéfiniment.
// Les documents gratuits, eux, ne sont jamais affectés (quota à vie).
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
  { id: "starter", label: "Starter", credits: 30, amount: 10500 },   // 350 F/doc
  { id: "pro", label: "Pro", credits: 50, amount: 15000, highlight: true }, // 300 F/doc
  { id: "studio", label: "Studio", credits: 200, amount: 45000 },    // 225 F/doc · choix du modèle IA
];

export function getPack(id: string): Pack | null {
  return PACKS.find((p) => p.id === id) ?? null;
}
