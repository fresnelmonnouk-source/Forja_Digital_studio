// Intégration FedaPay (paiement mobile money / carte — Afrique de l'Ouest).
// API REST. Clé secrète via FEDAPAY_SECRET_KEY (sk_sandbox_... ou sk_live_...).
// Devise : XOF (FCFA).

function base(): string {
  const key = process.env.FEDAPAY_SECRET_KEY || "";
  // Les clés sandbox contiennent "sandbox" → on cible l'API sandbox.
  return key.includes("sandbox") ? "https://sandbox-api.fedapay.com" : "https://api.fedapay.com";
}

function authHeaders() {
  const key = process.env.FEDAPAY_SECRET_KEY;
  if (!key) throw new Error("FEDAPAY_SECRET_KEY manquante.");
  return { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

export function fedapayConfigured(): boolean {
  return !!process.env.FEDAPAY_SECRET_KEY;
}

interface CheckoutParams {
  amount: number; // FCFA
  description: string;
  customerEmail: string;
  customerName?: string | null;
  callbackUrl: string;
}

/**
 * Crée une transaction FedaPay puis génère le lien de paiement hébergé.
 * Renvoie l'id de transaction (à stocker) et l'URL de checkout (redirection).
 */
export async function createCheckout(p: CheckoutParams): Promise<{ transactionId: string; url: string }> {
  // 1) Créer la transaction
  const txRes = await fetch(`${base()}/v1/transactions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      description: p.description,
      amount: p.amount,
      currency: { iso: "XOF" },
      callback_url: p.callbackUrl,
      customer: { firstname: p.customerName || "Client", email: p.customerEmail },
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!txRes.ok) {
    const t = await txRes.text().catch(() => "");
    throw new Error(`FedaPay création transaction ${txRes.status}: ${t.slice(0, 200)}`);
  }
  const txData = await txRes.json();
  const transactionId = String(txData?.["v1/transaction"]?.id ?? txData?.id ?? "");
  if (!transactionId) throw new Error("FedaPay : id de transaction introuvable dans la réponse.");

  // 2) Générer le token / l'URL de paiement
  const tokRes = await fetch(`${base()}/v1/transactions/${transactionId}/token`, {
    method: "POST",
    headers: authHeaders(),
    signal: AbortSignal.timeout(15_000),
  });
  if (!tokRes.ok) {
    const t = await tokRes.text().catch(() => "");
    throw new Error(`FedaPay token ${tokRes.status}: ${t.slice(0, 200)}`);
  }
  const tokData = await tokRes.json();
  const url = tokData?.url as string | undefined;
  if (!url) throw new Error("FedaPay : URL de paiement introuvable.");

  return { transactionId, url };
}

/**
 * Re-vérifie le statut d'une transaction DIRECTEMENT auprès de FedaPay
 * (on ne fait jamais confiance au corps du webhook). Renvoie le statut
 * ("approved", "pending", "declined", "canceled"…) et le montant.
 */
export async function getTransaction(id: string): Promise<{ status: string; amount: number } | null> {
  try {
    const res = await fetch(`${base()}/v1/transactions/${id}`, {
      headers: authHeaders(),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const tx = data?.["v1/transaction"] ?? data;
    if (!tx?.status) return null;
    return { status: String(tx.status), amount: Number(tx.amount ?? 0) };
  } catch {
    return null;
  }
}
