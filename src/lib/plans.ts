// Plan gratuit + packs de crédits payants (modèle : achat ponctuel de documents).
// Devise : FCFA (XOF) — marché ouest-africain (FedaPay).

export const FREE_DOC_LIMIT = 5; // documents PDF gratuits À VIE par compte

export interface Pack {
  id: string;
  label: string;
  credits: number; // nombre de documents débloqués
  amount: number; // prix en FCFA (XOF)
  highlight?: boolean;
}

// ⚠️ TODO Fresnel : ajuste les prix/crédits selon ta stratégie.
export const PACKS: Pack[] = [
  { id: "starter", label: "Starter", credits: 10, amount: 2000 },
  { id: "pro", label: "Pro", credits: 30, amount: 5000, highlight: true },
  { id: "studio", label: "Studio", credits: 100, amount: 12000 },
];

export function getPack(id: string): Pack | null {
  return PACKS.find((p) => p.id === id) ?? null;
}
